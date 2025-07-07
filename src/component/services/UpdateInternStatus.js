export default async function UpdateInternStatus(internId, status) {
  try {
    const token = Cookies.get("token");
    const response = await fetch("/api/stagiaire/update-status", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id: internId, status: status }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to update intern status");
    }
    await fetchPendingInterns();
    await fetchStats();
  } catch (err) {
    console.error("Error updating intern status:", err);
    setError("Erreur lors de la mise à jour du statut");
  }
}
