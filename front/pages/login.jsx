'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '../i18n/I18nContext';
import LanguageToggle from '../components/layout/LanguageToggle';

export default function Connexion() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({ mail: '', password: '' });
  const router = useRouter();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(t('auth.loginSuccess'));
        router.push("/");
      } else {
        alert(t('auth.loginError'));
      }

    } catch (error) {
      alert(t('auth.serverError'));
      console.error(error);
    }
  };

  return (
    <div className="signup-container">
      <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 3000 }}>
        <LanguageToggle />
      </div>

      <div className="employer-section">
        <h1>{t('auth.login')}</h1>

        <form id="formAnnonce" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="mail">{t('auth.email')} :</label>
            <input id="mail" type="text" value={formData.mail} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')} :</label>
            <input id="password" type="password" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit">{t('auth.loginBtn')}</button>
        </form>
      </div>

      <a href="/" className="formation-link home-link">{t('auth.backHome')}</a>
    </div>
  );
}
