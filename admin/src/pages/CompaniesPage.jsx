import { useEffect, useState } from 'react';
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import { api } from '../api/client';

export default function CompaniesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', city: '', website: '', email: '' });

  const load = () =>
    api
      .get('/api/companies/admin/all')
      .then(setRows)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/companies', form);
      setForm({ name: '', city: '', website: '', email: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h1 className="h3 mb-3">Aziende locali</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={onSubmit} className="bg-white p-3 rounded shadow-sm mb-4">
        <div className="row g-2">
          <div className="col-md-3">
            <Form.Control
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <Form.Control
              placeholder="Città"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <Form.Control
              placeholder="Sito web"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>
          <div className="col-md-3">
            <Form.Control
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="col-md-1">
            <Button type="submit" className="w-100">
              +
            </Button>
          </div>
        </div>
      </Form>

      <Table responsive hover className="bg-white">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Città</th>
            <th>Sito</th>
            <th>Attiva</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.city}</td>
              <td>{r.website}</td>
              <td>{r.active ? 'Sì' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
