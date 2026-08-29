import { useContext } from 'react'
import { InmobiliariaContext } from '../context/InmobiliariaContext'

function Vistadashboard() {
  const { inmuebles, clientes, alquileres } = useContext(InmobiliariaContext) || { inmuebles: [], clientes: [], alquileres: [] }

  const cardStyle = {
    flex: 1,
    minWidth: '200px',
    background: '#f8fafc',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>📈 Dashboard General</h1>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Propiedades</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0', color: '#0f172a' }}>{inmuebles.length}</p>
        </div>
        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Clientes</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0', color: '#0f172a' }}>{clientes.length}</p>
        </div>
        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Contratos Activos</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0', color: '#16a34a' }}>{alquileres.length}</p>
        </div>
      </div>
    </div>
  )
}

export default Vistadashboard