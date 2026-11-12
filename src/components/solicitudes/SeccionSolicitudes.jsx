import { useEffect, useState } from 'react'
import { getSolicitudes, actualizarEstadoSolicitud } from '../../services/solicitudService'

const ETIQUETA_TIPO = { alquiler: 'Alquiler', compra: 'Compra' }

const ESTILO_ESTADO = {
  pendiente: 'bg-dorado/20 text-verde-oscuro',
  aceptada: 'bg-verde-oscuro/10 text-verde-oscuro',
  rechazada: 'bg-red-50 text-red-700',
}

const FILTROS = [
  ['todas', 'Todas'],
  ['pendiente', 'Pendientes'],
  ['aceptada', 'Aceptadas'],
  ['rechazada', 'Rechazadas'],
]

// Solicitudes de interés que los clientes envían desde el catálogo. Aceptar una
// solicitud NO crea ninguna operación: para una compra, "Registrar operación" lleva
// los datos al formulario de Compraventas y el secretario decide y confirma allá.
function SeccionSolicitudes({ onRegistrarOperacion }) {
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [filtro, setFiltro] = useState('todas')
  const [procesandoId, setProcesandoId] = useState(null)

  const cargarSolicitudes = () =>
    getSolicitudes()
      .then(setSolicitudes)
      .catch(() => setError('No se pudieron cargar las solicitudes.'))
      .finally(() => setCargando(false))

  useEffect(() => {
    cargarSolicitudes()
  }, [])

  const cambiarEstado = async (id, estado) => {
    setProcesandoId(id)
    setError(null)
    try {
      await actualizarEstadoSolicitud(id, estado)
      await cargarSolicitudes()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar la solicitud.')
    } finally {
      setProcesandoId(null)
    }
  }

  const visibles = filtro === 'todas' ? solicitudes : solicitudes.filter((s) => s.estado === filtro)

  return (
    <div className="mt-12">
      <h2 className="font-serif text-2xl text-verde-oscuro">Solicitudes</h2>
      <p className="mt-1 text-texto/70">
        Consultas de los clientes por alquiler o compra. Aceptar una solicitud no registra ninguna
        operación por sí sola.
      </p>

      <div className="mt-6 flex items-center gap-3">
        <label className="text-sm text-texto/80" htmlFor="filtro-solicitudes">
          Mostrar
        </label>
        <select
          id="filtro-solicitudes"
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
                  <th className="px-4 py-3">Interesado</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Consulta por</th>
                  <th className="px-4 py-3">Mensaje</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((solicitud) => (
                  <tr key={solicitud.id_solicitud} className="border-t border-verde-oscuro/10 align-top">
                    <td className="px-4 py-3">{solicitud.fecha_solicitud}</td>
                    <td className="px-4 py-3">{solicitud.inmuebleTitulo}</td>
                    <td className="px-4 py-3">
                      {solicitud.clienteNombre} {solicitud.clienteApellido}
                      <span className="block text-xs text-texto/60">DNI {solicitud.clienteDni}</span>
                    </td>
                    <td className="px-4 py-3">
                      {solicitud.clienteEmail}
                      {solicitud.clienteTelefono && (
                        <span className="block text-xs text-texto/60">{solicitud.clienteTelefono}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{ETIQUETA_TIPO[solicitud.tipo] ?? solicitud.tipo}</td>
                    <td className="max-w-xs px-4 py-3">{solicitud.mensaje || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs capitalize ${ESTILO_ESTADO[solicitud.estado] ?? ''}`}
                      >
                        {solicitud.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-1">
                        {solicitud.estado !== 'aceptada' && (
                          <button
                            type="button"
                            disabled={procesandoId === solicitud.id_solicitud}
                            onClick={() => cambiarEstado(solicitud.id_solicitud, 'aceptada')}
                            className="text-verde-oscuro hover:underline disabled:opacity-50"
                          >
                            Aceptar
                          </button>
                        )}
                        {solicitud.estado !== 'rechazada' && (
                          <button
                            type="button"
                            disabled={procesandoId === solicitud.id_solicitud}
                            onClick={() => cambiarEstado(solicitud.id_solicitud, 'rechazada')}
                            className="text-red-700 hover:underline disabled:opacity-50"
                          >
                            Rechazar
                          </button>
                        )}
                        {solicitud.estado !== 'pendiente' && (
                          <button
                            type="button"
                            disabled={procesandoId === solicitud.id_solicitud}
                            onClick={() => cambiarEstado(solicitud.id_solicitud, 'pendiente')}
                            className="text-texto/70 hover:underline disabled:opacity-50"
                          >
                            Volver a pendiente
                          </button>
                        )}
                        {solicitud.estado === 'aceptada' && solicitud.tipo === 'compra' && (
                          <button
                            type="button"
                            onClick={() => onRegistrarOperacion(solicitud)}
                            className="text-dorado hover:underline"
                          >
                            Registrar operación
                          </button>
                        )}
                        {solicitud.estado === 'aceptada' && solicitud.tipo === 'alquiler' && (
                          <span className="text-xs text-texto/60">Se formaliza en la sección Alquileres.</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {visibles.length === 0 && (
              <p className="px-4 py-6 text-center text-texto/60">No hay solicitudes para mostrar.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SeccionSolicitudes
