import { useContext } from 'react'
import { InmobiliariaContext } from '../context/InmobiliariaContext'

function Vistamovimientos() {
  const { movimientos } = useContext(InmobiliariaContext) || { movimientos: [] }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>📊 Movimientos de Caja</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Fecha</th>
            <th style={{ padding: '12px' }}>Tipo</th>
            <th style={{ padding: '12px' }}>Concepto</th>
            <th style={{ padding: '12px' }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr key={m.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>{m.fecha}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem', background: m.tipo === 'Ingreso' ? '#dcfce7' : '#fee2e2', color: m.tipo === 'Ingreso' ? '#166534' : '#991b1b' }}>
                  {m.tipo}
                </span>
              </td>
              <td style={{ padding: '12px' }}>{m.concepto}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: m.tipo === 'Ingreso' ? '#16a34a' : '#dc2626' }}>
                {m.tipo === 'Ingreso' ? '+' : '-'}${m.monto.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Vistamovimientos