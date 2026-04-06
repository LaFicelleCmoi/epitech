'use client';

import { useEffect, useState, useRef } from "react";
import { useI18n } from "../../i18n/I18nContext";
import CreateChannelModal from "../modal/CreateChannelModal";
import EditServerModal from "../modal/EditServerModal";
import DeleteServerModal from "../modal/DeleteServerModal";
import EditChannelModal from "../modal/EditChannelModal";
import DeleteChannelModal from "../modal/DeleteChannelModal";
import LeaveServerModal from "../modal/LeaveServerModal";
import UserPanel from "../layout/UserPanel";

export default function ChannelList({ serverId, serverName, onChannelSelect, user, onServerLeft, unreadChannels = {}, currentChannel, onUserUpdate }) {
  const { t } = useI18n();
  const [channels, setChannels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [isServerPopupOpen, setIsServerPopupOpen] = useState(false);
  const serverPopupRef = useRef();
  const [isEditServerModalOpen, setIsEditServerModalOpen] = useState(false);
  const [isDeleteServerModalOpen, setIsDeleteServerModalOpen] = useState(false);
  const [activeChannelPopup, setActiveChannelPopup] = useState(null);
  const channelPopupRef = useRef();
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isEditChannelModalOpen, setIsEditChannelModalOpen] = useState(false);
  const [isDeleteChannelModalOpen, setIsDeleteChannelModalOpen] = useState(false);
  const [isLeaveServerModalOpen, setIsLeaveServerModalOpen] = useState(false);

  const canCreateChannel = role === "admin" || role === "owner";
  const canManageServer = role === "owner";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (serverPopupRef.current && !serverPopupRef.current.contains(e.target)) {
        setIsServerPopupOpen(false);
      }
      if (channelPopupRef.current && !channelPopupRef.current.contains(e.target)) {
        setActiveChannelPopup(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!serverId) return;
    const fetchChannels = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`http://localhost:3001/servers/${serverId}/channels`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setChannels(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChannels();
  }, [serverId]);

  useEffect(() => {
    if (!serverId) return;
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`http://localhost:3001/servers/${serverId}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setRole(data.data.role);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserRole();
  }, [serverId]);

  const handleCopyInvite = async () => {
    if (!serverId) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3001/servers/${serverId}/inviteCode`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      await navigator.clipboard.writeText(data.data.inviteCode);
      alert(t('server.inviteCopied'));
    } catch (err) {
      console.error(err);
    }
  };

  if (!serverId) {
    return <div className="channel-container">{t('server.selectServer')}</div>;
  }

  return (
    <div className="channel-container">
      <div className="channel-header">
        <div style={{ position: "relative" }}>
          <button onClick={() => setIsServerPopupOpen(prev => !prev)}>⋮</button>

          {isServerPopupOpen && (
            <div ref={serverPopupRef} className="server-popup">
              {canManageServer && (
                <>
                  <button onClick={() => { setIsEditServerModalOpen(true); setIsServerPopupOpen(false); }}>
                    {t('server.editName')}
                  </button>
                  <button onClick={() => { setIsDeleteServerModalOpen(true); setIsServerPopupOpen(false); }}>
                    {t('server.deleteServer')}
                  </button>
                </>
              )}

              {!canManageServer && (
                <button onClick={() => { setIsLeaveServerModalOpen(true); setIsServerPopupOpen(false); }}>
                  {t('server.leaveServer')}
                </button>
              )}
            </div>
          )}
        </div>

        <span>{serverName || "Channels"}</span>

        <button className="invite-btn" onClick={handleCopyInvite} title={t('server.inviteFriends')}>
          {t('server.inviteFriends')}
        </button>
      </div>

      {canCreateChannel && (
        <div className="create-channel" onClick={() => setIsModalOpen(true)}>
          {t('server.createChannel')}
        </div>
      )}

      {channels.map(channel => {
        const isPopupOpen = activeChannelPopup === channel.id;
        const unread = unreadChannels[channel.id] || 0;
        const isActive = currentChannel?.id === channel.id;

        return (
          <div
            key={channel.id}
            className={`channel-item ${isPopupOpen ? 'active-popup' : ''} ${isActive ? 'channel-active' : ''} ${unread > 0 ? 'channel-has-unread' : ''}`}
            style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}
          >
            {canCreateChannel && (
              <div style={{ position: "relative" }}>
                <button
                  className="channel-options-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveChannelPopup(prev => prev === channel.id ? null : channel.id);
                  }}
                >
                  ⋮
                </button>

                {isPopupOpen && (
                  <div ref={channelPopupRef} className="channel-popup">
                    <button onClick={() => {
                      setSelectedChannel(channel);
                      setIsEditChannelModalOpen(true);
                      setActiveChannelPopup(null);
                    }}>
                      {t('server.editChannel')}
                    </button>
                    <button onClick={() => {
                      setSelectedChannel(channel);
                      setIsDeleteChannelModalOpen(true);
                      setActiveChannelPopup(null);
                    }}>
                      {t('server.deleteChannel')}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", width: "100%" }}
              onClick={() => onChannelSelect(channel)}
            >
              <div className="channel-avatar-wrapper">
                <div className="channel-avatar" />
                {unread > 0 && (
                  <span className="channel-unread-badge">{unread}</span>
                )}
              </div>
              <span className={unread > 0 ? 'channel-name-unread' : ''}>{channel.name}</span>
            </div>
          </div>
        );
      })}

      <CreateChannelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} serverId={serverId}
        onChannelCreated={newChannel => setChannels(prev => [...prev, newChannel])} />

      <EditServerModal isOpen={isEditServerModalOpen} onClose={() => setIsEditServerModalOpen(false)}
        serverId={serverId} currentName={serverName}
        onServerUpdated={(data) => console.log("Serveur modifié", data)} />

      <DeleteServerModal isOpen={isDeleteServerModalOpen} onClose={() => setIsDeleteServerModalOpen(false)}
        serverId={serverId} onServerDeleted={(id) => console.log("Serveur supprimé", id)} />

      <EditChannelModal isOpen={isEditChannelModalOpen} onClose={() => setIsEditChannelModalOpen(false)}
        channelId={selectedChannel?.id} currentName={selectedChannel?.name}
        onChannelUpdated={(updatedChannel) => {
          setChannels(prev => prev.map(c => c.id === updatedChannel.id ? updatedChannel : c));
        }} />

      <DeleteChannelModal isOpen={isDeleteChannelModalOpen} onClose={() => setIsDeleteChannelModalOpen(false)}
        channelId={selectedChannel?.id}
        onChannelDeleted={(id) => { setChannels(prev => prev.filter(c => c.id !== id)); }} />

      <LeaveServerModal isOpen={isLeaveServerModalOpen} onClose={() => setIsLeaveServerModalOpen(false)}
        serverId={serverId}
        onServerLeft={(id) => { if (onServerLeft) onServerLeft(serverId); setIsLeaveServerModalOpen(false); }} />

      <UserPanel user={user} onUserUpdate={onUserUpdate} />
    </div>
  );
}
