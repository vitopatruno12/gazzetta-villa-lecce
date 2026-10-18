import { Col, Container, Row } from 'react-bootstrap';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from '../api/client';

export default function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <Row className="g-0">
        <Col md={3} lg={2} className="admin-sidebar p-3">
          <h1 className="h5 mb-4">Pannello admin</h1>
          <nav className="d-grid gap-1">
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/articoli">Articoli</NavLink>
            <NavLink to="/aziende">Aziende</NavLink>
            <NavLink to="/pubblicita">Pubblicità</NavLink>
          </nav>
          <button type="button" className="btn btn-sm btn-outline-light mt-4" onClick={logout}>
            Esci
          </button>
        </Col>
        <Col md={9} lg={10} className="admin-main">
          <Container fluid>
            <Outlet />
          </Container>
        </Col>
      </Row>
    </div>
  );
}
