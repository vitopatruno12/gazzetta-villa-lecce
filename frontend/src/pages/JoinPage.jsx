import { useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { apiPost } from '../api/client';
import { useClientAuth } from '../auth/ClientAuth';

const EMPTY = {
  first_name: '',
  last_name: '',
  company_name: '',
  vat_number: '',
  city: '',
  address: '',
  email: '',
  password: '',
};

export default function JoinPage() {
  const { user, login } = useClientAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  if (user?.role === 'cliente') return <Navigate to="/profilo" replace />;

  function setField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      const session = await apiPost('/api/auth/register', form);
      login(session);
      navigate('/profilo');
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Container className="py-4 info-page">
      <div className="section-kicker">Adesione</div>
      <h1 className="page-title">Modulo di adesione</h1>
      <p className="social-lead">
        Registrati con i dati dell’attività. Dopo l’invio trovi il profilo nella tua pagina cliente.
      </p>
      <form className="paper-form" onSubmit={onSubmit}>
        <div className="paper-form-grid">
          <div>
            <label htmlFor="join-first">Nome</label>
            <input
              id="join-first"
              className="form-control"
              value={form.first_name}
              onChange={(event) => setField('first_name', event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="join-last">Cognome</label>
            <input
              id="join-last"
              className="form-control"
              value={form.last_name}
              onChange={(event) => setField('last_name', event.target.value)}
              required
            />
          </div>
        </div>
        <label htmlFor="join-company">Ragione sociale</label>
        <input
          id="join-company"
          className="form-control"
          value={form.company_name}
          onChange={(event) => setField('company_name', event.target.value)}
          required
        />
        <label htmlFor="join-vat">Partita IVA</label>
        <input
          id="join-vat"
          className="form-control"
          inputMode="numeric"
          value={form.vat_number}
          onChange={(event) => setField('vat_number', event.target.value)}
          required
        />
        <label htmlFor="join-city">Città</label>
        <input
          id="join-city"
          className="form-control"
          value={form.city}
          onChange={(event) => setField('city', event.target.value)}
          required
        />
        <label htmlFor="join-address">Indirizzo</label>
        <input
          id="join-address"
          className="form-control"
          value={form.address}
          onChange={(event) => setField('address', event.target.value)}
          required
        />
        <label htmlFor="join-email">Email</label>
        <input
          id="join-email"
          className="form-control"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setField('email', event.target.value)}
          required
        />
        <label htmlFor="join-password">Password</label>
        <input
          id="join-password"
          className="form-control"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(event) => setField('password', event.target.value)}
          required
        />
        {error && <p className="paper-form-error">{error}</p>}
        <button className="paper-button" type="submit" disabled={pending}>
          {pending ? 'Invio…' : 'Registrati'}
        </button>
      </form>
      <p className="paper-form-note">
        Hai già un profilo? <Link to="/accedi">Accedi</Link>
      </p>
    </Container>
  );
}
