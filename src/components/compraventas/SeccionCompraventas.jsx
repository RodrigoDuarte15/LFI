import { useEffect, useState } from 'react'
import {
  getCompraventas,
  crearCompraventa,
  actualizarCompraventa,
  confirmarCompraventa,
  anularCompraventa,
  eliminarCompraventa,
} from '../../services/compraventaService'
import { getClientes } from '../../services/clienteService'
import { inmuebleDisponible } from '../../services/inmuebleService'

const valoresIniciales = {
  inmueble_id: '',
  comprador_id: '',
  vendedor_id: '',
  fecha: '',
  precio: '',
  solicitud_id: '',
}

const ESTILO_ESTADO = {
  pendiente: 'bg-dorado/20 text-verde-oscuro',
  confirmada: 'bg-verde-oscuro/10 text-verde-oscuro',
  anulada: 'bg-red-50 text-red-700',
}

const FILTROS = [
  ['todas', 'Todas'],
  ['pendiente', 'Pendientes'],
  ['confirmada', 'Confirmadas'],
  ['anulada', 'Anuladas'],
]

const nombreCompleto = (nombre, apellido, dni) => `${nombre} ${apellido} (DNI ${dni})`

// Operaciones de compraventa: UNA operación = UNA transacción (un comprador y un
// vendedor). Se registra como "pendiente" y recién al confirmarla es definitiva:
// el inmueble pasa a "vendido". Todas las reglas las valida el backend.
//
// Props: inmuebles (los mismos que usa Alquileres), prefill (datos de una solicitud
// aceptada), onPrefillUsado y onInmueblesCambiaron (para refrescar la lista del panel).
function SeccionCompraventas({ inmuebles, prefill, onPrefillUsado, onInmueblesCambiaron }) {
  const [compraventas, setCompraventas] = useState([])
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [filtro, setFiltro] = useState('todas')
  const [procesandoId, setProcesandoId] = useState(null)

  const [formulario, setFormulario] = useState(valoresIniciales)
  const [editandoId, setEditandoId] = useState(null)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [enviando, setEnviando] = useState(false)

  const cargarCompraventas = () =>
    getCompraventas()
      .then(setCompraventas)
      .catch(() => setError('No se pudo cargar el historial de operaciones.'))
      .finally(() => setCargando(false))

  useEffect(() => {
    cargarCompraventas()
    getClientes()
      .then(setClientes)
      .catch(() => setError('No se pudieron cargar los clientes.'))
  }, [])

  // Llegada desde "Registrar operación" en Solicitudes: se precarga el formulario,
  // pero NO se registra nada: el secretario revisa y confirma los datos.
  useEffect(() => {
    if (!prefill) return

    const inmueble = inmuebles.find((i) => i.id_inmueble === prefill.inmueble_id)
    setFormulario({
      ...valoresIniciales,
      inmueble_id: String(prefill.inmueble_id),
      comprador_id: String(prefill.cliente_id),
      vendedor_id: inmueble?.propietario_id ? String(inmueble.propietario_id) : '',
      precio: inmueble?.precio ? String(inmueble.precio) : '',
      solicitud_id: String(prefill.id_solicitud),
    })
    setEditandoId(null)
    setErroresFormulario({})
    setMensaje(null)
    onPrefillUsado()
  }, [prefill])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormulario((prev) => {
      const siguiente = { ...prev, [name]: value }

      // Al elegir inmueble se proponen el precio publicado y, si ya tiene propietario,
      // ese propietario como vendedor (el backend exige que el vendedor sea el propietario).
      if (name === 'inmueble_id') {
        const inmueble = inmuebles.find((i) => String(i.id_inmueble) === value)
        if (inmueble && !prev.precio && inmueble.precio) siguiente.precio = String(inmueble.precio)
        if (inmueble?.propietario_id) siguiente.vendedor_id = String(inmueble.propietario_id)
      }

      return siguiente
    })
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!formulario.inmueble_id) nuevosErrores.inmueble_id = 'Seleccioná un inmueble.'
    if (!formulario.comprador_id) nuevosErrores.comprador_id = 'Seleccioná el comprador.'
    if (!formulario.vendedor_id) nuevosErrores.vendedor_id = 'Seleccioná el vendedor.'
    if (
      formulario.comprador_id &&
      formulario.vendedor_id &&
      formulario.comprador_id === formulario.vendedor_id
    ) {
      nuevosErrores.vendedor_id = 'El comprador y el vendedor no pueden ser la misma persona.'
    }
    if (!formulario.fecha) nuevosErrores.fecha = 'Ingresá la fecha de la operación.'
    if (!formulario.precio || Number(formulario.precio) <= 0) {
      nuevosErrores.precio = 'Ingresá un precio válido.'
    }

    setErroresFormulario(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleEditarClick = (operacion) => {
    setEditandoId(operacion.id_compraventa)
    setMensaje(null)
    setFormulario({
      inmueble_id: String(operacion.inmueble_id),
      comprador_id: String(operacion.comprador_id),
      vendedor_id: String(operacion.vendedor_id),
      fecha: operacion.fecha ? operacion.fecha.slice(0, 10) : '',
      precio: String(operacion.precio ?? ''),
      solicitud_id: operacion.solicitud_id ? String(operacion.solicitud_id) : '',
    })
    setErroresFormulario({})
    window.scrollTo({ top: 0 })
  }

  const handleCancelar = () => {
    setEditandoId(null)
    setFormulario(valoresIniciales)
    setErroresFormulario({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return

    const datos = { ...formulario, solicitud_id: formulario.solicitud_id || null }

    setEnviando(true)
    setMensaje(null)
    try {
      if (editandoId) {
        await actualizarCompraventa(editandoId, datos)
        setMensaje('Operación actualizada correctamente.')
      } else {
        await crearCompraventa(datos)
        setMensaje('Operación registrada como pendiente. Confirmala cuando esté todo listo.')
      }
      setFormulario(valoresIniciales)
      setEditandoId(null)
      setErroresFormulario({})
      cargarCompraventas()
    } catch (err) {
      setErroresFormulario({
        general: err.response?.data?.message || 'No se pudo guardar la operación.',
      })
    } finally {
      setEnviando(false)
    }
  }

  // Confirmar, anular y eliminar piden confirmación y muestran el mensaje del backend.
  const ejecutarAccion = async (id, pregunta, accion, mensajeFijo) => {
    if (!window.confirm(pregunta)) return

    setProcesandoId(id)
    setError(null)
    setMensaje(null)
    try {
      const respuesta = await accion(id)
      setMensaje(respuesta?.message || mensajeFijo)
      await cargarCompraventas()
      // Confirmar o anular cambia el estado del inmueble: se refresca la lista del panel.
      onInmueblesCambiaron()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo completar la acción.')
    } finally {
      setProcesandoId(null)
    }
  }

  const handleConfirmar = (id) =>
    ejecutarAccion(
      id,
      '¿Confirmar la operación? Pasa a ser definitiva: el inmueble queda "vendido" y a nombre del comprador.',
      confirmarCompraventa,
      'Operación confirmada.'
    )

  const handleAnular = (id) =>
    ejecutarAccion(id, '¿Anular la operación? Queda en el historial sin efecto.', anularCompraventa, 'Operación anulada.')

  const handleEliminar = (id) =>
    ejecutarAccion(
      id,
      '¿Eliminar la operación pendiente? Esta acción no se puede deshacer.',
      eliminarCompraventa,
      'Operación eliminada.'
    )

  const visibles = filtro === 'todas' ? compraventas : compraventas.filter((c) => c.estado === filtro)

  // Solo inmuebles disponibles; al editar se conserva el actual aunque ya no lo esté.
  const inmueblesElegibles = inmuebles.filter(
    (i) => inmuebleDisponible(i.estado) || String(i.id_inmueble) === formulario.inmueble_id
  )

  const campoSelect = 'mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado'

  return (
    <div className="mt-12">
      <h2 className="font-serif text-2xl text-verde-oscuro">Compraventas</h2>
      <p className="mt-1 text-texto/70">
        Una operación es una única transacción: una persona compra y otra vende. Se registra como
        pendiente y es definitiva recién al confirmarla.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm">
        <h3 className="font-serif text-lg text-verde-oscuro">
          {editandoId ? `Editar operación #${editandoId}` : 'Nueva operación'}
        </h3>

        {erroresFormulario.general && (
          <p role="alert" className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
            {erroresFormulario.general}
          </p>
        )}
        {mensaje && (
          <p role="status" className="rounded-sm bg-verde-oscuro/10 px-3 py-2 text-sm text-verde-oscuro">
            {mensaje}
          </p>
        )}

        {formulario.solicitud_id && (
          <p className="text-sm text-texto/70">
            Originada en la solicitud #{formulario.solicitud_id}.{' '}
            <button
              type="button"
              onClick={() => setFormulario((prev) => ({ ...prev, solicitud_id: '' }))}
              className="text-dorado hover:underline"
            >
              Quitar vínculo
            </button>
          </p>
        )}

        <div>
          <label className="text-sm text-texto/80" htmlFor="cv_inmueble_id">
            Inmueble
          </label>
          <select id="cv_inmueble_id" name="inmueble_id" value={formulario.inmueble_id} onChange={handleChange} className={campoSelect}>
            <option value="">-- Seleccioná un inmueble disponible --</option>
            {inmueblesElegibles.map((inmueble) => (
              <option key={inmueble.id_inmueble} value={inmueble.id_inmueble}>
                {inmueble.titulo} — {inmueble.direccion}
              </option>
            ))}
          </select>
          {erroresFormulario.inmueble_id && <p className="mt-1 text-xs text-red-700">{erroresFormulario.inmueble_id}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-texto/80" htmlFor="cv_comprador_id">
              Comprador
            </label>
            <select id="cv_comprador_id" name="comprador_id" value={formulario.comprador_id} onChange={handleChange} className={campoSelect}>
              <option value="">-- Seleccioná al comprador --</option>
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.apellido}, {cliente.nombre} — DNI {cliente.dni}
                </option>
              ))}
            </select>
            {erroresFormulario.comprador_id && <p className="mt-1 text-xs text-red-700">{erroresFormulario.comprador_id}</p>}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="cv_vendedor_id">
              Vendedor
            </label>
            <select id="cv_vendedor_id" name="vendedor_id" value={formulario.vendedor_id} onChange={handleChange} className={campoSelect}>
              <option value="">-- Seleccioná al vendedor --</option>
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>
                  {cliente.apellido}, {cliente.nombre} — DNI {cliente.dni}
                </option>
              ))}
            </select>
            {erroresFormulario.vendedor_id && <p className="mt-1 text-xs text-red-700">{erroresFormulario.vendedor_id}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-texto/80" htmlFor="cv_fecha">
              Fecha de la operación
            </label>
            <input id="cv_fecha" name="fecha" type="date" value={formulario.fecha} onChange={handleChange} className={campoSelect} />
            {erroresFormulario.fecha && <p className="mt-1 text-xs text-red-700">{erroresFormulario.fecha}</p>}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="cv_precio">
              Precio acordado
            </label>
            <input id="cv_precio" name="precio" type="number" min="0" step="0.01" value={formulario.precio} onChange={handleChange} className={campoSelect} />
            {erroresFormulario.precio && <p className="mt-1 text-xs text-red-700">{erroresFormulario.precio}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-sm bg-verde-oscuro px-6 py-2.5 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
          >
            {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Registrar operación'}
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

      <div className="mt-8 flex items-center gap-3">
        <h3 className="font-serif text-lg text-verde-oscuro">Historial</h3>
        <label className="sr-only" htmlFor="filtro-compraventas">
          Filtrar por estado
        </label>
        <select
          id="filtro-compraventas"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
        >
          {FILTROS.map(([valor, etiqueta]) => (
            <option key={valor} value={valor}>
              {etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {cargando && <p className="text-texto/60">Cargando...</p>}
        {error && <p className="mb-3 text-red-700">{error}</p>}

        {!cargando && (
          <div className="overflow-x-auto rounded-md bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-verde-oscuro/5 text-xs uppercase tracking-wide text-verde-oscuro/70">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Inmueble</th>
                  <th className="px-4 py-3">Comprador</th>
                  <th className="px-4 py-3">Vendedor</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((operacion) => (
                  <tr key={operacion.id_compraventa} className="border-t border-verde-oscuro/10 align-top">
                    <td className="px-4 py-3">{operacion.fecha}</td>
                    <td className="px-4 py-3">{operacion.inmuebleTitulo}</td>
                    <td className="px-4 py-3">
                      {nombreCompleto(operacion.compradorNombre, operacion.compradorApellido, operacion.compradorDni)}
                    </td>
                    <td className="px-4 py-3">
                      {nombreCompleto(operacion.vendedorNombre, operacion.vendedorApellido, operacion.vendedorDni)}
                    </td>
                    <td className="px-4 py-3">${Number(operacion.precio).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${ESTILO_ESTADO[operacion.estado] ?? ''}`}>
                        {operacion.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        {operacion.estado === 'pendiente' && (
                          <>
                            <button
                              type="button"
                              disabled={procesandoId === operacion.id_compraventa}
                              onClick={() => handleConfirmar(operacion.id_compraventa)}
                              className="text-verde-oscuro hover:underline disabled:opacity-50"
                            >
                              Confirmar
                            </button>
                            <button type="button" onClick={() => handleEditarClick(operacion)} className="text-dorado hover:underline">
                              Editar
                            </button>
                            <button
                              type="button"
                              disabled={procesandoId === operacion.id_compraventa}
                              onClick={() => handleEliminar(operacion.id_compraventa)}
                              className="text-red-700 hover:underline disabled:opacity-50"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                        {operacion.estado !== 'anulada' && (
                          <button
                            type="button"
                            disabled={procesandoId === operacion.id_compraventa}
                            onClick={() => handleAnular(operacion.id_compraventa)}
                            className="text-red-700 hover:underline disabled:opacity-50"
                          >
                            Anular
                          </button>
                        )}
                        {operacion.estado === 'anulada' && <span className="text-xs text-texto/60">Sin efecto</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {visibles.length === 0 && (
              <p className="px-4 py-6 text-center text-texto/60">No hay operaciones para mostrar.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SeccionCompraventas
