'use client';

export default function DeleteChannelModal({
  isOpen,
  onClose,
  channelId,
  onChannelDeleted
}) {
  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!channelId) return alert("Aucun channel sélectionné !");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:3001/channels/${channelId}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token
        }
      });

      if (!res.ok) throw new Error("Impossible de supprimer le channel");

      onChannelDeleted(channelId); // update parent
      onClose();

    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du channel !");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="server-modal">
        <h2>Supprimer le channel</h2>
        <p>Cette action est irréversible.</p>
        <div className="modal-buttons">
          <button className="delete-btn" onClick={handleDelete}>
            Supprimer
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}