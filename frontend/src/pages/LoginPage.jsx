import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { apiPost } from '../api/client';
import { useClientAuth } from '../auth/ClientAuth';

export default function LoginPage() {
  const { user, login } = useClientAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (user?.role === 'cliente') return <Navigate to="/profilo" replace />;

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const session = await apiPost('/api/auth/login', { email, password });
      if (session.user.role !== 'cliente') {
        setError('Questo accesso è riservato ai clienti. Usa il modulo di registrazione.');
        return;
      }
      login(session);
      navigate('/profilo');
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Container className="py-4">
      <div className="info-page">
      <div className="section-kicker">Accesso</div>
      <h1 className="page-title">Accedi</h1>
      <p className="social-lead">Entra per vedere il tuo profilo.</p>
      <form className="paper-form" onSubmit={onSubmit}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          className="form-control"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          className="form-control"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {error && <p className="paper-form-error">{error}</p>}
        <button className="paper-button" type="submit" disabled={pending}>
          {pending ? 'Accesso…' : 'Accedi'}
        </button>
      </form>
      <p className="paper-form-note">
        Non sei ancora iscritto? <Link to="/adesione">Compila il modulo di registrazione</Link>
      </p>
      </div>
    </Container>
  );
}
