"use client";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {ArrowLeft,User,Building,Calendar,FileText,Save,Loader2,CheckCircle,XCircle} from "lucide-react";
import Sidebar from "@/component/UI/Sidebar";

export default function AjouterStagiaire() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
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
  const [errors, setErrors] = useState({});
  const [supervisors, setSupervisors] = useState([]);
  const router = useRouter();

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

  // Page Effect
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUserProfile(), fetchSupervisors()]);
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    };

    loadData();
  }, []);

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

    // Clear error when user starts typing
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

      const form = new FormData();

      form.append("nom", formData.nom);
      form.append("prenom", formData.prenom);
      form.append("email", formData.email);
      form.append("phoneNumber", formData.phoneNumber);
      form.append("ecole", formData.ecole);
      form.append("specialite", formData.specialite);
      form.append("niveau", formData.niveau);
      form.append("dateDebut", formData.dateDebut.trim());
      form.append("dateFin", formData.dateFin.trim());
      form.append("encadrantId", formData.encadrantId);
      form.append("sujet", formData.sujet);
      form.append("description", formData.description);
      form.append("competences", formData.competences);

      if (formData.cv) form.append("CV", formData.cv);
      if (formData.conventionDeStage)
        form.append("ConventionDeStage", formData.conventionDeStage);
      if (formData.demandeDeStage)
        form.append("DemandeDeStage", formData.demandeDeStage);

      const response = await fetch("/api/Stagiaire", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Ne pas mettre Content-Type pour FormData
        },
        body: form,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Erreur lors de l'ajout du stagiaire");
      }

      await response.json();
      setSuccess("Stagiaire ajouté avec succès!");

      setFormData({
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
      });

      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach((input) => (input.value = ""));

      setTimeout(() => {
        router.push("/Dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error adding intern:", err);
      setError(err.message || "Erreur lors de l'ajout du stagiaire");
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToDashboard = () => {
    router.push("/Dashboard");
  };

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
              <h1 className="text-2xl font-semibold text-gray-900">
                Ajouter un stagiaire
              </h1>
            </div>
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
                          <p className="mt-1 text-sm text-red-600">{errors.nom}</p>
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
                            errors.specialite ? "border-red-500" : "border-gray-300"
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
                            errors.dateDebut ? "border-red-500" : "border-gray-300"
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
                            errors.dateFin ? "border-red-500" : "border-gray-300"
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
                            errors.encadrantId ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          <option value="">Sélectionnez un encadrant</option>
                          {supervisors.map((supervisor) => (
                            <option key={supervisor._id} value={supervisor._id}>
                              {supervisor.nom} {supervisor.prenom} {supervisor.departement}
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
                          <p className="mt-1 text-sm text-red-600">{errors.sujet}</p>
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
                          Fichier PDF uniquement, taille maximale 5MB
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
                          Fichier PDF uniquement, taille maximale 5MB
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
                          Fichier PDF uniquement, taille maximale 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleReturnToDashboard}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Ajout en cours...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Ajouter le stagiaire</span>
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