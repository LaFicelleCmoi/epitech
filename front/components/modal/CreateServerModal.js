'use client';

import { useState } from "react";

export default function CreateServerModal({ isOpen, onClose, onServerCreated }) {

  const [tab, setTab] = useState("create");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ name })
      });

      if (!response.ok) throw new Error();

      const data = await response.json();

      onServerCreated(data);
      onClose();

    } catch (err) {
      console.error(err);
      alert("Erreur de création de serveur !");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();

    try {

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:3001/servers/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ inviteCode })
      });

      if (!response.ok) throw new Error();

      const data = await response.json();

      onServerCreated(data);
      onClose();

    } catch (err) {
      console.error(err);
      alert("Impossible de rejoindre ce serveur");
    }
  };

  return (
    <div className="modal-overlay">

      <div className="server-modal">

        <div className="modal-tabs">

          <button
            className={tab === "create" ? "tab active" : "tab"}
            onClick={() => setTab("create")}
          >
            Créer
          </button>

          <button
            className={tab === "join" ? "tab active" : "tab"}
            onClick={() => setTab("join")}
          >
            Rejoindre
          </button>

        </div>

        {tab === "create" && (
          <>
            <h2>Créer un serveur</h2>

            <form onSubmit={handleSubmit}>

              <input
                type="text"
                placeholder="Nom du serveur"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="modal-buttons">

                <button className="create-btn" type="submit">
                  Créer
                </button>

                <button
                  className="cancel-btn"
                  type="button"
                  onClick={onClose}
                >
                  Annuler
                </button>

              </div>

            </form>
          </>
        )}

        {tab === "join" && (
          <>
            <h2>Rejoindre un serveur</h2>

            <form onSubmit={handleJoin}>

              <input
                type="text"
                placeholder="Code d'invitation"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
              />

              <div className="modal-buttons">

                <button className="create-btn" type="submit">
                  Rejoindre
                </button>

                <button
                  className="cancel-btn"
                  type="button"
                  onClick={onClose}
                >
                  Annuler
                </button>

              </div>

            </form>
          </>
        )}

      </div>

    </div>
  );
}