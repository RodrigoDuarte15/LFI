import { useEffect, useState } from 'react'
import {
  getRecibos,
  crearRecibo,
  actualizarRecibo,
  eliminarRecibo,
} from '../../services/reciboService'
import { getAlquileres } from '../../services/alquilerService'
import { getClientes } from '../../services/clienteService'

const valoresIniciales = {
  alquiler_id: '',
  periodo: '',
  fecha_emision: '',
  monto_base: '',
  luz: '',
  agua: '',
  expensas: '',
  tasas: '',
  iva: '',
  estado: 'pendiente',
  total: '', // solo se usa en modo edición: el backend solo permite cambiar esto y estado
}

// No recibe alquileres/clientes por props: los pide con los servicios ya
// existentes (alquilerService, clienteService). SeccionAlquileres mantiene
// su propio estado interno de esas mismas listas, así que esto implica una
// segunda consulta, pero evita tocar ese componente para compartir estado.
function SeccionRecibos() {
  const [recibos, setRecibos] = useState([])
  const [alquileres, setAlquileres] = useState([])
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [formulario, setFormulario] = useState(valoresIniciales)
  const [editandoId, setEditandoId] = useState(null)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [enviando, setEnviando] = useState(false)

  const cargarRecibos = () => {
    setCargando(true)
    getRecibos()
      .then(setRecibos)
      .catch(() => setError('No se pudieron cargar los recibos.'))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarRecibos()
    // alquilerService ya hace JOIN con inmueble (inmuebleTitulo/inmuebleDireccion);
    // clienteService trae nombre/apellido. recibo.controller no devuelve
    // ninguno de los dos, así que los necesitamos para mostrar datos
    // comprensibles en vez de alquiler_id / cliente_id.
    getAlquileres()
      .then(setAlquileres)
      .catch(() => setError('No se pudieron cargar los alquileres.'))
    getClientes()
      .then(setClientes)
      .catch(() => setError('No se pudieron cargar los clientes.'))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
  }

  // Suma en el frontend, solo para completar el "total" que el backend exige
  // en el alta. No es un campo que devuelva el backend, es aritmética simple
  // sobre lo que el secretario ya cargó.
  const totalCalculado =
    (Number(formulario.monto_base) || 0) +
    (Number(formulario.luz) || 0) +
    (Number(formulario.agua) || 0) +
    (Number(formulario.expensas) || 0) +
    (Number(formulario.tasas) || 0) +
    (Number(formulario.iva) || 0)

  const validar = () => {
    const nuevosErrores = {}

    if (editandoId) {
      if (!formulario.estado) nuevosErrores.estado = 'Seleccioná un estado.'
      if (formulario.total === '' || Number(formulario.total) < 0) {
        nuevosErrores.total = 'Ingresá un total válido.'
      }
    } else {
      if (!formulario.alquiler_id) nuevosErrores.alquiler_id = 'Seleccioná un alquiler.'
      if (!formulario.periodo.trim()) nuevosErrores.periodo = 'Ingresá el período (ej: Octubre 2026).'
      if (!formulario.fecha_emision) nuevosErrores.fecha_emision = 'Ingresá la fecha de emisión.'
      if (!formulario.monto_base || Number(formulario.monto_base) <= 0) {
        nuevosErrores.monto_base = 'Ingresá un monto base válido.'
      }
    }

    setErroresFormulario(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // GET /api/recibos ya trae estado y total, que es todo lo que la edición
  // necesita (el PUT no permite tocar nada más). No hace falta GET /:id.
  const handleEditarClick = (recibo) => {
    setEditandoId(recibo.id_recibo)
    setFormulario((prev) => ({
      ...prev,
      estado: recibo.estado || 'pendiente',
      total: recibo.total ?? '',
    }))
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
        // El backend solo acepta estos dos campos en el PUT.
        await actualizarRecibo(editandoId, {
          estado: formulario.estado,
          total: formulario.total,
        })
      } else {
        const alquilerSeleccionado = alquileres.find(
          (a) => a.id_alquiler === Number(formulario.alquiler_id)
        )

        await crearRecibo({
          fecha_emision: formulario.fecha_emision,
          periodo: formulario.periodo,
          monto_base: formulario.monto_base,
          luz: formulario.luz,
          agua: formulario.agua,
          expensas: formulario.expensas,
          tasas: formulario.tasas,
          iva: formulario.iva,
          total: totalCalculado,
          estado: formulario.estado,
          alquiler_id: formulario.alquiler_id,
          cliente_id: alquilerSeleccionado?.cliente_id,
        })
      }
      setFormulario(valoresIniciales)
      setEditandoId(null)
      setErroresFormulario({})
      cargarRecibos()
    } catch (err) {
      setErroresFormulario({
        general: err.response?.data?.message || 'No se pudo guardar el recibo.',
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar este recibo?')
    if (!confirmar) return

    try {
      await eliminarRecibo(id)
      cargarRecibos()
    } catch {
      setError('No se pudo eliminar el recibo.')
    }
  }

  const getInmuebleDeAlquiler = (alquilerId) => {
    const alquiler = alquileres.find((a) => a.id_alquiler === alquilerId)
    return alquiler ? alquiler.inmuebleTitulo : `Alquiler #${alquilerId}`
  }

  const getNombreCliente = (clienteId) => {
    const cliente = clientes.find((c) => c.id_cliente === clienteId)
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : `Cliente #${clienteId}`
  }

  return (
    <div className="mt-12">
      <h2 className="font-serif text-2xl text-verde-oscuro">Recibos</h2>
      <p className="mt-1 text-texto/70">Emisión y control de recibos sobre los alquileres cargados.</p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm"
      >
        <h3 className="font-serif text-lg text-verde-oscuro">
          {editandoId ? `Editar recibo #${editandoId}` : 'Nuevo recibo'}
        </h3>

        {erroresFormulario.general && (
          <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
            {erroresFormulario.general}
          </p>
        )}

        {editandoId ? (
          // Modo edición: el backend solo permite cambiar estado y total.
          <div className="grid gap-4 sm:grid-cols-2">
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
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="vencido">Vencido</option>
              </select>
              {erroresFormulario.estado && (
                <p className="mt-1 text-xs text-red-700">{erroresFormulario.estado}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-texto/80" htmlFor="total">
                Total
              </label>
              <input
                id="total"
                name="total"
                type="number"
                min="0"
                step="0.01"
                value={formulario.total}
                onChange={handleChange}
                className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
              />
              {erroresFormulario.total && (
                <p className="mt-1 text-xs text-red-700">{erroresFormulario.total}</p>
              )}
            </div>
          </div>
        ) : (
          // Modo alta: cliente_id no se pide, se deriva del alquiler elegido.
          <>
            <div>
              <label className="text-sm text-texto/80" htmlFor="alquiler_id">
                Alquiler
              </label>
              <select
                id="alquiler_id"
                name="alquiler_id"
                value={formulario.alquiler_id}
                onChange={handleChange}
                className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
              >
                <option value="">-- Seleccioná un alquiler --</option>
                {alquileres.map((alquiler) => (
                  <option key={alquiler.id_alquiler} value={alquiler.id_alquiler}>
                    {alquiler.inmuebleTitulo} — {getNombreCliente(alquiler.cliente_id)} —{' '}
                    {alquiler.fecha_inicio ? alquiler.fecha_inicio.slice(0, 10) : 'sin fecha'}
                  </option>
                ))}
              </select>
              {erroresFormulario.alquiler_id && (
                <p className="mt-1 text-xs text-red-700">{erroresFormulario.alquiler_id}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm text-texto/80" htmlFor="periodo">
                  Período
                </label>
                <input
                  id="periodo"
                  name="periodo"
                  type="text"
                  placeholder="Ej: Octubre 2026"
                  value={formulario.periodo}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
                {erroresFormulario.periodo && (
                  <p className="mt-1 text-xs text-red-700">{erroresFormulario.periodo}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-texto/80" htmlFor="fecha_emision">
                  Fecha de emisión
                </label>
                <input
                  id="fecha_emision"
                  name="fecha_emision"
                  type="date"
                  value={formulario.fecha_emision}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
                {erroresFormulario.fecha_emision && (
                  <p className="mt-1 text-xs text-red-700">{erroresFormulario.fecha_emision}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-texto/80" htmlFor="monto_base">
                  Monto base
                </label>
                <input
                  id="monto_base"
                  name="monto_base"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.monto_base}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
                {erroresFormulario.monto_base && (
                  <p className="mt-1 text-xs text-red-700">{erroresFormulario.monto_base}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-5">
              <div>
                <label className="text-sm text-texto/80" htmlFor="luz">
                  Luz
                </label>
                <input
                  id="luz"
                  name="luz"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.luz}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>
              <div>
                <label className="text-sm text-texto/80" htmlFor="agua">
                  Agua
                </label>
                <input
                  id="agua"
                  name="agua"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.agua}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>
              <div>
                <label className="text-sm text-texto/80" htmlFor="expensas">
                  Expensas
                </label>
                <input
                  id="expensas"
                  name="expensas"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.expensas}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>
              <div>
                <label className="text-sm text-texto/80" htmlFor="tasas">
                  Tasas
                </label>
                <input
                  id="tasas"
                  name="tasas"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.tasas}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>
              <div>
                <label className="text-sm text-texto/80" htmlFor="iva">
                  IVA
                </label>
                <input
                  id="iva"
                  name="iva"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.iva}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>
            </div>

            <div className="rounded-sm bg-verde-oscuro/5 px-4 py-3">
              <p className="text-sm text-texto/70">Total a emitir (calculado)</p>
              <p className="font-serif text-xl text-verde-oscuro">
                ${totalCalculado.toLocaleString('es-AR')}
              </p>
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
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="vencido">Vencido</option>
              </select>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-sm bg-verde-oscuro px-6 py-2.5 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
          >
            {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Emitir recibo'}
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
                  <th className="px-4 py-3">Período</th>
                  <th className="px-4 py-3">Emisión</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recibos.map((recibo) => (
                  <tr key={recibo.id_recibo} className="border-t border-verde-oscuro/10">
                    <td className="px-4 py-3">{getInmuebleDeAlquiler(recibo.alquiler_id)}</td>
                    <td className="px-4 py-3">{getNombreCliente(recibo.cliente_id)}</td>
                    <td className="px-4 py-3">{recibo.periodo}</td>
                    <td className="px-4 py-3">
                      {recibo.fecha_emision ? recibo.fecha_emision.slice(0, 10) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {recibo.total ? `$${Number(recibo.total).toLocaleString('es-AR')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-verde-oscuro/10 px-2 py-0.5 text-xs capitalize text-verde-oscuro">
                        {recibo.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditarClick(recibo)}
                          className="text-dorado hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(recibo.id_recibo)}
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

            {recibos.length === 0 && (
              <p className="px-4 py-6 text-center text-texto/60">
                Todavía no hay recibos cargados.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SeccionRecibos
