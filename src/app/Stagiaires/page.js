"use client";
import Image from "next/image";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Download,
  Users,
  BookOpen,
  User,
  Settings,
  Trash2,
  LogOut,
  Loader2,
  Plus,
  Edit,
  Eye,
  Filter,
  ChevronDown,
  Calendar,
  Mail,
  Phone,
  Building,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/component/UI/Sidebar";

export default function Stagiaire() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stagiaires, setStagiaires] = useState([]);
  const [filteredStagiaires, setFilteredStagiaires] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("nom");
  const [sortOrder, setSortOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();
  const [rejectedInterns, setRejectedInterns] = useState([]);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    intern: null,
  });

  // Fetch all stagiaires
  const fetchStagiaires = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/Stagiaires/list?isDeleted=false", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stagiaires");
      }

      const data = await response.json();
      setStagiaires(data || []);
      setFilteredStagiaires(data || []);
    } catch (err) {
      console.error("Error fetching stagiaires:", err);
      setError("Erreur lors du chargement des stagiaires");
      setStagiaires([]);
      setFilteredStagiaires([]);
    }
  };

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

  // Update stagiaire
  const GoToUpdate = async (stagiaireId) => {
    router.push(`/Stagiaires/Modifier?id=${stagiaireId}`);
  };
  // DetailsStagiaire  stagiaire
  const GoToDetailsStagiaire = async (stagiaireId) => {
    router.push(`/Stagiaires/${stagiaireId}`);
  };

  // Delete stagiaire - Fixed function signature
  const deleteStagiaire = async (stagiaireId) => {
    if (!deleteModal.intern) return;

    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `/api/Stagiaire/soft-delete/${stagiaireId}`,
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
        throw new Error("Failed to delete stagiaire");
      }

      // Refresh both lists after deletion
      await fetchStagiaires();
      await fetchRejectedInterns();
      closeDeleteModal();
    } catch (err) {
      console.error("Error deleting stagiaire:", err);
      setError("Erreur lors de la suppression du stagiaire");
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

  // Filter and sort stagiaires
  useEffect(() => {
    let filtered = [...stagiaires];
    if (searchTerm) {
      filtered = filtered.filter(
        (stagiaire) =>
          stagiaire.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stagiaire.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stagiaire.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stagiaire.phoneNumber
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          stagiaire.etablissement
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          stagiaire.ecole?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status - Fixed status mapping
    if (statusFilter !== "all") {
      const statusMap = {
        pending: "En attente",
        approved: "Complète",
        rejected: "Annulé",
      };
      filtered = filtered.filter(
        (stagiaire) => stagiaire.status === statusMap[statusFilter]
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || "";
      let bValue = b[sortBy] || "";

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredStagiaires(filtered);
    setCurrentPage(1);
  }, [stagiaires, searchTerm, statusFilter, sortBy, sortOrder]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStagiaires.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredStagiaires.length / itemsPerPage);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStagiaires(),
        fetchUserProfile(),
        fetchRejectedInterns(),
      ]);
      setLoading(false);
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    };

    loadData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Complète":
        return "bg-green-100 text-green-800";
      case "Annulé":
        return "bg-red-100 text-red-800";
      case "En attente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Complète":
        return "Complète";
      case "Annulé":
        return "Rejeté";
      case "En attente":
        return "En attente";
      default:
        return "Inconnu";
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
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() =>
                    deleteStagiaire(
                      deleteModal.intern?.id || deleteModal.intern?._id
                    )
                  }
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar isLoaded={isLoaded} userProfile={userProfile} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header
          className={`bg-white shadow-sm border-b border-gray-200 px-6 py-4 transform transition-all duration-700 ease-out ${
            isLoaded
              ? "translate-y-0 opacity-100"
              : "-translate-y-full opacity-0"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Gestion des Stagiaires
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gérez tous vos stagiaires en un seul endroit
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un stagiaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all w-64"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                <Filter className="w-4 h-4" />
                <span>Filtres</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <button className="bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <Link href={"/Stagiaires/Ajouter"}>Ajouter Stagiaire</Link>
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="approved">Approuvé</option>
                    <option value="rejected">Rejeté</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trier par
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="nom">Nom</option>
                    <option value="prenom">Prénom</option>
                    <option value="email">Email</option>
                    <option value="etablissement">Établissement</option>
                    <option value="createdAt">Date de création</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordre
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="asc">Croissant</option>
                    <option value="desc">Décroissant</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          {/* Stats Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 transform transition-all duration-700 ease-out ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stagiaires.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Approuvés</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stagiaires.filter((s) => s.status === "Complète").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    En attente
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stagiaires.filter((s) => s.status === "En attente").length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Rejetés</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {rejectedInterns.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stagiaires Table */}
          <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 transform transition-all duration-700 ease-out ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Liste des Stagiaires ({filteredStagiaires.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all">
                    <Download className="w-4 h-4" />
                    <span>Exporter</span>
                  </button>
                </div>
              </div>
            </div>

            {filteredStagiaires.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <BookOpen className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun stagiaire trouvé
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Aucun stagiaire ne correspond à vos critères de recherche."
                    : "Commencez par ajouter votre premier stagiaire."}
                </p>
              </div>
            ) : (
              <>
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
                          Établissement
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((stagiaire, index) => (
                        <tr
                          key={stagiaire._id}
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
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-purple-600 font-medium text-sm">
                                  {stagiaire.nom?.charAt(0).toUpperCase() ||
                                    "S"}
                                  {stagiaire.prenom?.charAt(0).toUpperCase() ||
                                    "T"}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {stagiaire.nom} {stagiaire.prenom}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {stagiaire.specialite ||
                                    "Spécialité non renseignée"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center mb-1">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                {stagiaire.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                {stagiaire.phoneNumber || "Non renseigné"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">
                                {stagiaire.ecole ||
                                  stagiaire.etablissement ||
                                  "Non renseigné"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                stagiaire.status
                              )}`}
                            >
                              {getStatusText(stagiaire.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  GoToDetailsStagiaire(stagiaire._id)
                                }
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => GoToUpdate(stagiaire._id)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(stagiaire)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Affichage {indexOfFirstItem + 1} à{" "}
                        {Math.min(indexOfLastItem, filteredStagiaires.length)}{" "}
                        sur {filteredStagiaires.length} résultats
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Précédent
                        </button>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                              currentPage === page
                                ? "bg-purple-600 text-white"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Suivant
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
