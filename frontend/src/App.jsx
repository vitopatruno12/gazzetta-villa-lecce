import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SectionPage from './pages/SectionPage';
import SponsorsPage from './pages/SponsorsPage';
import SocialPage from './pages/SocialPage';
import ProjectPage from './pages/ProjectPage';
import ProjectPhotosPage from './pages/ProjectPhotosPage';
import AdvertisePage from './pages/AdvertisePage';
import JobsPage from './pages/JobsPage';
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="articolo/:slug" element={<ArticlePage />} />
        <Route path="sezione/:type" element={<SectionPage />} />
        <Route path="sponsor" element={<SponsorsPage />} />
        <Route path="social" element={<SocialPage />} />
        <Route path="progetto" element={<ProjectPage />} />
        <Route path="progetto/foto" element={<ProjectPhotosPage />} />
        <Route path="fai-pubblicita" element={<AdvertisePage />} />
        <Route path="lavora-con-noi" element={<JobsPage />} />
      </Route>
    </Routes>
  );
}
