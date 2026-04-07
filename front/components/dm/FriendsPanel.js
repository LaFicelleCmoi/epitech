'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';

export default function FriendsPanel({ onStartDM }) {
  const { t } = useI18n();
  const [tab, setTab] = useState('friends'); // 'friends' | 'pending' | 'sent' | 'add'
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [sent, setSent] = useState([]);
  const [addMail, setAddMail] = useState('');
  const [addMessage, setAddMessage] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchAll = async () => {
    if (!token) return;
    try {
      const [fRes, pRes, sRes] = await Promise.all([
        fetch('http://localhost:3001/friends', { headers: { Authorization: 'Bearer ' + token } }),
        fetch('http://localhost:3001/friends/pending', { headers: { Authorization: 'Bearer ' + token } }),
        fetch('http://localhost:3001/friends/sent', { headers: { Authorization: 'Bearer ' + token } }),
      ]);
      if (fRes.ok) setFriends((await fRes.json()).data || []);
      if (pRes.ok) setPending((await pRes.json()).data || []);
      if (sRes.ok) setSent((await sRes.json()).data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const sendRequest = async () => {
    if (!addMail.trim()) return;
    setAddMessage(null);
    try {
      const res = await fetch('http://localhost:3001/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ mail: addMail.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setAddMessage({ type: 'error', text: data.message || 'Error' });
        return;
      }
      setAddMessage({ type: 'success', text: 'Friend request sent!' });
      setAddMail('');
      fetchAll();
    } catch (err) {
      setAddMessage({ type: 'error', text: 'Network error' });
    }
  };

  const acceptRequest = async (friendshipId) => {
    try {
      const res = await fetch(`http://localhost:3001/friends/accept/${friendshipId}`, {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
      });
      if (res.ok) fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const removeRequest = async (friendshipId) => {
    try {
      const res = await fetch(`http://localhost:3001/friends/${friendshipId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token }
      });
      if (res.ok) fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const startDMWith = async (userId) => {
    if (!onStartDM) return;
    try {
      const res = await fetch('http://localhost:3001/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ targetUserId: userId })
      });
      if (!res.ok) return;
      const data = await res.json();
      onStartDM(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getInitial = (u) => (u?.first_name || u?.name || '?').charAt(0).toUpperCase();

  const renderUserRow = (u, actions) => (
    <div key={u.friendship_id} className="friend-row">
      <div className="friend-avatar">
        {u.avatar ? <img src={u.avatar} alt="" /> : getInitial(u)}
      </div>
      <div className="friend-info">
        <span className="friend-name">{u.first_name || u.name}</span>
        <span className="friend-mail">{u.mail}</span>
      </div>
      <div className="friend-actions">{actions}</div>
    </div>
  );

  return (
    <div className="friends-panel">
      <div className="friends-header">
        <span>Friends</span>
        <span className="friends-count">{friends.length}</span>
      </div>

      <div className="friends-tabs">
        <button className={`friends-tab ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>
          All ({friends.length})
        </button>
        <button className={`friends-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
          Pending {pending.length > 0 && <span className="friends-tab-badge">{pending.length}</span>}
        </button>
        <button className={`friends-tab ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
          Sent ({sent.length})
        </button>
        <button className={`friends-tab friends-tab-add ${tab === 'add' ? 'active' : ''}`} onClick={() => setTab('add')}>
          + Add
        </button>
      </div>

      <div className="friends-content">
        {tab === 'friends' && (
          friends.length === 0
            ? <p className="friends-empty">No friends yet</p>
            : friends.map(u => renderUserRow(u, (
                <>
                  <button className="friend-btn primary" onClick={() => startDMWith(u.id)}>DM</button>
                  <button className="friend-btn danger" onClick={() => removeRequest(u.friendship_id)}>✕</button>
                </>
              )))
        )}

        {tab === 'pending' && (
          pending.length === 0
            ? <p className="friends-empty">No pending requests</p>
            : pending.map(u => renderUserRow(u, (
                <>
                  <button className="friend-btn primary" onClick={() => acceptRequest(u.friendship_id)}>Accept</button>
                  <button className="friend-btn danger" onClick={() => removeRequest(u.friendship_id)}>Reject</button>
                </>
              )))
        )}

        {tab === 'sent' && (
          sent.length === 0
            ? <p className="friends-empty">No sent requests</p>
            : sent.map(u => renderUserRow(u, (
                <button className="friend-btn danger" onClick={() => removeRequest(u.friendship_id)}>Cancel</button>
              )))
        )}

        {tab === 'add' && (
          <div className="friends-add-form">
            <p className="friends-add-label">Add a friend by email</p>
            <input
              type="email"
              placeholder="user@email.com"
              value={addMail}
              onChange={(e) => setAddMail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendRequest()}
            />
            <button className="friend-btn primary" onClick={sendRequest}>Send Request</button>
            {addMessage && (
              <p className={`friends-add-message ${addMessage.type}`}>{addMessage.text}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
