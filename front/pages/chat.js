import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useI18n } from '../i18n/I18nContext';
import ServerList from '../components/server/ServerList';
import ChannelList from '../components/server/ChannelList';
import MainContent from '../components/layout/MainContent';
import ServerUsers from '../components/server/ServerUsers';
import DMList from '../components/dm/DMList';
import DMChat from '../components/dm/DMChat';
import { sendNotification } from '../utils/notifications';

export default function Home() {
  const { t } = useI18n();
  const [currentChannel, setCurrentChannel] = useState(null);
  const [currentServer, setCurrentServer] = useState(null);
  const [user, setUser] = useState(null);
  const [servers, setServers] = useState([]);
  const [view, setView] = useState('servers');
  const [activeConversation, setActiveConversation] = useState(null);
  const [unreadDMs, setUnreadDMs] = useState({});
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadChannels, setUnreadChannels] = useState({}); // { channelId: count }
  const globalSocket = useRef(null);
  const activeConvRef = useRef(null);
  const currentChannelRef = useRef(null);

  useEffect(() => { activeConvRef.current = activeConversation; }, [activeConversation]);
  useEffect(() => { currentChannelRef.current = currentChannel; }, [currentChannel]);

  // Global socket for DMs + channel messages
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let currentUserId;
    try {
      currentUserId = JSON.parse(atob(token.split('.')[1])).id;
    } catch (e) { return; }

    const sock = io("http://localhost:3001", { auth: { token } });
    globalSocket.current = sock;

    // Once connected, join ALL channels from ALL servers so we receive messages
    sock.on('connect', async () => {
      try {
        const res = await fetch("http://localhost:3001/servers/members", {
          headers: { Authorization: "Bearer " + token }
        });
        if (!res.ok) return;
        const data = await res.json();
        const myServers = data.data || [];

        for (const server of myServers) {
          try {
            const chRes = await fetch(`http://localhost:3001/servers/${server.id}/channels`, {
              headers: { Authorization: "Bearer " + token }
            });
            if (!chRes.ok) continue;
            const chData = await chRes.json();
            for (const ch of (chData.data || [])) {
              sock.emit('join channel', ch.id);
            }
          } catch (e) {}
        }
      } catch (e) {}
    });

    // DM unread tracking
    sock.on('direct message', (data) => {
      if (data.userId === currentUserId) return;
      const convId = data.conversationId;
      if (activeConvRef.current?._id === convId) return;

      setUnreadDMs(prev => {
        const existing = prev[convId] || { count: 0 };
        return {
          ...prev,
          [convId]: {
            count: existing.count + 1,
            senderId: data.userId,
            senderName: data.sender
          }
        };
      });

      sendNotification(`${data.sender}`, data.content);
    });

    // Channel message unread tracking + mention notification
    sock.on('channel message', (data) => {
      if (data.userId === currentUserId) return;
      const chId = data.channelId;

      // Check if user is mentioned
      let userName;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userName = payload.name || payload.first_name || '';
      } catch (e) {}

      const isMentioned = userName && data.msg &&
        data.msg.toLowerCase().includes(`@${userName.toLowerCase()}`);

      if (isMentioned) {
        sendNotification(`${data.sender} mentioned you`, data.msg);
      }

      // Don't count if this channel is currently open
      if (currentChannelRef.current?.id === chId) return;

      setUnreadChannels(prev => ({
        ...prev,
        [chId]: (prev[chId] || 0) + 1
      }));
    });

    return () => sock.disconnect();
  }, []);

  // Recalculate total DM unread
  useEffect(() => {
    const total = Object.values(unreadDMs).reduce((sum, v) => sum + v.count, 0);
    setTotalUnread(total);
  }, [unreadDMs]);

  const handleServerLeft = (serverId) => {
    if (currentServer?.id === serverId) {
      setCurrentServer(null);
      setCurrentChannel(null);
    }
    setServers(prev => prev.filter(s => s.id !== serverId));
  };

  const handleServerSelect = (server) => {
    setCurrentServer(server);
    setCurrentChannel(null);
    setView('servers');
    setActiveConversation(null);
  };

  const handleChannelSelect = (channel) => {
    setCurrentChannel(channel);

    // Clear unread for this channel
    if (channel?.id) {
      setUnreadChannels(prev => {
        const copy = { ...prev };
        delete copy[channel.id];
        return copy;
      });
    }
  };

  const handleDMSelect = (conversation) => {
    setActiveConversation(conversation);
    setCurrentServer(null);
    setCurrentChannel(null);

    if (conversation?._id) {
      setUnreadDMs(prev => {
        const copy = { ...prev };
        delete copy[conversation._id];
        return copy;
      });
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:3001/auth/me", {
          headers: token ? { Authorization: "Bearer " + token } : {},
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data.data);
      } catch (err) {
        console.error("Erreur récupération user", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="container">
      <div className="server-list">
        <div
          className={`server-icon dm-icon ${view === 'dm' ? 'active-server' : ''}`}
          onClick={() => { setView('dm'); setCurrentServer(null); setCurrentChannel(null); }}
          title={t('dm.title')}
        >
          DM
          {totalUnread > 0 && (
            <span className="dm-badge-total">{totalUnread}</span>
          )}
        </div>

        <div className="server-separator"></div>

        <ServerList
          servers={servers}
          setServers={setServers}
          onServerSelect={handleServerSelect}
          isInline={true}
          unreadChannels={unreadChannels}
        />
      </div>

      {view === 'dm' ? (
        <div style={styles.rightSide}>
          <DMList
            onConversationSelect={handleDMSelect}
            activeConversation={activeConversation}
            unreadDMs={unreadDMs}
          />
          <DMChat conversation={activeConversation} />
        </div>
      ) : !currentServer ? (
        <div className="main-content-empty">
          <h2 className="main-content-title">
            {t('server.welcome')}
          </h2>
          <p className="main-content-text">
            {t('server.welcomeText')}
          </p>
        </div>
      ) : (
        <div style={styles.rightSide}>
          <ChannelList
            serverId={currentServer.id}
            serverName={currentServer.name}
            onChannelSelect={handleChannelSelect}
            user={user}
            onServerLeft={handleServerLeft}
            unreadChannels={unreadChannels}
            currentChannel={currentChannel}
          />

          <MainContent currentChannel={currentChannel} />

          <ServerUsers serverId={currentServer.id} />
        </div>
      )}

      <style jsx>{`
        .container {
          display: flex;
          height: 100vh;
        }

        .main-content-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

const styles = {
  rightSide: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
};
