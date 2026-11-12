import { useEffect, useState } from 'react'
import {
  getInmuebles,
  getInmuebleById,
  crearInmueble,
  actualizarInmueble,
  eliminarInmueble,
  getUrlFoto,
} from '../../services/inmuebleService'
import SeccionSolicitudes from '../../components/solicitudes/SeccionSolicitudes'
import SeccionCompraventas from '../../components/compraventas/SeccionCompraventas'
import SeccionAlquileres from '../../components/alquileres/SeccionAlquileres'
import SeccionRecibos from '../../components/recibos/SeccionRecibos'
import SeccionCuentasBancarias from '../../components/cuentas/SeccionCuentasBancarias'
import SeccionMovimientosBancarios from '../../components/movimientos/SeccionMovimientosBancarios'
import PanelLayout from '../../components/panel/PanelLayout'
import InicioPanel from '../../components/panel/InicioPanel'

const valoresIniciales = {
  titulo: '',
  tipo: '',
  direccion: '',
  localidad: '',
  provincia: '',
  estado: 'disponible',
  precio: '',
  descripcion: '',
  superficie: '',
  ambientes: '',
  dormitorios: '',
  banios: '',
  // No hay input para estos dos: se preservan silenciosamente al editar
  // (ver handleEditarClick) para que el PUT, que reemplaza todas las
  // columnas, no los pise con null.
  propietario_id: null,
  secretario_id: null,
}

// Secciones del menú. "Clientes" no figura: hoy no existe una interfaz de gestión de
// clientes (clienteService solo se usa para llenar selectores en otras secciones).
const SECCIONES = [
  { id: 'inicio', etiqueta: 'Inicio' },
  {
    id: 'inmuebles',
    etiqueta: 'Inmuebles',
    descripcion: 'Alta, edición y baja de propiedades, con su foto.',
  },
  {
    id: 'solicitudes',
    etiqueta: 'Solicitudes',
    descripcion: 'Consultas de los clientes por alquiler o compra, con su estado.',
  },
  {
    id: 'compraventas',
    etiqueta: 'Compraventas',
    descripcion: 'Operaciones de compra y venta de inmuebles, con su historial.',
  },
  {
    id: 'alquileres',
    etiqueta: 'Alquileres',
    descripcion: 'Alquileres vinculados a un inmueble y a un cliente.',
  },
  {
    id: 'recibos',
    etiqueta: 'Recibos',
    descripcion: 'Emisión de recibos sobre los alquileres y control de su estado.',
  },
  {
    id: 'cuentas',
    etiqueta: 'Cuentas bancarias',
    descripcion: 'Cuentas disponibles para asociar a los movimientos.',
  },
  {
    id: 'movimientos',
    etiqueta: 'Movimientos bancarios',
    descripcion: 'Ingresos y egresos asociados a una cuenta y a un inmueble.',
  },
]

function PanelSecretario() {
  const [inmuebles, setInmuebles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [formulario, setFormulario] = useState(valoresIniciales)
  const [editandoId, setEditandoId] = useState(null)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [archivoFoto, setArchivoFoto] = useState(null)
  const [fotoActual, setFotoActual] = useState(null)
  const [seccionActiva, setSeccionActiva] = useState('inicio')
  // Solicitud aceptada que se lleva al formulario de Compraventas (solo precarga datos).
  const [prefillCompraventa, setPrefillCompraventa] = useState(null)

  const cargarInmuebles = () => {
    setCargando(true)
    getInmuebles()
      .then(setInmuebles)
      .catch(() => setError('No se pudieron cargar los inmuebles.'))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarInmuebles()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!formulario.titulo.trim()) nuevosErrores.titulo = 'Ingresá un título.'
    if (!formulario.tipo.trim()) nuevosErrores.tipo = 'Seleccioná un tipo.'
    if (!formulario.direccion.trim()) nuevosErrores.direccion = 'Ingresá una dirección.'
    if (!formulario.precio || Number(formulario.precio) <= 0) {
      nuevosErrores.precio = 'Ingresá un precio válido.'
    }

    setErroresFormulario(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // Trae el detalle completo (no la fila del listado, que no incluye
  // descripcion) para no perder datos al guardar la edición.
  const handleEditarClick = async (id) => {
    setError(null)
    try {
      const inmueble = await getInmuebleById(id)
      setEditandoId(inmueble.id_inmueble)
      setFormulario({
        titulo: inmueble.titulo || '',
        tipo: inmueble.tipo || '',
        direccion: inmueble.direccion || '',
        localidad: inmueble.localidad || '',
        provincia: inmueble.provincia || '',
        estado: inmueble.estado || 'disponible',
        precio: inmueble.precio ?? '',
        descripcion: inmueble.descripcion || '',
        superficie: inmueble.superficie ?? '',
        ambientes: inmueble.ambientes ?? '',
        dormitorios: inmueble.dormitorios ?? '',
        banios: inmueble.banios ?? '',
        propietario_id: inmueble.propietario_id ?? null,
        secretario_id: inmueble.secretario_id ?? null,
      })
      setFotoActual(inmueble.foto ?? null)
      setArchivoFoto(null)
      setErroresFormulario({})
    } catch {
      setError('No se pudo cargar el inmueble para editar.')
    }
  }

  const handleCancelar = () => {
    setEditandoId(null)
    setFormulario(valoresIniciales)
    setArchivoFoto(null)
    setFotoActual(null)
    setErroresFormulario({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return

    // Se arma FormData (no JSON) porque puede ir una imagen adjunta. Axios
    // detecta que es FormData y pone el Content-Type con boundary solo;
    // por eso acá no se fija ningún header a mano.
    const datosFormulario = new FormData()
    datosFormulario.append('titulo', formulario.titulo)
    datosFormulario.append('tipo', formulario.tipo)
    datosFormulario.append('direccion', formulario.direccion)
    datosFormulario.append('localidad', formulario.localidad)
    datosFormulario.append('provincia', formulario.provincia)
    datosFormulario.append('estado', formulario.estado)
    datosFormulario.append('precio', formulario.precio)
    datosFormulario.append('descripcion', formulario.descripcion)
    datosFormulario.append('superficie', formulario.superficie)
    datosFormulario.append('ambientes', formulario.ambientes)
    datosFormulario.append('dormitorios', formulario.dormitorios)
    datosFormulario.append('banios', formulario.banios)
    // propietario_id/secretario_id pueden ser null (no hay input para
    // ellos): si se appendean como null, FormData los convierte en el
    // string "null", así que solo se mandan cuando tienen un valor real.
    if (formulario.propietario_id !== null && formulario.propietario_id !== '') {
      datosFormulario.append('propietario_id', formulario.propietario_id)
    }
    if (formulario.secretario_id !== null && formulario.secretario_id !== '') {
      datosFormulario.append('secretario_id', formulario.secretario_id)
    }
    // El campo se llama "foto", igual que en upload.single('foto') del backend.
    // Si no se eligió una imagen nueva, no se appendea nada y el backend
    // conserva la que ya tenía el inmueble.
    if (archivoFoto) {
      datosFormulario.append('foto', archivoFoto)
    }

    setEnviando(true)
    try {
      if (editandoId) {
        await actualizarInmueble(editandoId, datosFormulario)
      } else {
        await crearInmueble(datosFormulario)
      }
      setFormulario(valoresIniciales)
      setArchivoFoto(null)
      setFotoActual(null)
      setEditandoId(null)
      setErroresFormulario({})
      cargarInmuebles()
    } catch (err) {
      setErroresFormulario({
        general: err.response?.data?.message || 'No se pudo guardar el inmueble.',
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar este inmueble?')
    if (!confirmar) return

    try {
      await eliminarInmueble(id)
      cargarInmuebles()
    } catch {
      setError('No se pudo eliminar el inmueble.')
    }
  }

  const seleccionarSeccion = (id) => {
    setSeccionActiva(id)
    window.scrollTo({ top: 0 })
  }

  const registrarOperacionDesde = (solicitud) => {
    setPrefillCompraventa(solicitud)
    seleccionarSeccion('compraventas')
  }

  return (
    <PanelLayout
      titulo="Panel del Secretario"
      secciones={SECCIONES}
      seccionActiva={seccionActiva}
      onSeleccionar={seleccionarSeccion}
    >
      {seccionActiva === 'inicio' && (
        <InicioPanel secciones={SECCIONES} onSeleccionar={seleccionarSeccion} />
      )}

      {seccionActiva === 'inmuebles' && (
        <>
          <h2 className="font-serif text-2xl text-verde-oscuro">Inmuebles</h2>
          <p className="mt-1 text-texto/70">Gestión de inmuebles.</p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm"
          >
            <h2 className="font-serif text-xl text-verde-oscuro">
              {editandoId ? `Editar inmueble #${editandoId}` : 'Nuevo inmueble'}
            </h2>

            {erroresFormulario.general && (
              <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
                {erroresFormulario.general}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-texto/80" htmlFor="titulo">
                  Título
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  value={formulario.titulo}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
                {erroresFormulario.titulo && (
                  <p className="mt-1 text-xs text-red-700">{erroresFormulario.titulo}</p>
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
                  <option value="">-- Seleccioná --</option>
                  <option value="casa">Casa</option>
                  <option value="depto">Depto</option>
                  <option value="local">Local</option>
                  <option value="terreno">Terreno</option>
                </select>
                {erroresFormulario.tipo && (
                  <p className="mt-1 text-xs text-red-700">{erroresFormulario.tipo}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-sm text-texto/80" htmlFor="direccion">
                  Dirección
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  value={formulario.direccion}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
                {erroresFormulario.direccion && (
                  <p className="mt-1 text-xs text-red-700">{erroresFormulario.direccion}</p>
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
                  <option value="disponible">Disponible</option>
                  <option value="alquilado">Alquilado</option>
                  <option value="vendido">Vendido</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm text-texto/80" htmlFor="localidad">
                  Localidad
                </label>
                <input
                  id="localidad"
                  name="localidad"
                  type="text"
                  value={formulario.localidad}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>

              <div>
                <label className="text-sm text-texto/80" htmlFor="provincia">
                  Provincia
                </label>
                <input
                  id="provincia"
                  name="provincia"
                  type="text"
                  value={formulario.provincia}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>

              <div>
                <label className="text-sm text-texto/80" htmlFor="precio">
                  Precio
                </label>
                <input
                  id="precio"
                  name="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.precio}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
                {erroresFormulario.precio && (
                  <p className="mt-1 text-xs text-red-700">{erroresFormulario.precio}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="text-sm text-texto/80" htmlFor="superficie">
                  Superficie (m²)
                </label>
                <input
                  id="superficie"
                  name="superficie"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formulario.superficie}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>

              <div>
                <label className="text-sm text-texto/80" htmlFor="ambientes">
                  Ambientes
                </label>
                <input
                  id="ambientes"
                  name="ambientes"
                  type="number"
                  min="0"
                  value={formulario.ambientes}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>

              <div>
                <label className="text-sm text-texto/80" htmlFor="dormitorios">
                  Dormitorios
                </label>
                <input
                  id="dormitorios"
                  name="dormitorios"
                  type="number"
                  min="0"
                  value={formulario.dormitorios}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>

              <div>
                <label className="text-sm text-texto/80" htmlFor="banios">
                  Baños
                </label>
                <input
                  id="banios"
                  name="banios"
                  type="number"
                  min="0"
                  value={formulario.banios}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-texto/80" htmlFor="descripcion">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                value={formulario.descripcion}
                onChange={handleChange}
                className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
              />
            </div>

            <div>
              <label className="text-sm text-texto/80" htmlFor="foto">
                Foto{' '}
                {editandoId && (
                  <span className="text-texto/40">(dejar vacío para conservar la actual)</span>
                )}
              </label>

              {editandoId && fotoActual && (
                <img
                  src={getUrlFoto(fotoActual)}
                  alt="Foto actual del inmueble"
                  className="mt-2 h-24 w-32 rounded-sm object-cover"
                />
              )}

              <input
                id="foto"
                name="foto"
                type="file"
                accept="image/*"
                onChange={(e) => setArchivoFoto(e.target.files[0] || null)}
                className="mt-1 block w-full text-sm text-texto/80 file:mr-3 file:rounded-sm file:border-0 file:bg-verde-oscuro/10 file:px-3 file:py-1.5 file:text-sm file:text-verde-oscuro"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={enviando}
                className="rounded-sm bg-verde-oscuro px-6 py-2.5 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
              >
                {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear inmueble'}
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

          <div className="mt-10">
            <h2 className="font-serif text-xl text-verde-oscuro">Inmuebles cargados</h2>

            {cargando && <p className="mt-4 text-texto/60">Cargando...</p>}
            {error && <p className="mt-4 text-red-700">{error}</p>}

            {!cargando && !error && (
              <div className="mt-4 overflow-x-auto rounded-md bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-verde-oscuro/5 text-xs uppercase tracking-wide text-verde-oscuro/70">
                    <tr>
                      <th className="px-4 py-3">Título</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Localidad</th>
                      <th className="px-4 py-3">Precio</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inmuebles.map((inmueble) => (
                      <tr key={inmueble.id_inmueble} className="border-t border-verde-oscuro/10">
                        <td className="px-4 py-3">{inmueble.titulo}</td>
                        <td className="px-4 py-3 capitalize">{inmueble.tipo}</td>
                        <td className="px-4 py-3">{inmueble.localidad || '—'}</td>
                        <td className="px-4 py-3">
                          {inmueble.precio
                            ? `$${Number(inmueble.precio).toLocaleString('es-AR')}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-verde-oscuro/10 px-2 py-0.5 text-xs capitalize text-verde-oscuro">
                            {inmueble.estado}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => handleEditarClick(inmueble.id_inmueble)}
                              className="text-dorado hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminar(inmueble.id_inmueble)}
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

                {inmuebles.length === 0 && (
                  <p className="px-4 py-6 text-center text-texto/60">
                    Todavía no hay inmuebles cargados.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {seccionActiva === 'solicitudes' && (
        <SeccionSolicitudes onRegistrarOperacion={registrarOperacionDesde} />
      )}

      {seccionActiva === 'compraventas' && (
        <SeccionCompraventas
          inmuebles={inmuebles}
          prefill={prefillCompraventa}
          onPrefillUsado={() => setPrefillCompraventa(null)}
          onInmueblesCambiaron={cargarInmuebles}
        />
      )}

      {seccionActiva === 'alquileres' && <SeccionAlquileres inmuebles={inmuebles} />}
      {seccionActiva === 'recibos' && <SeccionRecibos />}
      {seccionActiva === 'cuentas' && <SeccionCuentasBancarias />}
      {seccionActiva === 'movimientos' && <SeccionMovimientosBancarios />}
    </PanelLayout>
  )
}

export default PanelSecretario
