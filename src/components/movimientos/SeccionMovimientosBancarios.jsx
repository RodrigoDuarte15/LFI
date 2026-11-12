import { useEffect, useState } from 'react'
import {
  getMovimientos,
  crearMovimiento,
  actualizarMovimiento,
  eliminarMovimiento,
} from '../../services/movimientoBancarioService'
import { getRecibos } from '../../services/reciboService'
import { getCuentasBancarias } from '../../services/cuentaBancariaService'
import { getInmuebles } from '../../services/inmuebleService'

const valoresIniciales = {
  fecha: '',
  tipo: 'ingreso',
  descripcion: '',
  monto: '',
  cuenta_id: '',
  inmueble_id: '',
  recibo_id: '',
}

// La BD ya tiene cuenta_id e inmueble_id como NOT NULL en movimiento_bancario
// (antes no existían: ver PENDIENTES PARA AUDITORÍA FINAL DE BD de etapas
// previas, ya resuelto). El backend ahora hace JOIN con cuenta_bancaria e
// inmueble para devolver datos comprensibles, no solo IDs.
function SeccionMovimientosBancarios() {
  const [movimientos, setMovimientos] = useState([])
  const [recibos, setRecibos] = useState([])
  const [cuentas, setCuentas] = useState([])
  const [inmuebles, setInmuebles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [mensajeExito, setMensajeExito] = useState(null)

  const [formulario, setFormulario] = useState(valoresIniciales)
  const [editandoId, setEditandoId] = useState(null)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [enviando, setEnviando] = useState(false)

  const cargarMovimientos = () => {
    setCargando(true)
    getMovimientos()
      .then(setMovimientos)
      .catch(() => setError('No se pudieron cargar los movimientos bancarios.'))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarMovimientos()
    // recibo.controller no devuelve descripción del inmueble/cliente, pero al
    // menos periodo/total ya alcanzan para identificar el recibo sin mostrar
    // un ID crudo.
    getRecibos()
      .then(setRecibos)
      .catch(() => setError('No se pudieron cargar los recibos.'))
    getCuentasBancarias()
      .then(setCuentas)
      .catch(() => setError('No se pudieron cargar las cuentas bancarias.'))
    // Reutiliza el service existente de inmuebles, no se duplica.
    getInmuebles()
      .then(setInmuebles)
      .catch(() => setError('No se pudieron cargar los inmuebles.'))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!formulario.fecha) nuevosErrores.fecha = 'Ingresá la fecha.'
    if (!formulario.tipo) nuevosErrores.tipo = 'Seleccioná el tipo.'
    if (!formulario.monto || Number(formulario.monto) <= 0) {
      nuevosErrores.monto = 'Ingresá un monto válido.'
    }

    // cuenta_id e inmueble_id solo se piden al crear: el backend no permite
    // modificarlos desde el PUT (mismo criterio que ya usamos en Alquileres).
    if (!editandoId) {
      if (!formulario.cuenta_id) nuevosErrores.cuenta_id = 'Seleccioná una cuenta bancaria.'
      if (!formulario.inmueble_id) nuevosErrores.inmueble_id = 'Seleccioná un inmueble.'
    }

    setErroresFormulario(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // GET /api/movimientos ya trae fecha, tipo, descripcion, monto, cuenta_id
  // e inmueble_id: todo lo que hace falta para mostrar el formulario de
  // edición. No hace falta pedir el detalle por separado.
  const handleEditarClick = (movimiento) => {
    setEditandoId(movimiento.id_movimiento)
    setMensajeExito(null)
    setFormulario({
      fecha: movimiento.fecha ? movimiento.fecha.slice(0, 10) : '',
      tipo: movimiento.tipo || 'ingreso',
      descripcion: movimiento.descripcion || '',
      monto: movimiento.monto ?? '',
      cuenta_id: movimiento.cuenta_id ?? '',
      inmueble_id: movimiento.inmueble_id ?? '',
      recibo_id: movimiento.recibo_id ?? '',
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
    setMensajeExito(null)
    try {
      if (editandoId) {
        // El backend solo acepta estos 4 campos en el PUT; cuenta_id,
        // inmueble_id y recibo_id quedan fijos desde la creación.
        await actualizarMovimiento(editandoId, {
          fecha: formulario.fecha,
          tipo: formulario.tipo,
          descripcion: formulario.descripcion,
          monto: formulario.monto,
        })
        setMensajeExito('Movimiento actualizado correctamente.')
      } else {
        await crearMovimiento({
          fecha: formulario.fecha,
          tipo: formulario.tipo,
          descripcion: formulario.descripcion,
          monto: formulario.monto,
          cuenta_id: formulario.cuenta_id,
          inmueble_id: formulario.inmueble_id,
          recibo_id: formulario.recibo_id || null,
        })
        setMensajeExito('Movimiento creado correctamente.')
      }
      setFormulario(valoresIniciales)
      setEditandoId(null)
      setErroresFormulario({})
      cargarMovimientos()
    } catch (err) {
      setErroresFormulario({
        general: err.response?.data?.message || 'No se pudo guardar el movimiento.',
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar este movimiento?')
    if (!confirmar) return

    try {
      await eliminarMovimiento(id)
      setMensajeExito('Movimiento eliminado correctamente.')
      cargarMovimientos()
    } catch {
      setError('No se pudo eliminar el movimiento.')
    }
  }

  const getDescripcionRecibo = (reciboId) => {
    if (!reciboId) return '— (sin recibo asociado)'
    const recibo = recibos.find((r) => r.id_recibo === reciboId)
    return recibo
      ? `Recibo ${recibo.periodo} ($${Number(recibo.total).toLocaleString('es-AR')})`
      : `Recibo #${reciboId}`
  }

  return (
    <div className="mt-12">
      <h2 className="font-serif text-2xl text-verde-oscuro">Movimientos Bancarios</h2>
      <p className="mt-1 text-texto/70">
        Registro de ingresos y egresos, vinculados a una cuenta y un inmueble.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm"
      >
        <h3 className="font-serif text-lg text-verde-oscuro">
          {editandoId ? `Editar movimiento #${editandoId}` : 'Nuevo movimiento'}
        </h3>

        {erroresFormulario.general && (
          <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
            {erroresFormulario.general}
          </p>
        )}
        {mensajeExito && (
          <p className="rounded-sm bg-verde-oscuro/10 px-3 py-2 text-sm text-verde-oscuro">
            {mensajeExito}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-texto/80" htmlFor="cuenta_id">
              Cuenta bancaria
            </label>
            <select
              id="cuenta_id"
              name="cuenta_id"
              value={formulario.cuenta_id}
              onChange={handleChange}
              disabled={Boolean(editandoId)}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado disabled:bg-verde-oscuro/5 disabled:text-texto/50"
            >
              <option value="">-- Seleccioná una cuenta --</option>
              {cuentas.map((cuenta) => (
                <option key={cuenta.id_cuenta} value={cuenta.id_cuenta}>
                  {cuenta.banco} — {cuenta.numero_cuenta}
                </option>
              ))}
            </select>
            {erroresFormulario.cuenta_id && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.cuenta_id}</p>
            )}
            {editandoId && (
              <p className="mt-1 text-xs text-texto/50">
                La cuenta no se puede cambiar una vez creado el movimiento.
              </p>
            )}
          </div>

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
              {inmuebles.map((inmueble) => (
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
                El inmueble no se puede cambiar una vez creado el movimiento.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm text-texto/80" htmlFor="fecha">
              Fecha
            </label>
            <input
              id="fecha"
              name="fecha"
              type="date"
              value={formulario.fecha}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {erroresFormulario.fecha && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.fecha}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="tipo">
              Tipo
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formulario.tipo}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            >
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
            {erroresFormulario.tipo && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.tipo}</p>
            )}
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
        </div>

        <div>
          <label className="text-sm text-texto/80" htmlFor="descripcion">
            Descripción <span className="text-texto/40">(opcional)</span>
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            rows={2}
            value={formulario.descripcion}
            onChange={handleChange}
            className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
          />
        </div>

        {editandoId ? (
          <p className="text-xs text-texto/50">
            Recibo asociado: {getDescripcionRecibo(formulario.recibo_id || null)} (no se puede
            cambiar desde la edición).
          </p>
        ) : (
          <div>
            <label className="text-sm text-texto/80" htmlFor="recibo_id">
              Recibo asociado <span className="text-texto/40">(opcional)</span>
            </label>
            <select
              id="recibo_id"
              name="recibo_id"
              value={formulario.recibo_id}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            >
              <option value="">-- Sin recibo asociado --</option>
              {recibos.map((recibo) => (
                <option key={recibo.id_recibo} value={recibo.id_recibo}>
                  Recibo {recibo.periodo} — ${Number(recibo.total).toLocaleString('es-AR')}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-sm bg-verde-oscuro px-6 py-2.5 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
          >
            {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Registrar movimiento'}
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
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Cuenta</th>
                  <th className="px-4 py-3">Inmueble</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Recibo asociado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id_movimiento} className="border-t border-verde-oscuro/10">
                    <td className="px-4 py-3">
                      {movimiento.fecha ? movimiento.fecha.slice(0, 10) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs capitalize ${
                          movimiento.tipo === 'egreso'
                            ? 'bg-red-50 text-red-700'
                            : 'bg-verde-oscuro/10 text-verde-oscuro'
                        }`}
                      >
                        {movimiento.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {movimiento.cuentaBanco} — {movimiento.cuentaNumero}
                    </td>
                    <td className="px-4 py-3">{movimiento.inmuebleTitulo}</td>
                    <td className="px-4 py-3">{movimiento.descripcion || '—'}</td>
                    <td className="px-4 py-3">
                      {movimiento.monto
                        ? `$${Number(movimiento.monto).toLocaleString('es-AR')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{getDescripcionRecibo(movimiento.recibo_id)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditarClick(movimiento)}
                          className="text-dorado hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(movimiento.id_movimiento)}
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

            {movimientos.length === 0 && (
              <p className="px-4 py-6 text-center text-texto/60">
                Todavía no hay movimientos cargados.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SeccionMovimientosBancarios
