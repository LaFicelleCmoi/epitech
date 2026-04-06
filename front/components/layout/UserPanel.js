'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '../../i18n/I18nContext';
import SettingsModal from './SettingsModal';

export default function UserPanel({ user, onUserUpdate }) {
  const { t } = useI18n();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const displayName = user?.first_name || user?.name || 'Utilisateur';
  const initial = displayName.charAt(0).toUpperCase();
  const email = user?.mail || '';
  const avatar = user?.avatar || null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const renderAvatar = (size, className) => {
    if (avatar) {
      return <img src={avatar} alt="avatar" className={`${className}-img`} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
    }
    return <span>{initial}</span>;
  };

  return (
    <div className="user-panel">
      <div className="user-panel-info" onClick={() => setShowPopup(!showPopup)}>
        <div className="user-panel-avatar">
          {renderAvatar(36, 'user-panel-avatar')}
          <div className="user-panel-status-dot"></div>
        </div>
        <div className="user-panel-details">
          <span className="user-panel-name">{displayName}</span>
          <span className="user-panel-status">{t('server.online')}</span>
        </div>
      </div>

      <div className="user-panel-buttons">
        <button className="user-panel-btn" title="Settings" onClick={() => { setShowSettings(true); setShowPopup(false); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      {showPopup && (
        <div className="user-panel-popup">
          <div className="user-panel-popup-header">
            <div className="user-panel-popup-avatar">
              {renderAvatar(52, 'user-panel-popup-avatar')}
            </div>
            <div className="user-panel-popup-info">
              <span className="user-panel-popup-name">{displayName}</span>
              <span className="user-panel-popup-email">{email}</span>
            </div>
          </div>

          <div className="user-panel-popup-divider"></div>

          <div className="user-panel-popup-section">
            <div className="user-panel-popup-label">{t('server.online')}</div>
          </div>

          <div className="user-panel-popup-divider"></div>

          <button className="user-panel-popup-action" onClick={() => { setShowSettings(true); setShowPopup(false); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </button>

          <button className="user-panel-popup-logout" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        onUserUpdate={onUserUpdate}
      />
    </div>
  );
}
