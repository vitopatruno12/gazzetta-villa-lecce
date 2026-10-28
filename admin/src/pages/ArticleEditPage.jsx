import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

const empty = {
  title: '',
  subtitle: '',
  body: '',
  type: 'notizia',
  status: 'draft',
  location: '',
  event_start: '',
  event_end: '',
  is_sponsored: false,
  company_id: '',
  cover_url: '',
  video_url: '',
};

export default function ArticleEditPage() {
  const { id } = useParams();
  const isNew = !id || id === 'nuovo';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    api.get('/api/companies/admin/all').then(setCompanies).catch(() => {});
    if (!isNew) {
      api
        .get(`/api/articles/admin/${id}`)
        .then((a) =>
          setForm({
            ...empty,
            ...a,
            company_id: a.company_id || '',
            event_start: a.event_start ? String(a.event_start).slice(0, 10) : '',
            event_end: a.event_end ? String(a.event_end).slice(0, 10) : '',
          })
        )
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      ...form,
      company_id: form.company_id || null,
      event_start: form.event_start || null,
      event_end: form.event_end || null,
    };
    try {
      if (isNew) {
        const created = await api.post('/api/articles', payload);
        navigate(`/articoli/${created.id}`);
      } else {
        await api.put(`/api/articles/${id}`, payload);
        navigate('/articoli');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h1 className="h3 mb-3">{isNew ? 'Nuovo articolo' : 'Modifica articolo'}</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={onSubmit} className="bg-white p-3 rounded shadow-sm">
        <Form.Group className="mb-3">
          <Form.Label>Titolo</Form.Label>
          <Form.Control value={form.title} onChange={set('title')} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Sottotitolo</Form.Label>
          <Form.Control value={form.subtitle || ''} onChange={set('subtitle')} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Testo</Form.Label>
          <Form.Control as="textarea" rows={10} value={form.body} onChange={set('body')} />
        </Form.Group>
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Select value={form.type} onChange={set('type')}>
                <option value="notizia">Notizia</option>
                <option value="evento">Evento</option>
                <option value="avviso">Avviso</option>
                <option value="sponsorizzato">Sponsorizzato</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Stato</Form.Label>
              <Form.Select value={form.status} onChange={set('status')}>
                <option value="draft">Bozza</option>
                <option value="published">Pubblicato</option>
                <option value="archived">Archiviato</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Azienda (opzionale)</Form.Label>
              <Form.Select value={form.company_id || ''} onChange={set('company_id')}>
                <option value="">—</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Contenuto sponsorizzato"
            checked={Boolean(form.is_sponsored)}
            onChange={set('is_sponsored')}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Luogo</Form.Label>
          <Form.Control value={form.location || ''} onChange={set('location')} />
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Data inizio evento</Form.Label>
              <Form.Control type="date" value={form.event_start || ''} onChange={set('event_start')} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Data fine evento</Form.Label>
              <Form.Control type="date" value={form.event_end || ''} onChange={set('event_end')} />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>URL copertina</Form.Label>
          <Form.Control value={form.cover_url || ''} onChange={set('cover_url')} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Link video Facebook</Form.Label>
          <Form.Control
            value={form.video_url || ''}
            onChange={set('video_url')}
            placeholder="https://www.facebook.com/watch/?v=..."
          />
        </Form.Group>
        <Button type="submit">Salva</Button>
      </Form>
    </>
  );
}
