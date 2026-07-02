import { useState } from 'react'

// Mock inicial de Inmuebles con espacio para imágenes futuras
const INMUEBLES_INICIALES = [
  { id: 1, titulo: 'Finca Los Álamos', tipo: 'Finca', precio: 250000, ubicacion: 'Mendoza', disponible: true, estadoOperacion: 'Venta', imagen: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80' },
  { id: 2, titulo: 'Departamento Premium Centro', tipo: 'Departamento', precio: 450, ubicacion: 'Buenos Aires', disponible: true, estadoOperacion: 'Alquiler', imagen: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80' },
]

// Mocks iniciales para el Secretario (Recibos, Movimientos, Informes)
const RECIBOS_INICIALES = [
  { id: 'REC-001', inmueble: 'Departamento Premium Centro', monto: 450, fecha: '2026-06-01', estado: 'Cobrado' }
]

const MOVIMIENTOS_INICIALES = [
  { id: 1, tipo: 'Ingreso', monto: 450, fecha: '2026-06-02', descripcion: 'Cobro Alquiler REC-001' },
  { id: 2, tipo: 'Egreso', monto: 120, fecha: '2026-06-05', descripcion: 'Mantenimiento de bomba de agua' }
]

function App() {
  // --- CONTROL DE SESIÓN Y ACTORES ---
  const [rolActual, setRolActual] = useState('Invitado') // 'Invitado' | 'Cliente' | 'Secretario'
  const [usuarioLogueado, setUsuarioLogueado] = useState(null)
  
  // --- VISTAS DEL SISTEMA ---
  const [vistaActiva, setVistaActiva] = useState('inmuebles') // 'inmuebles' | 'perfil' | 'vender' | 'recibos' | 'movimientos' | 'informes' | 'listados'
  const [modalAuth, setModalAuth] = useState(null) // null | 'login' | 'registro'
  
  // --- ESTADOS DE DATOS ---
  const [inmuebles, setInmuebles] = useState(INMUEBLES_INICIALES)
  const [recibos, setRecibos] = useState(RECIBOS_INICIALES)
  const [movimientos, setMovimientos] = useState(MOVIMIENTOS_INICIALES)
  
  // --- FILTROS Y FORMULARIOS ---
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [notificacion, setNotificacion] = useState({ tipo: '', texto: '' })
  const [inmuebleSeleccionado, setInmuebleSeleccionado] = useState(null)
  
  // Formulario Inmuebles (Alta/Modificar)
  const [formInmueble, setFormInmueble] = useState({ id: null, titulo: '', tipo: 'Casa', precio: '', ubicacion: '', estadoOperacion: 'Venta' })
  // Formulario Recibos
  const [formRecibo, setFormRecibo] = useState({ id: '', inmueble: '', monto: '', fecha: '', estado: 'Pendiente' })
  // Formulario Movimientos
  const [formMovimiento, setFormMovimiento] = useState({ tipo: 'Ingreso', monto: '', fecha: '', descripcion: '' })
  // Filtros de Informes/Listados
  const [filtroInforme, setFiltroInforme] = useState({ fechaDesde: '', tipo: 'Todos' })

  // --- INTERRUPTOR DE ALERTA DE NOTIFICACIONES ---
  const mostrarNotificacion = (texto, tipo = 'success') => {
    setNotificacion({ texto, tipo })
    setTimeout(() => setNotificacion({ texto: '', tipo: '' }), 5000)
  }

  // --- CAMBIO RÁPIDO DE ROLES SIMULADO ---
  const cambiarRolSimulado = (rol) => {
    setRolActual(rol)
    if (rol === 'Invitado') {
      setUsuarioLogueado(null)
      setVistaActiva('inmuebles')
    } else {
      setUsuarioLogueado({ nombre: `Usuario ${rol}`, edad: 28, saldo: 500000 })
    }
    setInmuebleSeleccionado(null)
  }

  // --- CASOS DE USO: CLIENTE ---
  const realizarCompra = (inmueble) => {
    if (rolActual !== 'Cliente') return mostrarNotificacion('Restricción: Debe iniciar sesión como Cliente para comprar.', 'error')
    if (!inmueble.disponible) return mostrarNotificacion('Curso A2: El inmueble ya no está disponible.', 'error')
    
    // Simulación de confirmación
    if (confirm(`¿Confirmar la compra de "${inmueble.titulo}" por $${inmueble.precio} USD?`)) {
      setInmuebles(prev => prev.map(i => i.id === inmueble.id ? { ...i, disponible: false } : i))
      setInmuebleSeleccionado(null)
      mostrarNotificacion('¡Operación Exitosa! El inmueble se registró como vendido y se asoció a su cuenta.')
    } else {
      mostrarNotificacion('Curso A3: Operación cancelada por el usuario.', 'error')
    }
  }

  const realizarAlquiler = (inmueble) => {
    if (rolActual !== 'Cliente') return mostrarNotificacion('Restricción: Debe iniciar sesión para alquilar.', 'error')
    
    if (confirm(`¿Está seguro que quiere alquilar este inmueble?\n- ${inmueble.titulo}`)) {
      setInmuebles(prev => prev.map(i => i.id === inmueble.id ? { ...i, disponible: false } : i))
      setInmuebleSeleccionado(null)
      mostrarNotificacion('¡Operación Exitosa! El alquiler ha sido registrado en el sistema.')
    } else {
      mostrarNotificacion('Notificación: La operación fue cancelada (Flujo 1A Alquileres).', 'error')
    }
  }

  const handleVentaCliente = (e) => {
    e.preventDefault()
    if (!formInmueble.titulo || !formInmueble.precio || !formInmueble.ubicacion) {
      return mostrarNotificacion('Curso A1: Datos incompletos o incorrectos. Pide corrección.', 'error')
    }
    const nuevo = {
      id: Date.now(),
      ...formInmueble,
      precio: Number(formInmueble.precio),
      disponible: true,
      imagen: '' // Lugar reservado para cargar imagen futura
    }
    setInmuebles([...inmuebles, nuevo])
    setFormInmueble({ id: null, titulo: '', tipo: 'Casa', precio: '', ubicacion: '', estadoOperacion: 'Venta' })
    mostrarNotificacion('¡Operación Exitosa! Su inmueble fue enviado y registrado bajo revisión.')
  }

  // --- CASOS DE USO: SECRETARIO (CRUD Inmuebles) ---
  const guardarInmuebleSecretario = (e) => {
    e.preventDefault()
    if (!formInmueble.titulo || !formInmueble.precio || !formInmueble.ubicacion) {
      return mostrarNotificacion('Flujo Alternativo: Datos incorrectos o incompletos. Se solicita corrección.', 'error')
    }

    if (formInmueble.id) {
      // Modificación
      setInmuebles(prev => prev.map(i => i.id === formInmueble.id ? { ...i, ...formInmueble, precio: Number(formInmueble.precio) } : i))
      mostrarNotificacion('Notificación: Inmueble actualizado correctamente.')
    } else {
      // Alta
      const nuevo = { id: Date.now(), ...formInmueble, precio: Number(formInmueble.precio), disponible: true, imagen: '' }
      setInmuebles([...inmuebles, nuevo])
      mostrarNotificacion('Alta de Inmueble registrada exitosamente.')
    }
    setFormInmueble({ id: null, titulo: '', tipo: 'Casa', precio: '', ubicacion: '', estadoOperacion: 'Venta' })
  }

  const darDeBajaInmueble = (id) => {
    if (confirm('¿Estás seguro que quieres dar de baja?')) {
      setInmuebles(prev => prev.filter(i => i.id !== id))
      setInmuebleSeleccionado(null)
      mostrarNotificacion('El inmueble queda dado de baja del sistema.')
    } else {
      mostrarNotificacion('Curso 1A: Operación de baja cancelada.', 'error')
    }
  }

  // --- CASOS DE USO: SECRETARIO (Movimientos y Recibos) ---
  const handleAltaMovimiento = (e) => {
    e.preventDefault()
    if (!formMovimiento.monto || !formMovimiento.descripcion || !formMovimiento.fecha) {
      return mostrarNotificacion('Error: Datos inválidos detectados.', 'error')
    }
    setMovimientos([...movimientos, { id: Date.now(), ...formMovimiento, monto: Number(formMovimiento.monto) }])
    setFormMovimiento({ tipo: 'Ingreso', monto: '', fecha: '', descripcion: '' })
    mostrarNotificacion('El movimiento financiero ha sido guardado en la base de datos.')
  }

  // Filtrados dinámicos
  const inmueblesFiltrados = inmuebles.filter(i => 
    i.titulo.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
    i.ubicacion.toLowerCase().includes(filtroBusqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* BARRA SUPERIOR PARA CONTROLADOR DE EXAMEN / TESTING DE ROLES */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 flex flex-wrap justify-between items-center text-xs gap-2">
        <span className="font-mono">🔧 ENTORNO DE PRUEBAS DE CASOS DE USO:</span>
        <div className="flex gap-2">
          <button onClick={() => cambiarRolSimulado('Invitado')} className={`px-2 py-1 rounded ${rolActual === 'Invitado' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-700'}`}>Actuar como Invitado</button>
          <button onClick={() => cambiarRolSimulado('Cliente')} className={`px-2 py-1 rounded ${rolActual === 'Cliente' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-700'}`}>Actuar como Cliente</button>
          <button onClick={() => cambiarRolSimulado('Secretario')} className={`px-2 py-1 rounded ${rolActual === 'Secretario' ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-700'}`}>Actuar como Secretario</button>
        </div>
      </div>

      {/* NAVBAR PRINCIPAL DE LA FINCA */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-emerald-700 tracking-wide">LA_FINCA</h1>
          <p className="text-xs text-slate-400">Sistema Integral de Gestión Inmobiliaria</p>
        </div>

        {/* NAVEGACIÓN SEGÚN ACTOR */}
        <nav className="flex flex-wrap gap-2 md:gap-4 text-sm font-medium">
          <button onClick={() => setVistaActiva('inmuebles')} className={`px-3 py-1.5 rounded-lg ${vistaActiva === 'inmuebles' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}>Inmuebles</button>
          
          {rolActual === 'Cliente' && (
            <>
              <button onClick={() => setVistaActiva('perfil')} className={`px-3 py-1.5 rounded-lg ${vistaActiva === 'perfil' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}>Gestionar Perfil</button>
              <button onClick={() => setVistaActiva('vender')} className={`px-3 py-1.5 rounded-lg ${vistaActiva === 'vender' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}>Ofrecer Inmueble</button>
            </>
          )}

          {rolActual === 'Secretario' && (
            <>
              <button onClick={() => setVistaActiva('recibos')} className={`px-3 py-1.5 rounded-lg ${vistaActiva === 'recibos' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}>Gestionar Recibos</button>
              <button onClick={() => setVistaActiva('movimientos')} className={`px-3 py-1.5 rounded-lg ${vistaActiva === 'movimientos' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}>Movimientos Bancarios</button>
              <button onClick={() => setVistaActiva('informes')} className={`px-3 py-1.5 rounded-lg ${vistaActiva === 'informes' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}>Informes Económicos</button>
              <button onClick={() => setVistaActiva('listados')} className={`px-3 py-1.5 rounded-lg ${vistaActiva === 'listados' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}>Generar Listados</button>
            </>
          )}
        </nav>

        {/* AUTENTICACIÓN */}
        <div className="text-xs bg-slate-50 border p-2 rounded-xl flex items-center gap-3">
          <span>Modo: <b className="uppercase">{rolActual}</b></span>
          {usuarioLogueado && <span className="text-slate-500">| {usuarioLogueado.nombre}</span>}
        </div>
      </header>

      {/* BANNER DE NOTIFICACIONES GLOBALES */}
      {notificacion.texto && (
        <div className={`p-4 text-center font-bold text-sm border-b transition-all ${notificacion.tipo === 'success' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-rose-100 border-rose-300 text-rose-800'}`}>
          {notificacion.texto}
        </div>
      )}

      {/* CUERPO PRINCIPAL */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-6">
        
        {/* ================= VISTA: GESTIONAR / CONSULTAR INMUEBLES ================= */}
        {vistaActiva === 'inmuebles' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold">Catálogo de Inmuebles</h2>
                <p className="text-xs text-slate-400">Filtrá y consultá la información en tiempo real.</p>
              </div>
              <input 
                type="text" 
                placeholder="Buscar por ubicación o título..." 
                value={filtroBusqueda}
                onChange={e => setFiltroBusqueda(e.target.value)}
                className="w-full md:w-80 px-3 py-2 border rounded-xl bg-slate-50 text-sm focus:outline-emerald-600"
              />
              {rolActual === 'Secretario' && (
                <button 
                  onClick={() => { setFormInmueble({ id: null, titulo: '', tipo: 'Casa', precio: '', ubicacion: '', estadoOperacion: 'Venta' }); setInmuebleSeleccionado('formulario'); }}
                  className="bg-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-indigo-700"
                >
                  + Alta Inmueble (Secretario)
                </button>
              )}
            </div>

            {/* GRILLA DE TARJETAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {inmueblesFiltrados.length > 0 ? (
                inmueblesFiltrados.map(inm => (
                  <div key={inm.id} className="bg-white border rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      {/* ESPACIO CONFIGURADO PARA CARGA DE IMÁGENES FUTURAS */}
                      {inm.imagen ? (
                        <img src={inm.imagen} alt={inm.titulo} className="w-full h-44 object-cover" />
                      ) : (
                        <div className="w-full h-44 bg-slate-200 flex flex-col items-center justify-center p-4 border-b border-dashed border-slate-300">
                          <span className="text-xl">🖼️</span>
                          <span className="text-xs font-semibold text-slate-500 mt-1">[ ESPACIO IMAGEN FUTURA ]</span>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5">Propiedad ID: {inm.id}</span>
                        </div>
                      )}

                      <div className="p-4 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">{inm.tipo}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inm.disponible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {inm.disponible ? `Para ${inm.estadoOperacion}` : 'Vendido/Alquilado'}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">{inm.titulo}</h3>
                        <p className="text-xs text-slate-400">📍 {inm.ubicacion}</p>
                      </div>
                    </div>

                    <div className="p-4 border-t bg-slate-50 flex items-center justify-between">
                      <span className="font-extrabold text-slate-900">${inm.precio.toLocaleString()} USD</span>
                      <button 
                        onClick={() => setInmuebleSeleccionado(inm)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg"
                      >
                        Consultar Inmueble
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl text-sm text-slate-400 border border-dashed">
                  ⚠️ El sistema no encuentra coincidentes para los criterios ingresados.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= DETALLE EXTENDIDO DE UN INMUEBLE SELECCIONADO ================= */}
        {inmuebleSeleccionado && inmuebleSeleccionado !== 'formulario' && (
          <div className="mt-6 bg-white border rounded-2xl p-6 shadow-sm max-w-2xl mx-auto space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">Información Detallada del Inmueble (Caso de Uso: Consultar)</h2>
            
            {/* COMPONENTE DE IMAGEN FUTURA DENTRO DEL DETALLE */}
            {inmuebleSeleccionado.imagen ? (
              <img src={inmuebleSeleccionado.imagen} alt="" className="w-full h-56 object-cover rounded-xl" />
            ) : (
              <div className="w-full h-48 bg-slate-100 border border-dashed rounded-xl flex flex-col items-center justify-center">
                <span className="text-2xl">🏡</span>
                <span className="text-xs font-semibold text-slate-400 mt-1">[ RECUADRO RESERVADO PARA FOTO DE ALTA CALIDAD ]</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <p><b>Título:</b> {inmuebleSeleccionado.titulo}</p>
              <p><b>Ubicación:</b> {inmuebleSeleccionado.ubicacion}</p>
              <p><b>Tipo de Inmueble:</b> {inmuebleSeleccionado.tipo}</p>
              <p><b>Precio Requerido:</b> ${inmuebleSeleccionado.precio.toLocaleString()} USD</p>
              <p><b>Disponibilidad:</b> {inmuebleSeleccionado.disponible ? 'Disponible' : 'No Disponible'}</p>
              <p><b>Operación Comercial:</b> {inmuebleSeleccionado.estadoOperacion}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-end pt-4 border-t">
              {/* ACCIONES EXCLUSIVAS DEL CLIENTE */}
              {rolActual === 'Cliente' && inmuebleSeleccionado.disponible && (
                <>
                  {inmuebleSeleccionado.estadoOperacion === 'Venta' ? (
                    <button onClick={() => realizarCompra(inmuebleSeleccionado)} className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl">Comprar Inmueble</button>
                  ) : (
                    <button onClick={() => realizarAlquiler(inmuebleSeleccionado)} className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl">Alquilar Inmueble</button>
                  )}
                </>
              )}

              {/* ACCIONES EXCLUSIVAS DEL SECRETARIO */}
              {rolActual === 'Secretario' && (
                <>
                  <button onClick={() => { setFormInmueble(inmuebleSeleccionado); setInmuebleSeleccionado('formulario'); }} className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl">Modificar Inmueble</button>
                  <button onClick={() => darDeBajaInmueble(inmuebleSeleccionado.id)} className="bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl">Dar de Baja</button>
                </>
              )}

              <button onClick={() => setInmuebleSeleccionado(null)} className="bg-slate-200 text-slate-700 text-xs px-4 py-2 rounded-xl">Cerrar Consulta</button>
            </div>
          </div>
        )}

        {/* ================= FORMULARIO CRUD INMUEBLE (SECRETARIO / ALTA Y EDICIÓN) ================= */}
        {inmuebleSeleccionado === 'formulario' && (
          <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
            <h2 className="text-lg font-bold mb-4">{formInmueble.id ? 'Modificar Inmueble' : 'Alta de Inmueble'}</h2>
            <form onSubmit={guardarInmuebleSecretario} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Título Descriptivo</label>
                <input type="text" value={formInmueble.titulo} onChange={e => setFormInmueble({...formInmueble, titulo: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tipo</label>
                  <select value={formInmueble.tipo} onChange={e => setFormInmueble({...formInmueble, tipo: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                    <option>Casa</option>
                    <option>Departamento</option>
                    <option>Finca</option>
                    <option>Quinta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Operación</label>
                  <select value={formInmueble.estadoOperacion} onChange={e => setFormInmueble({...formInmueble, estadoOperacion: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                    <option>Venta</option>
                    <option>Alquiler</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Precio (USD)</label>
                  <input type="number" value={formInmueble.precio} onChange={e => setFormInmueble({...formInmueble, precio: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ubicación / Provincia</label>
                  <input type="text" value={formInmueble.ubicacion} onChange={e => setFormInmueble({...formInmueble, ubicacion: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" />
                </div>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-xl border border-dashed border-amber-300 text-[11px] text-amber-800">
                📌 <b>Nota sobre imágenes futuras:</b> El sistema vinculará dinámicamente un archivo multimedia según el ID generado tras guardar.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs">Guardar Cambios</button>
                <button type="button" onClick={() => { setInmuebleSeleccionado(null); mostrarNotificacion('Los cambios fueron cancelados por el Secretario.', 'error'); }} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-xs">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* ================= VISTA: CLIENTE (OFRECER INMUEBLE / VENDER) ================= */}
        {vistaActiva === 'vender' && rolActual === 'Cliente' && (
          <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
            <h2 className="text-lg font-bold mb-1">Formulario de Carga: Vender mi Inmueble</h2>
            <p className="text-xs text-slate-400 mb-4">Ingresá los datos correspondientes. Serán validados antes de guardarse.</p>
            <form onSubmit={handleVentaCliente} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Dirección / Nombre del Inmueble</label>
                <input type="text" value={formInmueble.titulo} onChange={e => setFormInmueble({...formInmueble, titulo: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" placeholder="Ej: Finca San Roque" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Categoría</label>
                  <select value={formInmueble.tipo} onChange={e => setFormInmueble({...formInmueble, tipo: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                    <option>Casa</option>
                    <option>Departamento</option>
                    <option>Finca</option>
                    <option>Quinta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Valor Estimado (USD)</label>
                  <input type="number" value={formInmueble.precio} onChange={e => setFormInmueble({...formInmueble, precio: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Localidad / Ubicación</label>
                <input type="text" value={formInmueble.ubicacion} onChange={e => setFormInmueble({...formInmueble, ubicacion: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="submit" className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl">Confirmar Operación</button>
                <button type="button" onClick={() => { setVistaActiva('inmuebles'); mostrarNotificacion('El cliente canceló el proceso (Curso A2 Venta).', 'error'); }} className="bg-slate-100 text-slate-500 px-4 py-2 rounded-xl text-xs">Cancelar proceso</button>
              </div>
            </form>
          </div>
        )}

        {/* ================= VISTA: CLIENTE (GESTIONAR PERFIL) ================= */}
        {vistaActiva === 'perfil' && rolActual === 'Cliente' && (
          <div className="bg-white border rounded-2xl p-6 shadow-sm max-w-md mx-auto text-sm space-y-4">
            <h2 className="text-lg font-bold">Gestionar Perfil de Usuario</h2>
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 border">
              <p><b>Titular Identificado:</b> {usuarioLogueado?.nombre}</p>
              <p><b>Restricción de Edad:</b> Mayor de edad (Verificado)</p>
              <p><b>Fondos Disponibles:</b> ${usuarioLogueado?.saldo.toLocaleString()} USD</p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => mostrarNotificacion('La información del perfil queda actualizada en el sistema.')} className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Guardar Cambios</button>
              <button onClick={() => { setVistaActiva('inmuebles'); mostrarNotificacion('El cliente decide cancelar la modificación.', 'error'); }} className="bg-slate-100 text-slate-500 text-xs px-4 py-2 rounded-xl">Cancelar</button>
            </div>
          </div>
        )}

        {/* ================= VISTA: SECRETARIO (GESTIONAR RECIBOS) ================= */}
        {vistaActiva === 'recibos' && rolActual === 'Secretario' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
              <h2 className="text-lg font-bold">Módulo Administrativo: Gestionar Recibos</h2>
              
              <form onSubmit={(e) => { e.preventDefault(); mostrarNotificacion('Recibo procesado y verificado con éxito.'); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Nº Único Recibo</label>
                  <input type="text" placeholder="REC-XXX" className="w-full p-2 border rounded-lg bg-slate-50" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Inmueble Asociado</label>
                  <input type="text" placeholder="Nombre inmueble" className="w-full p-2 border rounded-lg bg-slate-50" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Monto Mensual</label>
                  <input type="number" placeholder="Monto" className="w-full p-2 border rounded-lg bg-slate-50" />
                </div>
                <button type="submit" className="bg-indigo-600 text-white font-bold p-2.5 rounded-lg">Confirmar Operación (Alta/Mod)</button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b">
                  <tr>
                    <th className="p-4">Nº Único</th>
                    <th className="p-4">Inmueble</th>
                    <th className="p-4">Monto</th>
                    <th className="p-4">Fecha Emisión</th>
                    <th className="p-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recibos.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-4 font-mono font-bold">{r.id}</td>
                      <td className="p-4">{r.inmueble}</td>
                      <td className="p-4">${r.monto} USD</td>
                      <td className="p-4">{r.fecha}</td>
                      <td className="p-4"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">{r.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= VISTA: SECRETARIO (MOVIMIENTOS BANCARIOS) ================= */}
        {vistaActiva === 'movimientos' && rolActual === 'Secretario' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <h2 className="text-lg font-bold mb-2">Registrar Movimiento Bancario</h2>
              <p className="text-xs text-slate-400 mb-4">Los movimientos se asociarán a cuentas e inmuebles del sistema administrativo.</p>
              
              <form onSubmit={handleAltaMovimiento} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Tipo de Operación</label>
                  <select value={formMovimiento.tipo} onChange={e => setFormMovimiento({...formMovimiento, tipo: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                    <option>Ingreso</option>
                    <option>Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Monto Económico</label>
                  <input type="number" value={formMovimiento.monto} onChange={e => setFormMovimiento({...formMovimiento, monto: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Descripción corta</label>
                  <input type="text" value={formMovimiento.descripcion} onChange={e => setFormMovimiento({...formMovimiento, descripcion: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" placeholder="Ej: Pago de Tasas" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-grow bg-indigo-600 text-white font-bold p-2.5 rounded-lg">Guardar Movimiento</button>
                  <button type="button" onClick={() => mostrarNotificacion('Cancelación: Operación cancelada, no se guardaron datos.', 'error')} className="bg-slate-100 text-slate-500 px-2 rounded-lg">X</button>
                </div>
              </form>
            </div>

            {/* HISTORIAL FINANCIERO */}
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Historial de Caja Registrado</h3>
              <div className="space-y-2">
                {movimientos.map(m => (
                  <div key={m.id} className="flex justify-between items-center border p-3 rounded-xl text-xs bg-slate-50">
                    <div>
                      <span className={`inline-block w-16 text-center font-bold px-1.5 py-0.5 rounded mr-3 ${m.tipo === 'Ingreso' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{m.tipo}</span>
                      <span className="font-medium text-slate-700">{m.descripcion}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900">${m.monto} USD</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= VISTA: SECRETARIO (INFORMES ECONÓMICOS) ================= */}
        {vistaActiva === 'informes' && rolActual === 'Secretario' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border max-w-xl mx-auto space-y-4 text-sm">
            <h2 className="text-lg font-bold">Consultar e Invocar Informes Económicos</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Período / Criterio de Búsqueda</label>
                <select className="w-full p-2 border rounded-lg bg-white">
                  <option>Mensual Actual</option>
                  <option>Trimestre Pasado</option>
                  <option>Balance Anual Completo</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Tipo de Reporte</label>
                <select className="w-full p-2 border rounded-lg bg-white">
                  <option>Rendimiento por Inmueble</option>
                  <option>Flujo Neto de Caja</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t pt-4">
              <button onClick={() => mostrarNotificacion('Resultados de Consulta: Informe procesado y renderizado exitosamente.')} className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl">Procesar Consulta</button>
              <button onClick={() => { setVistaActiva('inmuebles'); mostrarNotificacion('El usuario canceló la operación. Redirección al menú principal.', 'error'); }} className="bg-slate-100 text-slate-500 text-xs px-4 py-2 rounded-xl">Cancelar Proceso</button>
            </div>
          </div>
        )}

        {/* ================= VISTA: SECRETARIO (GENERAR LISTADOS) ================= */}
        {vistaActiva === 'listados' && rolActual === 'Secretario' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border max-w-2xl mx-auto space-y-4">
            <h2 className="text-lg font-bold">Generar Listados Parametrizados</h2>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button onClick={() => mostrarNotificacion('Listado de Inmuebles generado con filtros aplicados.')} className="p-3 border rounded-xl bg-slate-50 font-bold text-center hover:bg-slate-100">📋 Listado Inmuebles</button>
              <button onClick={() => mostrarNotificacion('Listado de Inquilinos / Clientes procesado.')} className="p-3 border rounded-xl bg-slate-50 font-bold text-center hover:bg-slate-100">📋 Listado Inquilinos</button>
              <button onClick={() => mostrarNotificacion('Listado completo de Recibos y Pagos emitido.')} className="p-3 border rounded-xl bg-slate-50 font-bold text-center hover:bg-slate-100">📋 Listado Recibos</button>
            </div>
            <div className="p-4 bg-slate-100 rounded-xl border text-center text-xs font-mono text-slate-500">
              [ Los listados procesados se optimizan automáticamente para su correcta visualización e impresión en formato limpio ]
            </div>
          </div>
        )}

      </main>

      {/* FOOTER DEL SISTEMA */}
      <footer className="bg-white border-t py-4 text-center text-xs text-slate-400 mt-12">
        &copy; 2026 LA_FINCA Inmobiliaria. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default App