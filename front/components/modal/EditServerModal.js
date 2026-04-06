'use client';
import { useState, useEffect } from "react";

export default function EditServerModal({ isOpen, onClose, serverId, currentName, onServerUpdated }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (currentName) setName(currentName);
  }, [currentName]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serverId) return alert("Aucun serveur sélectionné !");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:3001/servers/${serverId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ name })
      });

      if (!res.ok) throw new Error("Impossible de modifier le serveur");

      const data = await res.json();
      onServerUpdated(data); // callback pour mettre à jour le state parent
      onClose();

    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification du serveur !");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="server-modal">
        <h2>Modifier le serveur</h2>
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