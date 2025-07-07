"use client";

import { usePathname } from "next/navigation";
import { Users, BookOpen, Settings, Trash2 } from "lucide-react";
import Link from "next/link";

export default function Navbar({ isLoaded }) {
  const pathname = usePathname();

  const menuItems = [
    { icon: Users, label: "Tableau de bord", href: "/Dashboard" },
    { icon: BookOpen, label: "Stagiaires", href: "/Stagiaires" },
    { icon: Users, label: "Encadrants", href: "/Encadrants" },
    { icon: Trash2, label: "Retirer", href: "/Stagiaires/Retirer" },
    { icon: Settings, label: "Paramètres", href: "/Parametres" },
  ];

  return (
    <nav className="p-4 space-y-2">
      {menuItems.map((item, index) => {
        const isActive = pathname === item.href;

        return (
          <Link href={item.href} key={index}>
            <div
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-500 ease-out transform
              ${isLoaded ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}
              ${isActive ? "bg-purple-100 text-purple-700" : "text-gray-600 hover:bg-gray-100"}`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
