import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SectionPage from './pages/SectionPage';
import SponsorsPage from './pages/SponsorsPage';
import ProjectPage from './pages/ProjectPage';
import ProjectPhotosPage from './pages/ProjectPhotosPage';
import AdvertisePage from './pages/AdvertisePage';
import JobsPage from './pages/JobsPage';
import LoginPage from './pages/LoginPage';
import JoinPage from './pages/JoinPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="articolo/:slug" element={<ArticlePage />} />
        <Route path="sezione/:type" element={<SectionPage />} />
        <Route path="sponsor" element={<SponsorsPage />} />
        <Route path="progetto" element={<ProjectPage />} />
        <Route path="progetto/foto" element={<ProjectPhotosPage />} />
        <Route path="fai-pubblicita" element={<AdvertisePage />} />
        <Route path="lavora-con-noi" element={<JobsPage />} />
        <Route path="accedi" element={<LoginPage />} />
        <Route path="adesione" element={<JoinPage />} />
        <Route path="profilo" element={<ProfilePage />} />
        <Route path="cerca" element={<SearchPage />} />
      </Route>
    </Routes>
  );
}
