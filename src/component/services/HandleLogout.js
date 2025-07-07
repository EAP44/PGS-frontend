"use client";
import Cookies from "js-cookie";

export default async function HandleLogout() {
  try {
    const token = Cookies.get("token");

    await fetch("/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    Cookies.remove("token");
    Cookies.remove("role");
  } catch (error) {
    console.error("Logout error:", error);
  }
}
