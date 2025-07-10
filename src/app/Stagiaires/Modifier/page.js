"use client";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Building,
  Calendar,
  FileText,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";
import Sidebar from "@/component/UI/Sidebar";

export default function ModifierStagiaire() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    phoneNumber: "",
    ecole: "",
    specialite: "",
    niveau: "",
    dateDebut: "",
    dateFin: "",
    encadrantId: "",
    sujet: "",
    description: "",
    competences: "",
    cv: null,
    conventionDeStage: null,
    demandeDeStage: null,
    status: "En attente",
    conventionValidee: false,
    documents: [],
    commentaires: [],
  });
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});
  const [supervisors, setSupervisors] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const stagiaireId = searchParams.get("id");
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
      setSupervisors([]);
    }
  };

  // Fetch stagiaire data
  const fetchStagiaire = async () => {
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
        throw new Error("Failed to fetch stagiaire data");
      }

      const data = await response.json();
      const stagiaireData = data.stagiaire || data;

      // Format dates for input fields
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0];
      };

      const formattedData = {
        nom: stagiaireData.nom || "",
        prenom: stagiaireData.prenom || "",
        email: stagiaireData.email || "",
        phoneNumber: stagiaireData.phoneNumber || "",
        ecole: stagiaireData.ecole || "",
        specialite: stagiaireData.specialite || "",
        niveau: stagiaireData.niveau || "",
        dateDebut: formatDate(stagiaireData.dateDebut),
        dateFin: formatDate(stagiaireData.dateFin),
        encadrantId: stagiaireData.encadrantId || "",
        sujet: stagiaireData.sujet || "",
        description: stagiaireData.description || "",
        competences: stagiaireData.competences || "",
        status: stagiaireData.status || "En attente",
        conventionValidee: stagiaireData.conventionValidee || false,
        documents: stagiaireData.documents || [],
        commentaires: stagiaireData.commentaires || [],
        cv: null,
        conventionDeStage: null,
        demandeDeStage: null,
      };

      setFormData(formattedData);
      setOriginalData(formattedData);
    } catch (err) {
      console.error("Error fetching stagiaire:", err);
      setError("Erreur lors du chargement des données du stagiaire");
    }
  };

  // Page Effect
  useEffect(() => {
    const loadData = async () => {
      if (!stagiaireId) {
        setError("ID du stagiaire manquant");
        setInitialLoading(false);
        return;
      }

      await Promise.all([
        fetchUserProfile(),
        fetchSupervisors(),
        fetchStagiaire(),
      ]);

      setInitialLoading(false);
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    };

    loadData();
  }, [stagiaireId]);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Le numéro de téléphone est requis";
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber =
        "Le numéro de téléphone doit contenir 10 chiffres";
    }

    if (!formData.ecole.trim()) {
      newErrors.ecole = "L'école est requise";
    }

    if (!formData.specialite.trim()) {
      newErrors.specialite = "La spécialité est requise";
    }

    if (!formData.niveau.trim()) {
      newErrors.niveau = "Le niveau d'études est requis";
    }

    if (!formData.dateDebut) {
      newErrors.dateDebut = "La date de début est requise";
    }

    if (!formData.dateFin) {
      newErrors.dateFin = "La date de fin est requise";
    }

    if (formData.dateDebut && formData.dateFin) {
      const debut = new Date(formData.dateDebut);
      const fin = new Date(formData.dateFin);
      if (fin <= debut) {
        newErrors.dateFin = "La date de fin doit être après la date de début";
      }
    }

    if (!formData.sujet.trim()) {
      newErrors.sujet = "Le sujet de stage est requis";
    }

    if (!formData.encadrantId) {
      newErrors.encadrantId = "L'encadrant est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    setError("Veuillez corriger les erreurs dans le formulaire");
    return;
  }

  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    const token = Cookies.get("token");
    const submitData = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (["cv", "conventionDeStage", "demandeDeStage"].includes(key)) {
        if (value instanceof File) {
          let formKey = "";
          switch (key) {
            case "cv":
              formKey = "CV";
              break;
            case "conventionDeStage":
              formKey = "ConventionDeStage";
              break;
            case "demandeDeStage":
              formKey = "DemandeDeStage";
              break;
            default:
              formKey = key;
          }
          submitData.append(formKey, value);
        }
      } else if (key !== "documents" && key !== "commentaires") {
        submitData.append(key, value);
      }
    });

    // DEBUG : afficher le contenu du FormData
for (const [key, value] of submitData.entries()) {
  if (value instanceof File) {
    console.log(`${key}: FILE - name=${value.name}, size=${value.size}`);
  } else {
    console.log(`${key}:`, value);
  }
}


    const response = await fetch(`/api/Stagiaire/${stagiaireId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        // Ne pas définir 'Content-Type' ici
      },
      body: submitData,
      credentials: "include",
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = "Erreur lors de la modification du stagiaire";
      try {
        const errorData = JSON.parse(text);
        if (errorData.message) errorMessage = errorData.message;
        else if (errorData.error) errorMessage = errorData.error;
      } catch {
        if (text) errorMessage = text;
      }
      console.error("Server response status:", response.status);
      console.error("Server response body:", text);
      throw new Error(errorMessage);
    }

    const result = await response.json();
    setSuccess("Stagiaire modifié avec succès !");

    setTimeout(() => {
      router.push("/Dashboard");
    }, 2000);

  } catch (err) {
    console.error("Error updating intern:", err);
    setError(err.message || "Erreur lors de la modification du stagiaire");
  } finally {
    setLoading(false);
  }
};

  const handleReturnToDashboard = () => {
    router.push("/Dashboard");
  };

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  if (initialLoading) {
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
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                <Edit className="w-6 h-6 mr-2 text-purple-600" />
                Modifier le stagiaire
              </h1>
            </div>
            {hasChanges() && (
              <div className="flex items-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Modifications non sauvegardées</span>
              </div>
            )}
          </div>
        </header>

        {/* Form */}
        <div className="flex-1 p-6">
          <div
            className={`max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 transform transition-all duration-700 ease-out ${
              isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-purple-600" />
                      Informations personnelles
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          name="nom"
                          value={formData.nom}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.nom ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Nom de famille"
                        />
                        {errors.nom && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.nom}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          name="prenom"
                          value={formData.prenom}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.prenom ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Prénom"
                        />
                        {errors.prenom && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.prenom}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="email@exemple.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.email}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro de téléphone *
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.phoneNumber
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="0612345678"
                        />
                        {errors.phoneNumber && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Building className="w-5 h-5 mr-2 text-purple-600" />
                      Informations académiques
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          École/Université *
                        </label>
                        <input
                          type="text"
                          name="ecole"
                          value={formData.ecole}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.ecole ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Nom de l'école ou université"
                        />
                        {errors.ecole && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.ecole}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Spécialité *
                        </label>
                        <input
                          type="text"
                          name="specialite"
                          value={formData.specialite}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.specialite
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Ex: Informatique, Génie logiciel..."
                        />
                        {errors.specialite && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.specialite}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Niveau d'études *
                        </label>
                        <select
                          name="niveau"
                          value={formData.niveau}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.niveau ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Sélectionnez un niveau</option>
                          <option value="Licence 1">Licence 1</option>
                          <option value="Licence 2">Licence 2</option>
                          <option value="Licence 3">Licence 3</option>
                          <option value="Master 1">Master 1</option>
                          <option value="Master 2">Master 2</option>
                          <option value="Doctorat">Doctorat</option>
                          <option value="Ingénieur">Ingénieur</option>
                          <option value="Technicien Supérieur">
                            Technicien Supérieur
                          </option>
                        </select>
                        {errors.niveau && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.niveau}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Internship Dates and Supervisor */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                      Dates et encadrement
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de début *
                        </label>
                        <input
                          type="date"
                          name="dateDebut"
                          value={formData.dateDebut}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.dateDebut
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.dateDebut && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.dateDebut}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de fin *
                        </label>
                        <input
                          type="date"
                          name="dateFin"
                          value={formData.dateFin}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.dateFin
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.dateFin && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.dateFin}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Encadrant *
                        </label>
                        <select
                          name="encadrantId"
                          value={formData.encadrantId}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.encadrantId
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Sélectionnez un encadrant</option>
                          {supervisors.map((supervisor) => (
                            <option key={supervisor._id} value={supervisor._id}>
                              {supervisor.nom} {supervisor.prenom}
                            </option>
                          ))}
                        </select>
                        {errors.encadrantId && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.encadrantId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Internship Details */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-600" />
                      Détails du stage
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sujet de stage *
                        </label>
                        <input
                          type="text"
                          name="sujet"
                          value={formData.sujet}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                            errors.sujet ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Titre du sujet de stage"
                        />
                        {errors.sujet && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.sujet}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description du stage
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="Description détaillée du stage..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Compétences requises
                        </label>
                        <textarea
                          name="competences"
                          value={formData.competences}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          placeholder="Compétences techniques et soft skills..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-purple-600" />
                      Documents
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CV (PDF uniquement)
                        </label>
                        <input
                          type="file"
                          name="cv"
                          accept=".pdf"
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Laisser vide pour conserver le fichier actuel
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Convention de stage (PDF uniquement)
                        </label>
                        <input
                          type="file"
                          name="conventionDeStage"
                          accept=".pdf"
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Laisser vide pour conserver le fichier actuel
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Demande de stage (PDF uniquement)
                        </label>
                        <input
                          type="file"
                          name="demandeDeStage"
                          accept=".pdf"
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Laisser vide pour conserver le fichier actuel
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex items-center px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-300 ${
                    loading
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Sauvegarder les modifications
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
