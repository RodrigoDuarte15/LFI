import { useEffect, useState } from 'react'
import {
  getAlquileres,
  crearAlquiler,
  actualizarAlquiler,
  eliminarAlquiler,
} from '../../services/alquilerService'
import { getClientes } from '../../services/clienteService'

const valoresIniciales = {
  fecha_inicio: '',
  fecha_fin: '',
  monto: '',
  estado: 'activo',
  cliente_id: '',
  inmueble_id: '',
}

// Recibe la lista de inmuebles como prop porque PanelSecretario ya la tiene
// cargada (GET /api/inmuebles): evita pedirla de nuevo acá.
function SeccionAlquileres({ inmuebles }) {
  const [alquileres, setAlquileres] = useState([])
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [formulario, setFormulario] = useState(valoresIniciales)
  const [editandoId, setEditandoId] = useState(null)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [enviando, setEnviando] = useState(false)

  const cargarAlquileres = () => {
    setCargando(true)
    getAlquileres()
      .then(setAlquileres)
      .catch(() => setError('No se pudieron cargar los alquileres.'))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarAlquileres()
    // El endpoint de alquileres no devuelve nombre/apellido del cliente
    // (no hace JOIN con cliente/usuario), así que traemos los clientes
    // acá para poder mostrar "Nombre Apellido" en vez del cliente_id.
    getClientes()
      .then(setClientes)
      .catch(() => setError('No se pudieron cargar los clientes.'))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!formulario.fecha_inicio) {
      nuevosErrores.fecha_inicio = 'Ingresá la fecha de inicio.'
    }
    if (!formulario.monto || Number(formulario.monto) <= 0) {
      nuevosErrores.monto = 'Ingresá un monto válido.'
    }

    // cliente_id e inmueble_id solo se piden al crear: el backend no
    // permite modificarlos desde el PUT, así que en edición no se validan.
    if (!editandoId) {
      if (!formulario.cliente_id) nuevosErrores.cliente_id = 'Seleccioná un cliente.'
      if (!formulario.inmueble_id) nuevosErrores.inmueble_id = 'Seleccioná un inmueble.'
    }

    setErroresFormulario(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // El listado (GET /api/alquileres) ya trae fecha_inicio, fecha_fin, monto
  // y estado, que es todo lo que el formulario de edición necesita. No hace
  // falta pedir el detalle con GET /api/alquileres/:id.
  const handleEditarClick = (alquiler) => {
    setEditandoId(alquiler.id_alquiler)
    setFormulario({
      fecha_inicio: alquiler.fecha_inicio ? alquiler.fecha_inicio.slice(0, 10) : '',
      fecha_fin: alquiler.fecha_fin ? alquiler.fecha_fin.slice(0, 10) : '',
      monto: alquiler.monto ?? '',
      estado: alquiler.estado || 'activo',
      cliente_id: alquiler.cliente_id,
      inmueble_id: alquiler.inmueble_id,
    })
    setErroresFormulario({})
  }

  const handleCancelar = () => {
    setEditandoId(null)
    setFormulario(valoresIniciales)
    setErroresFormulario({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return

    setEnviando(true)
    try {
      if (editandoId) {
        // El backend ignora cliente_id/inmueble_id en el PUT, pero no hace
        // falta ni mandarlos: solo actualiza fecha_inicio, fecha_fin, monto y estado.
        await actualizarAlquiler(editandoId, {
          fecha_inicio: formulario.fecha_inicio,
          fecha_fin: formulario.fecha_fin,
          monto: formulario.monto,
          estado: formulario.estado,
        })
      } else {
        await crearAlquiler(formulario)
      }
      setFormulario(valoresIniciales)
      setEditandoId(null)
      setErroresFormulario({})
      cargarAlquileres()
    } catch (err) {
      setErroresFormulario({
        general: err.response?.data?.message || 'No se pudo guardar el alquiler.',
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar este alquiler?')
    if (!confirmar) return

    try {
      await eliminarAlquiler(id)
      cargarAlquileres()
    } catch {
      setError('No se pudo eliminar el alquiler.')
    }
  }

  const getNombreCliente = (clienteId) => {
    const cliente = clientes.find((c) => c.id_cliente === clienteId)
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : `Cliente #${clienteId}`
  }

  return (
    <div className="mt-12">
      <h2 className="font-serif text-2xl text-verde-oscuro">Alquileres</h2>
      <p className="mt-1 text-texto/70">Gestión de alquileres sobre los inmuebles cargados.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm"
      >
        <h3 className="font-serif text-lg text-verde-oscuro">
          {editandoId ? `Editar alquiler #${editandoId}` : 'Nuevo alquiler'}
        </h3>

        {erroresFormulario.general && (
          <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
            {erroresFormulario.general}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-texto/80" htmlFor="inmueble_id">
              Inmueble
            </label>
            <select
              id="inmueble_id"
              name="inmueble_id"
              value={formulario.inmueble_id}
              onChange={handleChange}
              disabled={Boolean(editandoId)}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado disabled:bg-verde-oscuro/5 disabled:text-texto/50"
            >
              <option value="">-- Seleccioná un inmueble --</option>
              {inmuebles
                .filter(
                  (inmueble) =>
                    inmueble.estado !== 'vendido' ||
                    String(inmueble.id_inmueble) === String(formulario.inmueble_id)
                )
                .map((inmueble) => (
                  <option key={inmueble.id_inmueble} value={inmueble.id_inmueble}>
                    {inmueble.titulo} — {inmueble.direccion}
                  </option>
                ))}
            </select>
            {erroresFormulario.inmueble_id && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.inmueble_id}</p>
            )}
            {editandoId && (
              <p className="mt-1 text-xs text-texto/50">
                El inmueble no se puede cambiar una vez creado el alquiler.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="cliente_id">
              Cliente
            </label>
            <select
              id="cliente_id"
              name="cliente_id"
              value={formulario.cliente_id}
              onChange={handleChange}
              disabled={Boolean(editandoId)}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado disabled:bg-verde-oscuro/5 disabled:text-texto/50"
            >
              <option value="">-- Seleccioná un cliente --</option>
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.nombre} {cliente.apellido}
                </option>
              ))}
            </select>
            {erroresFormulario.cliente_id && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.cliente_id}</p>
            )}
            {editandoId && (
              <p className="mt-1 text-xs text-texto/50">
                El cliente no se puede cambiar una vez creado el alquiler.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="text-sm text-texto/80" htmlFor="fecha_inicio">
              Fecha de inicio
            </label>
            <input
              id="fecha_inicio"
              name="fecha_inicio"
              type="date"
              value={formulario.fecha_inicio}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {erroresFormulario.fecha_inicio && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.fecha_inicio}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="fecha_fin">
              Fecha de fin <span className="text-texto/40">(opcional)</span>
            </label>
            <input
              id="fecha_fin"
              name="fecha_fin"
              type="date"
              value={formulario.fecha_fin}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="monto">
              Monto
            </label>
            <input
              id="monto"
              name="monto"
              type="number"
              min="0"
              step="0.01"
              value={formulario.monto}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {erroresFormulario.monto && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.monto}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="estado">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              value={formulario.estado}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            >
              <option value="activo">Activo</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-sm bg-verde-oscuro px-6 py-2.5 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
          >
            {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear alquiler'}
          </button>

          {editandoId && (
            <button
              type="button"
              onClick={handleCancelar}
              className="rounded-sm border border-verde-oscuro/30 px-6 py-2.5 text-sm text-verde-oscuro transition hover:bg-verde-oscuro/5"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mt-8">
        {cargando && <p className="text-texto/60">Cargando...</p>}
        {error && <p className="text-red-700">{error}</p>}

        {!cargando && !error && (
          <div className="overflow-x-auto rounded-md bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-verde-oscuro/5 text-xs uppercase tracking-wide text-verde-oscuro/70">
                <tr>
                  <th className="px-4 py-3">Inmueble</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Inicio</th>
                  <th className="px-4 py-3">Fin</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {alquileres.map((alquiler) => (
                  <tr key={alquiler.id_alquiler} className="border-t border-verde-oscuro/10">
                    <td className="px-4 py-3">
                      {alquiler.inmuebleTitulo}
                      <span className="block text-xs text-texto/50">
                        {alquiler.inmuebleDireccion}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getNombreCliente(alquiler.cliente_id)}</td>
                    <td className="px-4 py-3">
                      {alquiler.fecha_inicio ? alquiler.fecha_inicio.slice(0, 10) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {alquiler.fecha_fin ? alquiler.fecha_fin.slice(0, 10) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {alquiler.monto
                        ? `$${Number(alquiler.monto).toLocaleString('es-AR')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-verde-oscuro/10 px-2 py-0.5 text-xs capitalize text-verde-oscuro">
                        {alquiler.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditarClick(alquiler)}
                          className="text-dorado hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(alquiler.id_alquiler)}
                          className="text-red-700 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {alquileres.length === 0 && (
              <p className="px-4 py-6 text-center text-texto/60">
                Todavía no hay alquileres cargados.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SeccionAlquileres
