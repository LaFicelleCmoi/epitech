'use client';
import { useState, useEffect } from "react";

export default function EditChannelModal({
  isOpen,
  onClose,
  channelId,
  currentName,
  onChannelUpdated
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (currentName) setName(currentName);
  }, [currentName]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!channelId) return alert("Aucun channel sélectionné !");

    console.log("Tentative de modifier le channel:", channelId, "avec le nom:", name);
    
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:3001/channels/${channelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ name })
      });

      if (!res.ok) throw new Error("Impossible de modifier le channel");

      const data = await res.json();
      console.log("API response:", data);
      onChannelUpdated(data.data); // update du state parent
      console.log("UPDATED CHANNEL:", data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification du channel !");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="server-modal">
        <h2>Modifier le channel</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="modal-buttons">
            <button type="submit" className="create-btn">Modifier</button>
            <button type="button" className="cancel-btn" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}