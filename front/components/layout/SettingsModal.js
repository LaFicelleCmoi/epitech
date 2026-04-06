'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n, LOCALES } from '../../i18n/I18nContext';

export default function SettingsModal({ isOpen, onClose, user, onUserUpdate }) {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarData, setAvatarData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile'); // 'profile' | 'appearance' | 'language'

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setFirstName(user.first_name || '');
      setPhone(user.phone_number || '');
      setEmail(user.mail || '');
      setAvatarPreview(user.avatar || null);
      setAvatarData(null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Max 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatarData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const body = { name, first_name: firstName, phone_number: phone, mail: email };
      if (avatarData) body.avatar = avatarData;

      const res = await fetch("http://localhost:3001/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert('Error: ' + (errData.message || res.status));
        setSaving(false);
        return;
      }
      const data = await res.json();
      if (onUserUpdate) onUserUpdate(data.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Network error');
    }
    setSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const displayName = firstName || name || 'U';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        {/* Sidebar */}
        <div className="settings-sidebar">
          <div className="settings-sidebar-title">Settings</div>

          <button className={`settings-tab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Profile
          </button>
          <button className={`settings-tab ${tab === 'appearance' ? 'active' : ''}`} onClick={() => setTab('appearance')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            Appearance
          </button>
          <button className={`settings-tab ${tab === 'language' ? 'active' : ''}`} onClick={() => setTab('language')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
            Language
          </button>

          <div className="settings-sidebar-spacer"></div>

          <button className="settings-tab settings-logout" onClick={handleLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          <button className="settings-close" onClick={onClose}>✕</button>

          {tab === 'profile' && (
            <>
              <h2 className="settings-title">Profile</h2>

              {/* Avatar */}
              <div className="settings-avatar-section">
                <div className="settings-avatar" onClick={() => fileInputRef.current?.click()}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="settings-avatar-img" />
                  ) : (
                    <span className="settings-avatar-initial">{initial}</span>
                  )}
                  <div className="settings-avatar-overlay">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <span className="settings-avatar-hint">Click to change avatar</span>
              </div>

              {/* Fields */}
              <div className="settings-fields">
                <div className="settings-field">
                  <label>{t('auth.name')}</label>
                  <input value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="settings-field">
                  <label>{t('auth.firstName')}</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="settings-field">
                  <label>{t('auth.email')}</label>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
                </div>
                <div className="settings-field">
                  <label>{t('auth.phone')}</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
              </div>

              <button className="settings-save" onClick={handleSave} disabled={saving}>
                {saving ? '...' : 'Save'}
              </button>
            </>
          )}

          {tab === 'appearance' && (
            <>
              <h2 className="settings-title">Appearance</h2>
              <div className="settings-appearance-preview">
                <div className="settings-preview-card">
                  <div className="settings-preview-avatar">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="settings-avatar-img" />
                    ) : (
                      <span>{initial}</span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{firstName || name}</div>
                    <div style={{ color: '#888', fontSize: 12 }}>{email}</div>
                  </div>
                </div>
                <p style={{ color: '#888', marginTop: 16, fontSize: 13 }}>
                  More appearance options coming soon.
                </p>
              </div>
            </>
          )}

          {tab === 'language' && (
            <>
              <h2 className="settings-title">Language</h2>
              <div className="settings-lang-grid">
                {LOCALES.map(l => (
                  <button
                    key={l.code}
                    className={`settings-lang-btn ${locale === l.code ? 'active' : ''}`}
                    onClick={() => setLocale(l.code)}
                  >
                    <span className="settings-lang-flag">{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
