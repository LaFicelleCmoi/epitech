'use client';

import { useState } from "react";

export default function CreateChannelModal({ isOpen, onClose, onChannelCreated, serverId }) {
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serverId) {
      alert("Aucun serveur sélectionné !");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:3001/servers/${serverId}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) throw new Error("Erreur lors de la création du channel");

      const data = await response.json();

      onChannelCreated(data);

      onClose();

      setName("");

    } catch (err) {
      console.error(err);
      alert("Impossible de créer le channel !");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="server-modal">
        <h2>Créer un channel</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom du channel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="modal-buttons">
            <button className="create-btn" type="submit">Créer</button>
            <button className="cancel-btn" type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}