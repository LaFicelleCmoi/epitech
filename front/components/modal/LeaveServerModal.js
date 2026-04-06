'use client';

export default function LeaveServerModal({
  isOpen,
  onClose,
  serverId,
  onServerLeft
}) {
  if (!isOpen) return null;

  const handleLeave = async () => {
    if (!serverId) return alert("Aucun serveur sélectionné !");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:3001/servers/${serverId}/leave`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (!res.ok) throw new Error("Impossible de quitter le serveur");

      onServerLeft(serverId);
      onClose();

    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sortie du serveur !");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="server-modal">
        <h2>Quitter le serveur</h2>
        <p>Êtes-vous sûr de vouloir quitter ce serveur ?</p>

        <div className="modal-buttons">
          <button className="delete-btn" onClick={handleLeave}>
            Quitter
          </button>

          <button className="cancel-btn" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}