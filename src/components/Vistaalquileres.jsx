import { useContext } from 'react'
import { InmobiliariaContext } from '../context/InmobiliariaContext'

function Vistaalquileres() {
  const { alquileres } = useContext(InmobiliariaContext) || { alquileres: [] }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>📋 Contratos de Alquiler</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Inmueble</th>
            <th style={{ padding: '12px' }}>Inquilino</th>
            <th style={{ padding: '12px' }}>Monto</th>
            <th style={{ padding: '12px' }}>Vencimiento</th>
            <th style={{ padding: '12px' }}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {alquileres.map((a) => (
            <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>{a.inmueble}</td>
              <td style={{ padding: '12px' }}>{a.inquilino}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>${a.monto.toLocaleString()}</td>
              <td style={{ padding: '12px' }}>{a.vencimiento}</td>
              <td style={{ padding: '12px' }}><span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{a.estado}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Vistaalquileres