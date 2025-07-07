"use client";
import Image from "next/image";
import { User, LogOut } from "lucide-react";
import Navbar from "@/component/UI/Navbar";
import HandleLogout from "../services/HandleLogout";
import { useRouter } from "next/navigation";

export default function Sidebar({ isLoaded, userProfile }) {
  const router = useRouter();
  const onLogoutClick = async () => {
    await HandleLogout();
    router.push("/Login");
  };
  return (
    <div
      className={`w-64 bg-white shadow-sm border-r border-gray-200 fixed h-full z-10 transform transition-all duration-700 ease-out ${
        isLoaded ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
      }`}
    >
      <div className="border-b border-gray-200">
        <Image
          src="/DXC-Technology.png"
          alt="Description of the image"
          width={300}
          height={100}
        />
      </div>
      <Navbar isLoaded={isLoaded} />
      <div
        className={`absolute bottom-0 w-64 p-4 border-t border-gray-200 transform transition-all duration-700 ease-out ${
          isLoaded ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
        style={{ transitionDelay: "600ms" }}
      >
        {userProfile ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {userProfile.email.charAt(0).toLowerCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {userProfile.email}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userProfile.role}
              </p>
            </div>
            <LogOut
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
              onClick={onLogoutClick}
            />
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-400 mb-2">
              <User className="w-6 h-6 mx-auto" />
            </div>
            <p className="text-xs text-gray-500">Profil indisponible</p>
            <LogOut
              className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors mx-auto mt-2"
              onClick={onLogoutClick}
            />
          </div>
        )}
      </div>
    </div>
  );
}
