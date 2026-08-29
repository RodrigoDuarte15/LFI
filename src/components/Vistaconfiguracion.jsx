function Vistaconfiguracion() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>⚙️ Configuración del Sistema</h1>
      <p style={{ color: '#64748b' }}>Ajustes generales de la plataforma Inmobiliaria.</p>
      <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <p><strong>Nombre de la Empresa:</strong> La Finca Inmobiliaria</p>
        <p><strong>Moneda principal:</strong> ARS ($)</p>
        <p><strong>Versión del sistema:</strong> 1.0.0</p>
      </div>
    </div>
  )
}

export default Vistaconfiguracion