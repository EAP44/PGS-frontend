"use client";
import Cookies from "js-cookie";

export default async function DownloadReport(type) {
  try {
    const token = Cookies.get("token");
    const response = await fetch(`/api/reports/${type}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to download report");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport_${type}_${
      new Date().toISOString().split("T")[0]
    }.${type}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error("Error downloading report:", err);
    setError("Erreur lors du téléchargement du rapport");
  }
}
