import { useEffect, useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { apiAuthGet } from '../api/client';
import { clientToken, useClientAuth } from '../auth/ClientAuth';

const FIELDS = [
  ['first_name', 'Nome'],
  ['last_name', 'Cognome'],
  ['company_name', 'Ragione sociale'],
  ['vat_number', 'Partita IVA'],
  ['city', 'Città'],
  ['address', 'Indirizzo'],
  ['email', 'Email'],
];

export default function ProfilePage() {
  const { user, logout } = useClientAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = clientToken();
    if (!token) return;
    apiAuthGet('/api/auth/me', token)
      .then(setProfile)
      .catch(() => setError('Non riesco a leggere il profilo.'));
  }, []);

  if (!user || user.role !== 'cliente') return <Navigate to="/accedi" replace />;

  function onLogout() {
    logout();
    navigate('/');
  }

  return (
    <Container className="py-4">
      <div className="info-page">
      <div className="section-kicker">Cliente</div>
      <h1 className="page-title">Il tuo profilo</h1>
      <p className="social-lead">
        {profile?.first_name} {profile?.last_name}
      </p>
      {error && <p className="paper-form-error">{error}</p>}
      {profile ? (
        <dl className="profile-sheet">
          {FIELDS.map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{profile[key] || '—'}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <Spinner animation="border" />
      )}
      <button className="paper-button" type="button" onClick={onLogout}>
        Esci
      </button>
      </div>
    </Container>
  );
}
