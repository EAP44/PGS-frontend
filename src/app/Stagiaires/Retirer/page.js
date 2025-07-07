"use client";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  UserX,
  Calendar,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  RefreshCw,
  X,
  Trash2,
} from "lucide-react";
import Sidebar from "@/component/UI/Sidebar";

export default function StagiairesRejetes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rejectedInterns, setRejectedInterns] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("dateRejected");
  const [filterBy, setFilterBy] = useState("all");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    intern: null,
  });

  // Fetch rejected interns
  const fetchRejectedInterns = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/Stagiaires/deleted", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rejected interns");
      }

      const data = await response.json();
      setRejectedInterns(data || []);
    } catch (err) {
      console.error("Error fetching rejected interns:", err);
      setError("Erreur lors du chargement des stagiaires rejetés");
      setRejectedInterns([]);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/auth/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setUserProfile(data.user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setUserProfile(null);
    }
  };

  // Restore intern status
  const restoreIntern = async (internId) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`/api/Stagiaire/restore/${internId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to restore intern");
      }

      // Refresh the list
      await fetchRejectedInterns();
    } catch (err) {
      console.error("Error restoring intern:", err);
      setError("Erreur lors de la restauration du stagiaire");
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

  // Permanently delete intern
  const deleteIntern = async () => {
    if (!deleteModal.intern) return;

    try {
      const token = Cookies.get("token");
      const response = await fetch(`/api/Stagiaire/${deleteModal.intern._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete intern");
      }

      // Refresh the list
      await fetchRejectedInterns();
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting intern:", err);
      setError("Erreur lors de la suppression du stagiaire");
    }
  };

  // Page Effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRejectedInterns(), fetchUserProfile()]);
      setLoading(false);
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    };

    loadData();
  }, []);

  // Filter and sort interns
  const filteredAndSortedInterns = rejectedInterns
    .filter((intern) => {
      const matchesSearch =
        intern.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterBy === "all") return matchesSearch;
      if (filterBy === "recent") {
        const rejectedDate = new Date(intern.dateRejected);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return matchesSearch && rejectedDate >= thirtyDaysAgo;
      }
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "dateRejected") {
        return new Date(b.dateRejected) - new Date(a.dateRejected);
      }
      if (sortBy === "name") {
        return a.nom.localeCompare(b.nom);
      }
      return 0;
    });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
                  <h3 className="text-lg font-medium text-gray-900">
                    Supprimer définitivement
                  </h3>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Êtes-vous sûr de vouloir supprimer définitivement{" "}
                  <span className="font-semibold text-gray-900">
                    {deleteModal.intern?.nom} {deleteModal.intern?.prenom}
                  </span>{" "}
                  ? Cette action est irréversible et toutes les données
                  associées seront perdues.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={deleteIntern}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Supprimer
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserX className="w-6 h-6 text-red-600" />
                <h1 className="text-2xl font-semibold text-gray-900">
                  Stagiaires Rejetés
                </h1>
              </div>
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm font-medium">
                {filteredAndSortedInterns.length}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un stagiaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all w-80"
                />
              </div>
              <button
                onClick={() => fetchRejectedInterns()}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 transform transition-all duration-700 ease-out ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Tous les stagiaires rejetés</option>
                  <option value="recent">Rejetés récemment (30 jours)</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="dateRejected">Trier par date de rejet</option>
                  <option value="name">Trier par nom</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                {filteredAndSortedInterns.length} stagiaire(s) trouvé(s)
              </div>
            </div>
          </div>

          {/* Interns List */}
          <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 transform transition-all duration-700 ease-out ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            {rejectedInterns.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <UserX className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun stagiaire rejeté
                </h3>
                <p className="text-gray-500">
                  {error
                    ? "Impossible de charger les données."
                    : "Aucun stagiaire n'a été rejeté pour le moment."}
                </p>
              </div>
            ) : filteredAndSortedInterns.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat
                </h3>
                <p className="text-gray-500">
                  Aucun stagiaire ne correspond à votre recherche "{searchTerm}
                  ".
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stagiaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de rejet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Raison
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedInterns.map((intern, index) => (
                      <tr
                        key={intern._id}
                        className={`hover:bg-gray-50 transform transition-all duration-500 ease-out ${
                          isLoaded
                            ? "translate-x-0 opacity-100"
                            : "translate-x-4 opacity-0"
                        }`}
                        style={{
                          transitionDelay: `${800 + index * 100}ms`,
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-red-600 font-medium text-sm">
                                  {intern.nom.charAt(0)}
                                  {intern.prenom.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {intern.nom} {intern.prenom}
                              </div>
                              <div className="text-sm text-gray-500">
                                {intern.specialite || "Spécialité non définie"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center space-x-1">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span>{intern.email}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{intern.phoneNumber || "Non renseigné"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                            {formatDate(intern.deletedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                            <span className="text-sm text-red-600">
                              {intern.rejectionReason || "Raison non spécifiée"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => restoreIntern(intern._id)}
                              className="bg-green-100 text-green-600 px-3 py-1 rounded-s text-xs hover:bg-green-200 transition-all duration-200 transform hover:scale-105"
                            >
                              Restaurer
                            </button>
                            <button
                              onClick={() => openDeleteModal(intern)}
                              className="bg-red-100 text-red-600 px-3 py-1 rounded-s text-xs hover:bg-red-200 transition-all duration-200 transform hover:scale-105"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
