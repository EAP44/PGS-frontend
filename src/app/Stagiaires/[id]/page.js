"use client";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Building,
  Calendar,
  FileText,
  Download,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import Sidebar from "@/component/UI/Sidebar";

export default function DetailsStagiaire({ params }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [stagiaire, setStagiaire] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const [supervisor, setSupervisor] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const { id } = React.use(params);
  const stagiaireId = id;
  // const encadrantId = stagiaire.encadrantId

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

  // Fetch stagiaire details
  const fetchStagiaireDetails = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`/api/Stagiaire/${stagiaireId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stagiaire details");
      }

      const data = await response.json();
      setStagiaire(data);
    } catch (err) {
      console.error("Error fetching stagiaire details:", err);
      setError("Erreur lors du chargement des détails du stagiaire");
    } finally {
      setLoading(false);
    }
  };

  // Fetch supervisors
  const fetchSupervisors = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`/api/test/Encadrant/${stagiaire.encadrantId}`, {
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
      setSupervisor(data);
    } catch (err) {
      console.error("Error fetching supervisors:", err);
      setSupervisor([]);
    }
  };


  // Page Effect
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUserProfile(), fetchStagiaireDetails(),fetchSupervisors()]);
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    };

    if (stagiaireId) {
      loadData();
    }
  }, [stagiaireId]);

  // Download file function
  const downloadFile = async (fileType, fileName) => {
    try {
      setDownloadingFile(fileType);
      const token = Cookies.get("token");

      const response = await fetch(
        `/api/Stagiaire/${stagiaireId}/download/${fileType}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement du fichier");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        fileName || `${fileType}_${stagiaire.nom}_${stagiaire.prenom}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess("Fichier téléchargé avec succès");
    } catch (err) {
      console.error("Error downloading file:", err);
      setError("Erreur lors du téléchargement du fichier");
    } finally {
      setDownloadingFile(null);
    }
  };

  // Delete stagiaire function
  const deleteStagiaire = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`/api/Stagiaire/soft-delete/${stagiaireId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du stagiaire");
      }

      setSuccess("Stagiaire supprimé avec succès");
      setTimeout(() => {
        router.push("/Dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error deleting stagiaire:", err);
      setError("Erreur lors de la suppression du stagiaire");
    }
  };

  // Update status function
  const updateStatus = async (newStatus) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`/api/Stagiaire/${stagiaireId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut");
      }

      const updatedStagiaire = await response.json();
      setStagiaire(updatedStagiaire);
      setSuccess("Statut mis à jour avec succès");
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Erreur lors de la mise à jour du statut");
    }
  };

  const handleReturnToDashboard = () => {
    router.push("/Dashboard");
  };

  const handleEditStagiaire = () => {
    router.push(`/Stagiaires/Modifier?id=${stagiaireId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "En attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Approuvé":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejeté":
        return "bg-red-100 text-red-800 border-red-200";
      case "En cours":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Terminé":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "En attente":
        return <Clock className="w-4 h-4" />;
      case "Approuvé":
        return <CheckCircle className="w-4 h-4" />;
      case "Rejeté":
        return <XCircle className="w-4 h-4" />;
      case "En cours":
        return <AlertCircle className="w-4 h-4" />;
      case "Terminé":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const months = Math.floor(diffDays / 30);

    if (months > 0) {
      return `${months} mois`;
    } else if (weeks > 0) {
      return `${weeks} semaine${weeks > 1 ? "s" : ""}`;
    } else {
      return `${diffDays} jour${diffDays > 1 ? "s" : ""}`;
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

  if (error && !stagiaire) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleReturnToDashboard}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Error/Success Messages */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 flex items-center space-x-2">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-4 text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                    Rejeter
                  </h3>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Êtes-vous sûr de vouloir rejeter{" "}
                  <span className="font-semibold text-gray-900">
                    {stagiaire.nom}{" "}{stagiaire.prenom}?
                  </span>
                  .
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteStagiaire();
                    setShowDeleteModal(false);
                  }}
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
            <div className="flex items-center space-x-4">
              <button
                onClick={handleReturnToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour au tableau de bord</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Détails du stagiaire
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEditStagiaire}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Rejeter</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-6">
          {stagiaire && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Profile Header */}
              <div
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform transition-all duration-700 ease-out ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {stagiaire.nom} {stagiaire.prenom}
                      </h2>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{stagiaire.email}</span>
                      </p>
                      <p className="text-gray-600 flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{stagiaire.phoneNumber}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`px-3 py-1 rounded-full border flex items-center space-x-2 ${getStatusColor(
                        stagiaire.status
                      )}`}
                    >
                      {getStatusIcon(stagiaire.status)}
                      <span className="text-sm font-medium">
                        {stagiaire.status}
                      </span>
                    </div>
                    <select
                      value={stagiaire.status}
                      onChange={(e) => updateStatus(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="En attente">En attente</option>
                      <option value="Approuvé">Approuvé</option>
                      <option value="Rejeté">Rejeté</option>
                      <option value="En cours">En cours</option>
                      <option value="Terminé">Terminé</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Academic Information */}
                  <div
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform transition-all duration-700 ease-out ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "600ms" }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-purple-600" />
                      Informations académiques
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          École/Université
                        </label>
                        <p className="text-gray-900">{stagiaire.ecole}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Spécialité
                        </label>
                        <p className="text-gray-900">{stagiaire.specialite}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Niveau d'études
                        </label>
                        <p className="text-gray-900">{stagiaire.niveau}</p>
                      </div>
                    </div>
                  </div>

                  {/* Internship Details */}
                  <div
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform transition-all duration-700 ease-out ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "800ms" }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-600" />
                      Détails du stage
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sujet de stage
                        </label>
                        <p className="text-gray-900 font-medium">
                          {stagiaire.sujet}
                        </p>
                      </div>
                      {stagiaire.description && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <p className="text-gray-900 text-sm leading-relaxed">
                            {stagiaire.description}
                          </p>
                        </div>
                      )}
                      {stagiaire.competences && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Compétences requises
                          </label>
                          <p className="text-gray-900 text-sm leading-relaxed">
                            {stagiaire.competences}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Timeline */}
                  <div
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform transition-all duration-700 ease-out ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "700ms" }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                      Planning du stage
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de début
                          </label>
                          <p className="text-gray-900">
                            {formatDate(stagiaire.dateDebut)}
                          </p>
                        </div>
                        <div className="text-right">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date de fin
                          </label>
                          <p className="text-gray-900">
                            {formatDate(stagiaire.dateFin)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Durée totale
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {calculateDuration(
                              stagiaire.dateDebut,
                              stagiaire.dateFin
                            )}
                          </span>
                        </div>
                      </div>
                      {stagiaire.encadrantId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Encadrant
                          </label>
                          <p className="text-gray-900">
                            {supervisor.nom}{" "}
                            {supervisor.prenom}
                          </p>
                          <p className="text-sm text-gray-600">
                            {supervisor.departement}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  <div
                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform transition-all duration-700 ease-out ${
                      isLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "900ms" }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-600" />
                      Documents
                    </h3>
                    <div className="space-y-3">
                      {stagiaire.CV && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                CV
                              </p>
                              <p className="text-xs text-gray-500">
                                Document PDF
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              downloadFile(
                                "cv",
                                `CV_${stagiaire.nom}_${stagiaire.prenom}.pdf`
                              )
                            }
                            disabled={downloadingFile === "cv"}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            {downloadingFile === "cv" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            <span className="text-sm">Télécharger</span>
                          </button>
                        </div>
                      )}
                      {stagiaire.ConventionDeStage && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Convention de stage
                              </p>
                              <p className="text-xs text-gray-500">
                                Document PDF
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              downloadFile(
                                "convention",
                                `Convention_${stagiaire.nom}_${stagiaire.prenom}.pdf`
                              )
                            }
                            disabled={downloadingFile === "convention"}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            {downloadingFile === "convention" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            <span className="text-sm">Télécharger</span>
                          </button>
                        </div>
                      )}
                      {stagiaire.DemandeDeStage && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Demande de stage
                              </p>
                              <p className="text-xs text-gray-500">
                                Document PDF
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              downloadFile(
                                "demande",
                                `Demande_${stagiaire.nom}_${stagiaire.prenom}.pdf`
                              )
                            }
                            disabled={downloadingFile === "demande"}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                          >
                            {downloadingFile === "demande" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                            <span className="text-sm">Télécharger</span>
                          </button>
                        </div>
                      )}
                      {!stagiaire.CV &&
                        !stagiaire.ConventionDeStage &&
                        !stagiaire.DemandeDeStage && (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">
                              Aucun document disponible
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform transition-all duration-700 ease-out ${
                  isLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: "1000ms" }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-purple-600" />
                  Informations supplémentaires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Date d'ajout</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(stagiaire.createdAt)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      Dernière mise à jour
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(stagiaire.updatedAt)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Adresse</p>
                    <p className="text-sm font-medium text-gray-900">
                      {stagiaire.adresse || "Non spécifiée"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
