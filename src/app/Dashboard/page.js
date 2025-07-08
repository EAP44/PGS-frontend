"use client";
import Cookies from "js-cookie";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Users,
  BookOpen,
  Loader2,
  Trash2,
} from "lucide-react";
import DownloadReport from "@/component/services/DownloadReport";
import Sidebar from "@/component/UI/Sidebar";
import { useSearchParams, useRouter } from "next/navigation";

export default function InternshipDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [pendingInterns, setPendingInterns] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    intern: null,
  });

  // Memoized function to get token
  const getToken = useCallback(() => {
    let token = Cookies.get("token");
    if (!token) {
      const urlToken = searchParams.get("token");
      if (urlToken) {
        Cookies.set("token", urlToken, { expires: 7 }); // Set expiration
        token = urlToken;
      }
    }
    return token;
  }, [searchParams]);

  // Fetch data functions
  const fetchUserProfile = useCallback(async (token) => {
    const response = await fetch("/auth/user/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Profile fetch failed: ${response.status}`);
    }
    return response.json();
  }, []);

  const fetchPendingInterns = useCallback(async (token) => {
    const response = await fetch("/api/stagiaires/en-attente", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Pending interns fetch failed: ${response.status}`);
    }
    return response.json();
  }, []);

  const fetchStats = useCallback(async (token) => {
    const response = await fetch("/api/dashboard/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Stats fetch failed: ${response.status}`);
    }
    return response.json();
  }, []);

  // Load all data
  const loadAllData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/Login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [profileData, pendingData, statsData] = await Promise.all([
        fetchUserProfile(token),
        fetchPendingInterns(token),
        fetchStats(token),
      ]);

      setUserProfile(profileData.user);
      setPendingInterns(Array.isArray(pendingData) ? pendingData : []);
      setStats([
        {
          value: statsData.totalInterns || 0,
          label: "Nombre total de stagiaires",
          color: "bg-purple-100 text-purple-600",
        },
        {
          value: statsData.totalSupervisors || 0,
          label: "Nombre d'encadrants",
          color: "bg-blue-100 text-blue-600",
        },
        {
          value: statsData.activeInternships || 0,
          label: "Stages en cours",
          color: "bg-green-100 text-green-600",
        },
        {
          value: statsData.pendingInterns || 0,
          label: "Stagiaires en attente de validation",
          color: "bg-orange-100 text-orange-600",
        },
      ]);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Erreur lors du chargement des données. Veuillez réessayer.");
      setUserProfile(null);
      setPendingInterns([]);
      setStats([]);
    } finally {
      setLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [getToken, router, fetchUserProfile, fetchPendingInterns, fetchStats]);

  // Page Effect
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Filter interns
  const filteredInterns = pendingInterns.filter(
    (intern) =>
      intern?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // DetailsStagiaire  stagiaire
  const GoToDetailsStagiaire = async (stagiaireId) => {
    router.push(`/Stagiaires/${stagiaireId}`);
  };

  // Delete stagiaire
  const deleteStagiaire = async () => {
    if (!deleteModal.intern || isUpdating) return;

    setIsUpdating(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        router.push("/Login");
        return;
      }

      const response = await fetch(
        `/api/Stagiaire/soft-delete/${deleteModal.intern._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      // Remove the intern from pending list instead of full page reload
      setPendingInterns((prev) =>
        prev.filter((intern) => intern._id !== deleteModal.intern._id)
      );

      // Update stats
      setStats((prev) =>
        prev.map((stat) => {
          if (stat.label === "Stagiaires en attente de validation") {
            return { ...stat, value: Math.max(0, stat.value - 1) };
          }
          return stat;
        })
      );

      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting stagiaire:", err);
      setError(
        "Erreur lors de la suppression du stagiaire. Veuillez réessayer."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (intern) => {
    setDeleteModal({ isOpen: true, intern });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, intern: null });
  };

  // Handle download report with error handling
  const handleDownloadReport = async (format) => {
    try {
      await DownloadReport(format);
    } catch (err) {
      console.error("Error downloading report:", err);
      setError("Erreur lors du téléchargement du rapport. Veuillez réessayer.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-lg font-medium text-gray-600">
            Chargement...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Error */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/10 pointer-events-none"></div>

          <div className="relative z-10 bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Rejeter</h3>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Êtes-vous sûr de vouloir rejeter{" "}
                  <span className="font-semibold text-gray-900">
                    {deleteModal.intern?.nom} {deleteModal.intern?.prenom}
                  </span>{" "}
                  ?
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={deleteStagiaire}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Rejeter"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar isLoaded={isLoaded} userProfile={userProfile} />

      <div className="flex-1 flex flex-col ml-64">
        <header
          className={`bg-white shadow-sm border-b border-gray-200 px-6 py-4 transform transition-all duration-700 ease-out ${
            isLoaded
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Tableau de bord
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Recherche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <Link href="/Stagiaires/Ajouter">
                <button className="bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105">
                  Ajouter
                </button>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.length === 0 ? (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Users className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Statistiques indisponibles
                </h3>
                <p className="text-gray-500">
                  Impossible de charger les statistiques du tableau de bord.
                </p>
              </div>
            ) : (
              stats.map((stat, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform transition-all duration-700 ease-out hover:shadow-md hover:scale-105 ${
                    isLoaded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                  style={{ transitionDelay: `${400 + index * 150}ms` }}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mr-4 transform transition-all duration-300 hover:scale-110`}
                    >
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className={`lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 transform transition-all duration-700 ease-out ${
                isLoaded
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
              style={{ transitionDelay: "1000ms" }}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Stagiaires en attente ({filteredInterns.length})
                </h2>
              </div>
              {pendingInterns.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <BookOpen className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun stagiaire en attente
                  </h3>
                  <p className="text-gray-500">
                    {error
                      ? "Impossible de charger les données."
                      : "Tous les stagiaires ont été traités."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Numéro de téléphone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInterns.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            Aucun résultat pour "{searchTerm}"
                          </td>
                        </tr>
                      ) : (
                        filteredInterns.map((intern, index) => (
                          <tr
                            key={intern._id}
                            className={`hover:bg-gray-50 transform transition-all duration-500 ease-out ${
                              isLoaded
                                ? "translate-x-0 opacity-100"
                                : "translate-x-4 opacity-0"
                            }`}
                            style={{
                              transitionDelay: `${1200 + index * 100}ms`,
                            }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {intern.nom} {intern.prenom}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {intern.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {intern.phoneNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    GoToDetailsStagiaire(intern._id)
                                  }
                                  className="bg-blue-100 text-blue-600 px-3 py-1 rounded-s text-xs hover:bg-blue-200 transition-all duration-200 transform hover:scale-105"
                                >
                                  détails
                                </button>
                                <button
                                  onClick={() => openDeleteModal(intern)}
                                  className="bg-red-100 text-red-600 px-3 py-1 rounded-s text-xs hover:bg-red-200 transition-all duration-200 transform hover:scale-105"
                                >
                                  Rejeter
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform transition-all duration-700 ease-out ${
                isLoaded
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
              style={{ transitionDelay: "1100ms" }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Télécharger un rapport
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => DownloadReport("pdf")}
                  className={`w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 ${
                    isLoaded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: "1300ms" }}
                >
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Télécharger un rapport PDF
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => DownloadReport("excel")}
                  className={`w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 ${
                    isLoaded
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: "1400ms" }}
                >
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">
                      Télécharger un rapport Excel
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
