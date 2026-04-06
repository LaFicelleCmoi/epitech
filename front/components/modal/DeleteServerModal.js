'use client';

export default function DeleteServerModal({ isOpen, onClose, serverId, onServerDeleted }) {
  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!serverId) return alert("Aucun serveur sélectionné !");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:3001/servers/${serverId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });

      if (!res.ok) throw new Error("Impossible de supprimer le serveur");

      onServerDeleted(serverId); // callback pour supprimer le serveur du state parent
      onClose();

    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du serveur !");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="server-modal">
        <h2>Supprimer le serveur</h2>
        <p>Êtes-vous sûr de vouloir supprimer ce serveur ? Cette action est irréversible.</p>
        <div className="modal-buttons">
          <button className="delete-btn" onClick={handleDelete}>Supprimer</button>
          <button className="cancel-btn" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}