"use client";
import { Users, BookOpen, Download, Search, CheckCircle, UserCheck, BarChart3, ArrowRight, Shield, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
export default function Home() {
  const features = [
    {
      icon: Users,
      title: "Gestion des Stagiaires",
      description: "Gérez facilement tous vos stagiaires avec un système complet d'inscription, de validation et de suivi.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: UserCheck,
      title: "Validation des Candidatures",
      description: "Approuvez ou rejetez les candidatures de stagiaires en quelques clics avec notre système de validation intuitif.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: BarChart3,
      title: "Tableau de Bord Complet",
      description: "Visualisez toutes les statistiques importantes : nombre total de stagiaires, encadrants, stages en cours.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Search,
      title: "Recherche",
      description: "Trouvez rapidement n'importe quel stagiaire grâce à notre système de recherche par nom, prénom ou email.",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: Download,
      title: "Rapports Détaillés",
      description: "Générez et téléchargez des rapports complets en format PDF ou Excel pour vos analyses.",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: Shield,
      title: "Sécurité",
      description: "Système d'authentification sécurisé avec tokens JWT et gestion des permissions utilisateur.",
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <style jsx>{`
        /* Mobile First Approach */
        @media (max-width: 640px) {
          .hero-title {
            font-size: 2.5rem;
            line-height: 1.2;
          }
          .hero-subtitle {
            font-size: 1.125rem;
            padding: 0 1rem;
          }
          .hero-buttons {
            flex-direction: column;
            gap: 1rem;
            padding: 0 1rem;
          }
          .hero-button {
            width: 100%;
            text-align: center;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          .dashboard-preview {
            padding: 1rem;
            margin: 0 1rem;
          }
          .dashboard-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }
        }

        /* Tablet Styles */
        @media (min-width: 641px) and (max-width: 1024px) {
          .hero-title {
            font-size: 3.5rem;
            line-height: 1.1;
          }
          .hero-subtitle {
            font-size: 1.25rem;
          }
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
          .dashboard-preview {
            padding: 2rem;
          }
          .dashboard-stats {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
          }
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
        }

        /* Desktop Styles */
        @media (min-width: 1025px) {
          .hero-title {
            font-size: 4rem;
            line-height: 1.1;
          }
          .hero-subtitle {
            font-size: 1.5rem;
          }
          .stats-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
          }
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2rem;
          }
          .dashboard-preview {
            padding: 2rem;
          }
          .dashboard-stats {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
          }
          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2rem;
          }
        }

        /* Large Desktop */
        @media (min-width: 1441px) {
          .hero-title {
            font-size: 5rem;
          }
          .hero-subtitle {
            font-size: 1.75rem;
          }
        }

        /* Header Responsive */
        @media (max-width: 640px) {
          .header-content {
            padding: 0 1rem;
          }
          .header-title {
            font-size: 1.5rem;
          }
          .header-button {
            padding: 0.5rem 1rem;
            font-size: 0.875rem;
          }
        }

        /* Navigation Menu for Mobile */
        @media (max-width: 768px) {
          .nav-menu {
            display: none;
          }
          .mobile-menu-button {
            display: block;
          }
        }
      `}</style>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 header-content">
            <div className="flex items-center space-x-3">
              <div className="">
                <Image src="/DXC-Technology.png" alt="Description of the image" width={125} height={30} className=""/>
              </div>
              {/* <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent header-title">
                StageManager
              </h1> */}
            </div>
            <Link href="/Login">
            <button className="bg-gradient-to-r bg-purple-800 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 header-button">
              Se Connecter
            </button>
            </Link>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-600 text-sm font-medium mb-8">
              <CheckCircle className="w-4 h-4 mr-2" />
              Plateforme de Gestion des Stages
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Gérez vos{" "}
              <span className="bg-gradient-to-r bg-purple-800 bg-clip-text text-transparent">
                stagiaires
              </span>
              <br />
              en toute simplicité
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Une solution complète pour la gestion des stages : inscriptions, validations, 
              suivi des stagiaires et génération de rapports.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/Login">
              <button className="bg-gradient-to-r bg-purple-800 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                Commencer Maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Fonctionnalités Principales
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Découvrez toutes les fonctionnalités qui font de StageManager 
              la solution idéale pour votre gestion de stages.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Dashboard Preview */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tableau de Bord
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Visualisez toutes vos données en un coup d'œil avec notre interface moderne.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 max-w-4xl mx-auto dashboard-preview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 dashboard-stats">
              {[
                { value: "156", label: "Total Stagiaires", color: "bg-purple-100 text-purple-600" },
                { value: "24", label: "Encadrants", color: "bg-blue-100 text-blue-600" },
                { value: "12", label: "En Cours", color: "bg-green-100 text-green-600" },
                { value: "8", label: "En Attente", color: "bg-orange-100 text-orange-600" }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 sm:p-6 text-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-2 sm:mb-3`}>
                    <span className="text-lg sm:text-xl font-bold">{stat.value}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Stagiaires Récents
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {[
                  { name: "Ahmed Benali", email: "ahmed.benali@email.com", status: "En attente" },
                  { name: "Fatima Zahra", email: "fatima.zahra@email.com", status: "Approuvé" },
                  { name: "Youssef Alami", email: "youssef.alami@email.com", status: "En cours" }
                ].map((intern, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm font-medium">
                          {intern.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{intern.name}</p>
                        <p className="text-xs text-gray-500 hidden sm:block">{intern.email}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                      {intern.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">StageManager</h3>
              </div>
              <p className="text-gray-400">
                La solution complète pour la gestion de vos stages et stagiaires.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Fonctionnalités</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Gestion des stagiaires</li>
                <li>Validation des candidatures</li>
                <li>Rapports détaillés</li>
                <li>Tableau de bord</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>Aide en ligne</li>
                <li>Contact support</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li>À propos</li>
                <li>Carrières</li>
                <li>Partenaires</li>
                <li>Blog</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 StageManager. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}