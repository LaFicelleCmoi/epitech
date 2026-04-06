'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '../i18n/I18nContext';
import LanguageToggle from '../components/layout/LanguageToggle';

export default function SignUpPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '', first_name: '', phone_number: '', mail: '', password: ''
  });
  const router = useRouter();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login");
      } else {
        alert("Erreur : " + data.message);
      }

    } catch (error) {
      console.error(error);
      alert(t('auth.serverError'));
    }
  };

  return (
    <div className="signup-container">
      <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 3000 }}>
        <LanguageToggle />
      </div>

      <div className="employer-section">
        <h1>{t('auth.signup')}</h1>

        <form id="formAnnonce" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">{t('auth.name')} :</label>
            <input id="name" type="text" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="first_name">{t('auth.firstName')} :</label>
            <input id="first_name" type="text" value={formData.first_name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="phone_number">{t('auth.phone')} :</label>
            <input id="phone_number" type="text" value={formData.phone_number} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="mail">{t('auth.email')} :</label>
            <input id="mail" type="email" value={formData.mail} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')} :</label>
            <input id="password" type="password" value={formData.password} onChange={handleChange} required />
          </div>

          <button type="submit">{t('auth.signupBtn')}</button>
        </form>
      </div>

      <a href="/" className="formation-link home-link">{t('auth.backHome')}</a>
    </div>
  );
}
