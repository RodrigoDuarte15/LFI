import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (usuario && clave) {
      navigate('/inmuebles')
    } else {
      alert('Ingresá usuario y contraseña')
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', fontFamily: 'system-ui, sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ background: '#f8fafc', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '350px' }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>🔑 Iniciar Sesión</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Usuario:</label>
          <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.9rem' }}>Contraseña:</label>
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Ingresar</button>
      </form>
    </div>
  )
}

export default Login