import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useI18n } from '../i18n/I18nContext';
import LanguageToggle from '../components/layout/LanguageToggle';

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push('/chat');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="navbar">
        <div className="logo">{t('app.name')}</div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LanguageToggle />
          <Link href="/login" className="nav-login-btn">
            {t('home.login')}
          </Link>
          <Link href="/register" className="nav-signup-btn">
            {t('home.signup')}
          </Link>
        </nav>
      </header>

      <main className="hero">
        <div className="hero-content">
          <h1>{t('home.title')} <span>{t('home.titleHighlight')}</span></h1>
          <p>{t('home.description')}</p>

          <div className="cta-container">
            <Link href="/login" className="main-btn">
              {t('home.openApp')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
