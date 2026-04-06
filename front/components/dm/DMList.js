'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';

export default function DMList({ onConversationSelect, activeConversation, unreadDMs = {} }) {
  const { t } = useI18n();
  const [conversations, setConversations] = useState([]);
  const [showNewDM, setShowNewDM] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const fetchConversations = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3001/conversations", {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversations(data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Re-fetch conversations when we get new unread DMs (new conversation might appear)
  useEffect(() => {
    const unreadConvIds = Object.keys(unreadDMs);
    const knownIds = new Set(conversations.map(c => c._id));
    const hasUnknown = unreadConvIds.some(id => !knownIds.has(id));
    if (hasUnknown) {
      fetchConversations();
    }
  }, [unreadDMs]);

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3001/servers/members", {
        headers: { Authorization: "Bearer " + token }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const servers = data.data || [];

      const allUsers = new Map();
      for (const server of servers) {
        const usersRes = await fetch(`http://localhost:3001/servers/${server.id}/users`, {
          headers: { Authorization: "Bearer " + token }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          for (const u of (usersData.data || [])) {
            allUsers.set(u.id, u);
          }
        }
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = payload.id;

      const filtered = Array.from(allUsers.values()).filter(u =>
        u.id !== currentUserId &&
        ((u.first_name || '').toLowerCase().includes(query.toLowerCase()) ||
         (u.name || '').toLowerCase().includes(query.toLowerCase()))
      );

      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const startConversation = async (targetUserId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:3001/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify({ targetUserId })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      setShowNewDM(false);
      setSearchQuery('');
      setSearchResults([]);
      fetchConversations();
      onConversationSelect(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getInitial = (user) => {
    if (!user) return '?';
    const name = user.first_name || user.name || '';
    return name.charAt(0).toUpperCase() || '?';
  };

  // Sort: conversations with unread first
  const sortedConversations = [...conversations].sort((a, b) => {
    const aUnread = unreadDMs[a._id]?.count || 0;
    const bUnread = unreadDMs[b._id]?.count || 0;
    if (bUnread !== aUnread) return bUnread - aUnread;
    return 0;
  });

  return (
    <div className="dm-list">
      <div className="dm-header">
        <span>{t('dm.title')}</span>
        <button className="dm-new-btn" onClick={() => setShowNewDM(!showNewDM)}>+</button>
      </div>

      {showNewDM && (
        <div className="dm-search">
          <input
            type="text"
            placeholder={t('dm.searchUser')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchUsers(e.target.value);
            }}
            autoFocus
          />
          <div className="dm-search-results">
            {searchResults.map(user => (
              <div
                key={user.id}
                className="dm-search-item"
                onClick={() => startConversation(user.id)}
              >
                <div className="dm-avatar-small">{getInitial(user)}</div>
                <span>{user.first_name || user.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dm-conversations">
        {conversations.length === 0 && (
          <p className="dm-empty">{t('dm.noConversations')}</p>
        )}

        {sortedConversations.map(conv => {
          const unread = unreadDMs[conv._id]?.count || 0;
          const isActive = activeConversation?._id === conv._id;

          return (
            <div
              key={conv._id}
              className={`dm-conversation-item ${isActive ? 'active' : ''} ${unread > 0 ? 'has-unread' : ''}`}
              onClick={() => onConversationSelect(conv)}
            >
              <div className="dm-avatar-letter">
                {getInitial(conv.otherUser)}
                {unread > 0 && (
                  <span className="dm-unread-badge">{unread}</span>
                )}
              </div>
              <div className="dm-conv-info">
                <span className={`dm-conv-name ${unread > 0 ? 'unread-name' : ''}`}>
                  {conv.otherUser?.first_name || conv.otherUser?.name || 'Utilisateur'}
                </span>
                {unread > 0 && (
                  <span className="dm-unread-preview">
                    {unread} {unread === 1 ? 'message' : 'messages'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
