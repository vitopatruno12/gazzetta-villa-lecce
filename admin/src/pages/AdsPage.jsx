import { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { api } from '../api/client';

export default function AdsPage() {
  const [slots, setSlots] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [campaignForm, setCampaignForm] = useState({
    company_id: '',
    name: '',
    status: 'active',
    priority: 5,
  });
  const [creativeForm, setCreativeForm] = useState({
    campaign_id: '',
    slot_id: '',
    title: '',
    click_url: '',
    html_body: '',
    kind: 'banner',
  });

  const load = async () => {
    const [s, co, ca, cr] = await Promise.all([
      api.get('/api/ads/slots'),
      api.get('/api/companies/admin/all'),
      api.get('/api/ads/campaigns'),
      api.get('/api/ads/creatives'),
    ]);
    setSlots(s);
    setCompanies(co);
    setCampaigns(ca);
    setCreatives(cr);
  };

  useEffect(() => {
    load()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const createCampaign = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/ads/campaigns', {
        ...campaignForm,
        priority: Number(campaignForm.priority) || 0,
      });
      setCampaignForm({ company_id: '', name: '', status: 'active', priority: 5 });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const createCreative = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/ads/creatives', creativeForm);
      setCreativeForm({
        campaign_id: '',
        slot_id: '',
        title: '',
        click_url: '',
        html_body: '',
        kind: 'banner',
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <h1 className="h3 mb-3">Pubblicità</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      <h2 className="h5">Slot disponibili</h2>
      <Table size="sm" className="bg-white mb-4">
        <thead>
          <tr>
            <th>Codice</th>
            <th>Nome</th>
            <th>Misure</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s.id}>
              <td>
                <code>{s.code}</code>
              </td>
              <td>{s.name}</td>
              <td>
                {s.width && s.height ? `${s.width}×${s.height}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row className="g-3 mb-4">
        <Col lg={6}>
          <Form onSubmit={createCampaign} className="bg-white p-3 rounded shadow-sm h-100">
            <h2 className="h6">Nuova campagna</h2>
            <Form.Group className="mb-2">
              <Form.Label>Azienda</Form.Label>
              <Form.Select
                value={campaignForm.company_id}
                onChange={(e) => setCampaignForm({ ...campaignForm, company_id: e.target.value })}
                required
              >
                <option value="">Scegli…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Nome campagna</Form.Label>
              <Form.Control
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Priorità</Form.Label>
              <Form.Control
                type="number"
                value={campaignForm.priority}
                onChange={(e) => setCampaignForm({ ...campaignForm, priority: e.target.value })}
              />
            </Form.Group>
            <Button type="submit">Crea campagna</Button>
          </Form>
        </Col>
        <Col lg={6}>
          <Form onSubmit={createCreative} className="bg-white p-3 rounded shadow-sm h-100">
            <h2 className="h6">Nuova creatività (banner / sponsor)</h2>
            <Form.Group className="mb-2">
              <Form.Label>Campagna</Form.Label>
              <Form.Select
                value={creativeForm.campaign_id}
                onChange={(e) => setCreativeForm({ ...creativeForm, campaign_id: e.target.value })}
                required
              >
                <option value="">Scegli…</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Slot</Form.Label>
              <Form.Select
                value={creativeForm.slot_id}
                onChange={(e) => setCreativeForm({ ...creativeForm, slot_id: e.target.value })}
                required
              >
                <option value="">Scegli…</option>
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Titolo</Form.Label>
              <Form.Control
                value={creativeForm.title}
                onChange={(e) => setCreativeForm({ ...creativeForm, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Link di destinazione</Form.Label>
              <Form.Control
                value={creativeForm.click_url}
                onChange={(e) => setCreativeForm({ ...creativeForm, click_url: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Testo (per post sponsorizzato)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={creativeForm.html_body}
                onChange={(e) => setCreativeForm({ ...creativeForm, html_body: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                value={creativeForm.kind}
                onChange={(e) => setCreativeForm({ ...creativeForm, kind: e.target.value })}
              >
                <option value="banner">Banner</option>
                <option value="sponsored_post">Post sponsorizzato</option>
                <option value="native">Native</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit">Crea creatività</Button>
          </Form>
        </Col>
      </Row>

      <h2 className="h5">Campagne</h2>
      <Table responsive hover size="sm" className="bg-white mb-4">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Azienda</th>
            <th>Stato</th>
            <th>Priorità</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.company_name}</td>
              <td>{c.status}</td>
              <td>{c.priority}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h2 className="h5">Creatività</h2>
      <Table responsive hover size="sm" className="bg-white">
        <thead>
          <tr>
            <th>Titolo</th>
            <th>Campagna</th>
            <th>Slot</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {creatives.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td>{c.campaign_name}</td>
              <td>
                <code>{c.slot_code}</code>
              </td>
              <td>{c.kind}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
