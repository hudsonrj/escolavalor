import { Routes, Route } from 'react-router-dom';
import App from './App';
import PrivacidadePage from './pages/PrivacidadePage';
import TermosPage from './pages/TermosPage';
import SobrePage from './pages/SobrePage';
import ContatoPage from './pages/ContatoPage';

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/privacidade" element={<PrivacidadePage />} />
      <Route path="/termos" element={<TermosPage />} />
      <Route path="/sobre" element={<SobrePage />} />
      <Route path="/contato" element={<ContatoPage />} />
    </Routes>
  );
}
