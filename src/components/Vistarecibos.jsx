import { useContext } from 'react'
import { InmobiliariaContext } from '../context/InmobiliariaContext'

function Vistarecibos() {
  const { recibos } = useContext(InmobiliariaContext) || { recibos: [] }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🧾 Recibos emitidos</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>N° Recibo</th>
            <th style={{ padding: '12px' }}>Cliente</th>
            <th style={{ padding: '12px' }}>Concepto</th>
            <th style={{ padding: '12px' }}>Monto</th>
            <th style={{ padding: '12px' }}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {recibos.map((r) => (
            <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{r.numero}</td>
              <td style={{ padding: '12px' }}>{r.cliente}</td>
              <td style={{ padding: '12px' }}>{r.concepto}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#16a34a' }}>${r.monto.toLocaleString()}</td>
              <td style={{ padding: '12px' }}>{r.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Vistarecibos