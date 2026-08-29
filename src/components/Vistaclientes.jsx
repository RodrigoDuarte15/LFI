import { useContext } from 'react'
import { InmobiliariaContext } from '../context/InmobiliariaContext'

function Vistaclientes() {
  const { clientes } = useContext(InmobiliariaContext) || { clientes: [] }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>👥 Clientes (Inquilinos y Propietarios)</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Nombre</th>
            <th style={{ padding: '12px' }}>Tipo</th>
            <th style={{ padding: '12px' }}>Teléfono</th>
            <th style={{ padding: '12px' }}>Email</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.nombre}</td>
              <td style={{ padding: '12px' }}>{c.tipo}</td>
              <td style={{ padding: '12px' }}>{c.telefono}</td>
              <td style={{ padding: '12px' }}>{c.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Vistaclientes