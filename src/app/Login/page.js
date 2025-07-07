"use client";
import Image from "next/image";
import { Eye, EyeOff,ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("hanane.enc@dxc.com");
  const [password, setPassword] = useState("hananepass");
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Une erreur est survenue.");
        return;
      }

      Cookies.set("token", data.token, { expires: 1 });
      Cookies.set("role", data.role, { expires: 1 });
      router.push("/Dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Erreur du serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const forgotpassword = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email) {
      setErrorMessage("Veuillez entrer votre adresse e-mail.");
      return;
    }

    try {
      const response = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Une erreur est survenue.");
      } else {
        setSuccessMessage(data.message || "Lien de réinitialisation envoyé !");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrorMessage("Erreur du serveur. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen flex">
      <Link
        href="/"
        className="absolute top-4 left-4 text-gray-500 text-sm font-medium tracking-wide uppercase underline flex items-center gap-1"
      >
        <ArrowLeft size={16} />
        Go back
      </Link>
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">
              WELCOME BACK
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">
              Continuez vers votre compte.
            </h2>
          </div>

          {/* Show error message */}
          {errorMessage && (
            <div className="bg-red-100 text-red-700 text-sm px-4 py-3 rounded-md">
              {errorMessage}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  EMAIL
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  MOT DE PASSE
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                    placeholder="•••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-800 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
              >
                {loading ? "Connexion..." : "CONTINUER"}
                {!loading && <span className="ml-2">→</span>}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={forgotpassword}
                className="text-sm text-gray-600 hover:text-purple-600 underline"
              >
                Mot de passe oublié?
              </button>
            </div>
            {successMessage && (
              <div className="bg-green-100 text-green-700 text-sm px-4 py-3 rounded-md">
                {successMessage}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right side - Geometric pattern and logo */}
      <div className="flex-1 relative bg-gradient-to-br from-purple-800 to-purple-900 overflow-hidden">
        {/* Geometric Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 400 600" className="w-full h-full">
            {/* Top row */}
            <circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.3)" />
            <circle cx="150" cy="50" r="40" fill="rgba(255,255,255,0.4)" />
            <circle cx="250" cy="50" r="40" fill="rgba(255,255,255,0.3)" />
            <circle cx="350" cy="50" r="40" fill="rgba(255,255,255,0.4)" />

            {/* Second row */}
            <circle cx="50" cy="150" r="40" fill="rgba(255,255,255,0.4)" />
            <circle cx="150" cy="150" r="40" fill="rgba(255,255,255,0.3)" />
            <circle cx="250" cy="150" r="40" fill="rgba(255,255,255,0.4)" />
            <circle cx="350" cy="150" r="40" fill="rgba(255,255,255,0.3)" />

            {/* Third row */}
            <circle cx="100" cy="250" r="40" fill="rgba(255,255,255,0.4)" />
            <circle cx="300" cy="250" r="40" fill="rgba(255,255,255,0.4)" />

            {/* Fourth row */}
            <circle cx="50" cy="350" r="40" fill="rgba(255,255,255,0.3)" />
            <circle cx="150" cy="350" r="40" fill="rgba(255,255,255,0.4)" />
            <circle cx="250" cy="350" r="40" fill="rgba(255,255,255,0.3)" />
            <circle cx="350" cy="350" r="40" fill="rgba(255,255,255,0.4)" />

            {/* Bottom row */}
            <circle cx="100" cy="450" r="40" fill="rgba(255,255,255,0.4)" />
            <circle cx="300" cy="450" r="40" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Image
              src="/DXC-Technology.png"
              alt="Description of the image"
              width={500}
              height={300}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute top-40 right-40 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
      </div>
    </div>
  );
}
