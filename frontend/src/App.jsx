import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SectionPage from './pages/SectionPage';
import SponsorsPage from './pages/SponsorsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="articolo/:slug" element={<ArticlePage />} />
        <Route path="sezione/:type" element={<SectionPage />} />
        <Route path="sponsor" element={<SponsorsPage />} />
      </Route>
    </Routes>
  );
}
