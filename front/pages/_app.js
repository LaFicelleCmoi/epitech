import '../style/signup.css';
import "../style/serverUI.css";
import '../style/channelUI.css';
import '../style/chatUI.css';
import '../style/homepage.css';
import '../style/mainContent.css';
import '../style/dm.css';
import { I18nProvider } from '../i18n/I18nContext';

export default function App({ Component, pageProps }) {
  return (
    <I18nProvider>
      <Component {...pageProps} />
    </I18nProvider>
  );
}
