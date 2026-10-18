import { useEffect, useState } from 'react';
import { Badge, Button, Spinner, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function ArticlesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api
      .get('/api/articles/admin/all')
      .then(setRows)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!window.confirm('Eliminare questo articolo?')) return;
    await api.del(`/api/articles/${id}`);
    load();
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Articoli</h1>
        <Button as={Link} to="/articoli/nuovo">
          Nuovo
        </Button>
      </div>
      <Table responsive hover className="bg-white">
        <thead>
          <tr>
            <th>Titolo</th>
            <th>Tipo</th>
            <th>Stato</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>
                <Link to={`/articoli/${r.id}`}>{r.title}</Link>
                {r.is_sponsored && (
                  <Badge bg="warning" text="dark" className="ms-2">
                    Sponsor
                  </Badge>
                )}
              </td>
              <td>{r.type}</td>
              <td>{r.status}</td>
              <td className="text-end">
                <Button size="sm" variant="outline-danger" onClick={() => remove(r.id)}>
                  Elimina
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
