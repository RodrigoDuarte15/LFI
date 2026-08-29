import { useContext, useState } from 'react'
import { InmobiliariaContext } from '../context/InmobiliariaContext'

function Vistainmuebles() {
  const { inmuebles, setInmuebles } = useContext(InmobiliariaContext) || { inmuebles: [], setInmuebles: () => {} }
  const [busqueda, setBusqueda] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [nuevo, setNuevo] = useState({ direccion: '', tipo: 'Casa', precio: '', imagen: '', estado: 'Disponible' })

  // Foto por defecto si la propiedad no tiene imagen cargada
  const fotoPorDefecto = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80'

  const handleAgregar = (e) => {
    e.preventDefault()
    if (!nuevo.direccion || !nuevo.precio) return alert('Completá dirección y precio')
    
    setInmuebles([...inmuebles, { ...nuevo, id: Date.now(), precio: Number(nuevo.precio) }])
    setNuevo({ direccion: '', tipo: 'Casa', precio: '', imagen: '', estado: 'Disponible' })
    setMostrarForm(false)
  }

  const filtrados = inmuebles.filter(i => i.direccion.toLowerCase().includes(busqueda.toLowerCase()))

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#0d2818', margin: 0 }}>Catálogo de Inmuebles</h1>
          <p style={{ color: '#666', margin: '4px 0 0' }}>Gestión de propiedades de La Finca</p>
        </div>
        <button className="btn-verde" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? '✖ Cerrar' : '➕ Agregar Propiedad'}
        </button>
      </div>

      {/* Formulario rápido con opción de URL de foto */}
      {mostrarForm && (
        <form onSubmit={handleAgregar} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <input type="text" placeholder="Dirección" value={nuevo.direccion} onChange={e => setNuevo({...nuevo, direccion: e.target.value})} style={{ padding: '8px' }} />
          <input type="number" placeholder="Precio (USD)" value={nuevo.precio} onChange={e => setNuevo({...nuevo, precio: e.target.value})} style={{ padding: '8px' }} />
          <input type="text" placeholder="URL de la Foto (Opcional)" value={nuevo.imagen} onChange={e => setNuevo({...nuevo, imagen: e.target.value})} style={{ padding: '8px' }} />
          <button type="submit" className="btn-verde">Guardar</button>
        </form>
      )}

      {/* Buscador */}
      <input 
        type="text" 
        placeholder="🔍 Buscar ubicación..." 
        value={busqueda} 
        onChange={e => setBusqueda(e.target.value)}
        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', marginBottom: '2rem' }}
      />

      {/* Grid de Tarjetas de Propiedades */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {filtrados.map((item) => (
          <div key={item.id} style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <img 
              src={item.imagen || fotoPorDefecto} 
              alt={item.direccion} 
              style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
            />
            <div style={{ padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#164229', textTransform: 'uppercase' }}>{item.tipo}</span>
              <h3 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.1rem', color: '#111' }}>{item.direccion}</h3>
              <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: '#0d2818' }}>USD {item.precio?.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Vistainmuebles