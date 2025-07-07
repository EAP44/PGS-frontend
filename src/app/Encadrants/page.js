"use client";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Users,
  Mail,
  Phone,
  Building,
  UserPlus,
  Loader2,
  RefreshCw,
  Award,
  Calendar,
} from "lucide-react";
import Sidebar from "@/component/UI/Sidebar";

export default function Encadrants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Fetch supervisors
  const fetchSupervisors = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("/api/test/Encadrants", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch supervisors");
      }

      const data = await response.json();
      setSupervisors(data || []);
    } catch (err) {
      console.error("Error fetching supervisors:", err);
      setError("Erreur lors du chargement des encadrants");
      setSupervisors([]);
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

  // Page Effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSupervisors(), fetchUserProfile()]);
      setLoading(false);
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    };

    loadData();
  }, []);

  // Reset pagination when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBy, sortBy]);

  // Filter and sort supervisors
  const filteredAndSortedSupervisors = supervisors
    .filter((supervisor) => {
      const matchesSearch =
        supervisor.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supervisor.departement
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        supervisor.specialite?.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterBy === "all") return matchesSearch;
      if (filterBy === "active")
        return matchesSearch && supervisor.statut === "actif";
      if (filterBy === "inactive")
        return matchesSearch && supervisor.statut === "inactif";
      if (filterBy === "available")
        return matchesSearch && supervisor.disponible === true;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.nom.localeCompare(b.nom);
      }
      if (sortBy === "department") {
        return (a.departement || "").localeCompare(b.departement || "");
      }
      if (sortBy === "interns") {
        return (b.nombreStagiaires || 0) - (a.nombreStagiaires || 0);
      }
      if (sortBy === "dateCreated") {
        return new Date(b.dateCreation) - new Date(a.dateCreation);
      }
      return 0;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedSupervisors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSupervisors = filteredAndSortedSupervisors.slice(indexOfFirstItem, indexOfLastItem);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "actif":
        return "bg-green-100 text-green-600";
      case "inactif":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
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
                <Users className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-semibold text-gray-900">
                  Liste des Encadrants
                </h1>
              </div>
              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-sm font-medium">
                {filteredAndSortedSupervisors.length}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher un encadrant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all w-80"
                />
              </div>
              <button
                onClick={() => fetchSupervisors()}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Filters and Stats */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6 transform transition-all duration-700 ease-out ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Encadrants</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {supervisors.length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">
                    {supervisors.filter((s) => s.statut === "actif").length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disponibles</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {supervisors.filter((s) => s.disponible).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Départements</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      new Set(
                        supervisors.map((s) => s.departement).filter(Boolean)
                      ).size
                    }
                  </p>
                </div>
                <Building className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 transform transition-all duration-700 ease-out ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: "600ms" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Tous les encadrants</option>
                  <option value="active">Encadrants actifs</option>
                  <option value="inactive">Encadrants inactifs</option>
                  <option value="available">Encadrants disponibles</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="name">Trier par nom</option>
                  <option value="department">Trier par département</option>
                  <option value="interns">
                    Trier par nombre de stagiaires
                  </option>
                  <option value="dateCreated">Trier par date d'ajout</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                {filteredAndSortedSupervisors.length} encadrant(s) trouvé(s)
              </div>
            </div>
          </div>

          {/* Supervisors List */}
          <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 transform transition-all duration-700 ease-out ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "800ms" }}
          >
            {supervisors.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Users className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun encadrant enregistré
                </h3>
                <p className="text-gray-500 mb-4">
                  {error
                    ? "Impossible de charger les données."
                    : "Commencez par ajouter votre premier encadrant."}
                </p>
                <Link href="/Encadrants/Ajouter">
                  <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto">
                    <UserPlus className="w-4 h-4" />
                    <span>Ajouter un encadrant</span>
                  </button>
                </Link>
              </div>
            ) : filteredAndSortedSupervisors.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat
                </h3>
                <p className="text-gray-500">
                  Aucun encadrant ne correspond à votre recherche "{searchTerm}
                  ".
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Encadrant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Département
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stagiaires
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentSupervisors.map((supervisor, index) => (
                        <tr
                          key={supervisor._id}
                          className={`hover:bg-gray-50 transform transition-all duration-500 ease-out ${
                            isLoaded
                              ? "translate-x-0 opacity-100"
                              : "translate-x-4 opacity-0"
                          }`}
                          style={{
                            transitionDelay: `${1000 + index * 100}ms`,
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-purple-600 font-medium text-sm">
                                    {supervisor.nom.charAt(0)}
                                    {supervisor.prenom.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {supervisor.nom} {supervisor.prenom}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {supervisor.titre || "Encadrant"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center space-x-1">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span>{supervisor.email}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span>
                                {supervisor.telephone || "Non renseigné"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Building className="w-4 h-4 text-gray-400 mr-1" />
                              <div>
                                <div>
                                  {supervisor.departement || "Non défini"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {supervisor.specialite ||
                                    "Spécialité non définie"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                                {supervisor.nombreStagiaires || 0} stagiaire(s)
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap align-middle">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium capitalize ring-1 ring-inset ${getStatusColor(
                                  supervisor.statut
                                )}`}
                              >
                                {supervisor.statut || "Non défini"}
                              </span>
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    supervisor.disponible
                                      ? "bg-green-500"
                                      : "bg-red-400"
                                  }`}
                                />
                                {supervisor.disponible
                                  ? "Disponible"
                                  : "Non disponible"}
                              </div>
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
                        {Math.min(indexOfLastItem, filteredAndSortedSupervisors.length)}{" "}
                        sur {filteredAndSortedSupervisors.length} résultats
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