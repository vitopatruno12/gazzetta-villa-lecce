import { Navigate, Route, Routes } from 'react-router-dom';
import { getToken } from './api/client';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleEditPage from './pages/ArticleEditPage';
import CompaniesPage from './pages/CompaniesPage';
import AdsPage from './pages/AdsPage';

function PrivateRoute({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="articoli" element={<ArticlesPage />} />
        <Route path="articoli/nuovo" element={<ArticleEditPage />} />
        <Route path="articoli/:id" element={<ArticleEditPage />} />
        <Route path="aziende" element={<CompaniesPage />} />
        <Route path="pubblicita" element={<AdsPage />} />
      </Route>
    </Routes>
  );
}
