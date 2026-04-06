'use client';
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useI18n } from "../../i18n/I18nContext";

export default function ServerUsers({ serverId }) {
  const { t } = useI18n();
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [showBanModal, setShowBanModal] = useState(null); // {user, type: 'ban'|'tempban'}
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState(60);
  const [showBanList, setShowBanList] = useState(false);
  const [bans, setBans] = useState([]);
  const popupRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io("http://localhost:3001", { auth: { token } });
    setSocket(newSocket);

    newSocket.on("online users", (users) => setOnlineUsers(users));
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!serverId) return;

    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`http://localhost:3001/servers/${serverId}/users`, {
          headers: { Authorization: "Bearer " + token }
        });
        if (!res.ok) throw new Error("Erreur récupération utilisateurs");
        const data = await res.json();
        setUsers(data.data || []);

        const tokenDecoded = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = tokenDecoded.id;
        const me = data.data.find(u => u.id === currentUserId);
        setCurrentUserRole(me?.role || null);

      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [serverId]);

  const onlineUserIds = new Set(onlineUsers.map(u => u.id));

  const changeUserRole = async (userId, role) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/servers/${serverId}/members/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Impossible de changer le rôle");

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const kickUser = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/moderation/${serverId}/kick/${userId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) throw new Error("Impossible d'expulser l'utilisateur");

      setUsers(prev => prev.filter(u => u.id !== userId));
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const banUser = async (userId, isPermanent) => {
    const token = localStorage.getItem("token");
    const endpoint = isPermanent
      ? `http://localhost:3001/moderation/${serverId}/ban/${userId}`
      : `http://localhost:3001/moderation/${serverId}/tempban/${userId}`;

    const body = isPermanent
      ? { reason: banReason }
      : { reason: banReason, duration: parseInt(banDuration) };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Impossible de bannir l'utilisateur");

      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowBanModal(null);
      setBanReason("");
      setBanDuration(60);
      setSelectedUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBans = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/moderation/${serverId}/bans`, {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBans(data.data || []);
      setShowBanList(true);
    } catch (err) {
      console.error(err);
    }
  };

  const unbanUser = async (userId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3001/moderation/${serverId}/unban/${userId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) throw new Error();
      setBans(prev => prev.filter(b => b.user_id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setSelectedUser(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderUsers = (list) => list.map(user => {
    const isOnline = onlineUserIds.has(user.id);
    const isPopupOpen = selectedUser?.id === user.id;

    return (
      <div key={user.id} className={`user-item ${isPopupOpen ? 'active-popup' : ''}`} style={{ position: "relative" }}>
        <div className="user-avatar">
          <div className={`user-status ${isOnline ? "online" : "offline"}`}></div>
        </div>

        <span className="user-name">
          {user.first_name || user.name || "Utilisateur"}
        </span>

        {isOnline && <span className="user-online-label">{t('server.online')}</span>}

        {currentUserRole && ['owner', 'admin'].includes(currentUserRole) && user.role !== 'owner' && (
          <button
            className="user-options-btn"
            onMouseDown={(e) => {
              e.stopPropagation();
              setSelectedUser(isPopupOpen ? null : user);
            }}
          >
            ⋮
          </button>
        )}

        {isPopupOpen && (
          <div ref={popupRef} className="user-popup">
            <div className="user-popup-title">{t('server.changeRole')}</div>
            <button
              onClick={() => changeUserRole(user.id, "member")}
              disabled={user.role === "member"}
            >
              Member
            </button>
            <button
              onClick={() => changeUserRole(user.id, "admin")}
              disabled={user.role === "admin"}
            >
              Admin
            </button>

            <hr style={{ border: '1px solid #40444b', margin: '4px 0' }} />

            <button onClick={() => kickUser(user.id)} style={{ color: '#ffa500' }}>
              {t('server.kick')}
            </button>
            <button
              onClick={() => { setShowBanModal({ user, type: 'ban' }); setSelectedUser(null); }}
              style={{ color: '#ff4444' }}
            >
              {t('server.ban')}
            </button>
            <button
              onClick={() => { setShowBanModal({ user, type: 'tempban' }); setSelectedUser(null); }}
              style={{ color: '#ff6644' }}
            >
              {t('server.tempBan')}
            </button>
          </div>
        )}
      </div>
    );
  });

  const owners = users.filter(u => u.role === "owner");
  const admins = users.filter(u => u.role === "admin");
  const members = users.filter(u => u.role === "member");

  return (
    <div className="users-container">
      <div className="users-header">{t('server.members')}</div>

      {currentUserRole && ['owner', 'admin'].includes(currentUserRole) && (
        <button className="ban-list-btn" onClick={fetchBans}>
          {t('modal.bannedUsers')}
        </button>
      )}

      {owners.length > 0 && (
        <div className="user-group">
          <div className="user-group-title">{t('server.owner')}</div>
          {renderUsers(owners)}
        </div>
      )}
      {admins.length > 0 && (
        <div className="user-group">
          <div className="user-group-title">{t('server.admins')}</div>
          {renderUsers(admins)}
        </div>
      )}
      {members.length > 0 && (
        <div className="user-group">
          <div className="user-group-title">{t('server.membersList')}</div>
          {renderUsers(members)}
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div className="modal-overlay">
          <div className="server-modal">
            <h2>{showBanModal.type === 'ban' ? t('server.ban') : t('server.tempBan')}</h2>
            <p>{showBanModal.user.first_name || showBanModal.user.name}</p>

            <input
              type="text"
              placeholder={t('modal.banReason')}
              value={banReason}
              onChange={e => setBanReason(e.target.value)}
            />

            {showBanModal.type === 'tempban' && (
              <input
                type="number"
                placeholder={t('modal.banDuration')}
                value={banDuration}
                onChange={e => setBanDuration(e.target.value)}
                min="1"
              />
            )}

            <div className="modal-buttons">
              <button
                className="create-btn"
                onClick={() => banUser(showBanModal.user.id, showBanModal.type === 'ban')}
                style={{ background: '#ff4444' }}
              >
                {t('modal.confirmBan')}
              </button>
              <button className="cancel-btn" onClick={() => setShowBanModal(null)}>
                {t('modal.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban List Modal */}
      {showBanList && (
        <div className="modal-overlay">
          <div className="server-modal">
            <h2>{t('modal.bannedUsers')}</h2>

            {bans.length === 0 ? (
              <p style={{ color: '#aaa' }}>Aucun ban</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {bans.map(ban => (
                  <div key={ban.id} className="ban-item">
                    <div>
                      <strong>{ban.first_name || ban.name}</strong>
                      <span style={{ color: '#aaa', marginLeft: 8 }}>
                        {ban.is_permanent ? t('modal.permanent') : `${t('modal.temporary')} - ${t('modal.expiresAt')} ${new Date(ban.expires_at).toLocaleString()}`}
                      </span>
                      {ban.reason && <span style={{ color: '#888', display: 'block' }}>{ban.reason}</span>}
                    </div>
                    <button
                      onClick={() => unbanUser(ban.user_id)}
                      style={{ background: '#45f3ff', color: '#111', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
                    >
                      {t('server.unban')}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowBanList(false)}>
                {t('modal.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
