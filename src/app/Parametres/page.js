"use client";
import Cookies from "js-cookie";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  Eye,
  EyeOff,
  Lock,
  User,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Sidebar from "@/component/UI/Sidebar";

export default function SettingsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Tous les champs sont requis");
      setIsSubmitting(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas");
      setIsSubmitting(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Le nouveau mot de passe doit contenir au moins 8 caractères");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = Cookies.get("token");
      const response = await fetch("/auth/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erreur lors du changement de mot de passe"
        );
      }

      setSuccess("Mot de passe modifié avec succès");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.message || "Erreur lors du changement de mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Page Effect
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      let token = Cookies.get("token");
      if (!token) {
        const urlToken = searchParams.get("token");
        const urlpass = searchParams.get("pass");
        setFormData({
          currentPassword: urlpass,
          newPassword: "",
          confirmPassword: "",
        });
        if (!urlToken) {
          router.push("/Login");
          return;
        }
        token = urlToken;
        Cookies.set("token", token);
      }
      try {
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
      } finally {
        setLoading(false);
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
      }
    };

    loadData();
  }, [searchParams, router]);

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
      {/* Success/Error Messages */}
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

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
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
            <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>Gestion du compte</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Profile Info Card */}
            <div
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 transform transition-all duration-700 ease-out ${
                isLoaded
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {userProfile
                      ? `${userProfile.nom} ${userProfile.prenom}`
                      : "Utilisateur"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {userProfile ? userProfile.email : "email@example.com"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {userProfile ? userProfile.role : "Role"}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Password Change Form - Left Side */}
              <div
                className={`lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 transform transition-all duration-700 ease-out ${
                  isLoaded
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-8 opacity-0"
                }`}
                style={{ transitionDelay: "600ms" }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Lock className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Changer le mot de passe
                  </h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  {/* Current Password */}
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        id="currentPassword"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                        placeholder="Entrez votre mot de passe actuel"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                        placeholder="Entrez votre nouveau mot de passe"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Le mot de passe doit contenir au moins 8 caractères
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                        placeholder="Confirmez votre nouveau mot de passe"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        })
                      }
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-3 bg-purple-800 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Modification...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Sauvegarder</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Security Tips - Right Side */}
              <div
                className={`bg-blue-50 border border-blue-200 rounded-lg p-6 transform transition-all duration-700 ease-out ${
                  isLoaded
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                }`}
                style={{ transitionDelay: "800ms" }}
              >
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  Conseils de sécurité
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>
                    • Utilisez un mot de passe fort avec au moins 8 caractères
                  </li>
                  <li>
                    • Combinez lettres majuscules, minuscules, chiffres et
                    symboles
                  </li>
                  <li>
                    • Évitez d'utiliser des informations personnelles évidentes
                  </li>
                  <li>
                    • Ne partagez jamais votre mot de passe avec d'autres
                    personnes
                  </li>
                  <li>• Changez régulièrement votre mot de passe</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
