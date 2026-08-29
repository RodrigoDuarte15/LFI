import { Link, useLocation } from 'react-router-dom'

function Navegacion() {
  const location = useLocation()

  const linkStyle = (path) => ({
    color: location.pathname === path ? '#38bdf8' : '#ffffff',
    textDecoration: 'none',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    padding: '6px 12px',
    borderRadius: '4px',
    backgroundColor: location.pathname === path ? '#334155' : 'transparent'
  })

  return (
    <nav style={{ padding: '0.8rem 1.5rem', background: '#0f172a', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
      <strong style={{ color: 'white', fontSize: '1.2rem', marginRight: '1rem' }}>🏡 La Finca</strong>
      <Link to="/inmuebles" style={linkStyle('/inmuebles')}>Inmuebles</Link>
      <Link to="/alquileres" style={linkStyle('/alquileres')}>Alquileres</Link>
      <Link to="/clientes" style={linkStyle('/clientes')}>Clientes</Link>
      <Link to="/recibos" style={linkStyle('/recibos')}>Recibos</Link>
      <Link to="/movimientos" style={linkStyle('/movimientos')}>Movimientos</Link>
      <Link to="/dashboard" style={linkStyle('/dashboard')}>Dashboard</Link>
      <Link to="/configuracion" style={linkStyle('/configuracion')}>Configuración</Link>
      <Link to="/login" style={{ ...linkStyle('/login'), marginLeft: 'auto', background: '#2563eb', color: 'white' }}>🔑 Login</Link>
    </nav>
  )
}

export default Navegacion