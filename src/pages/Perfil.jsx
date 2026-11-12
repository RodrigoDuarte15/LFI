import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth'
import { getPerfil, actualizarPerfil } from '../services/perfilService'
import FotoPerfil from '../components/perfil/FotoPerfil'

const ETIQUETA_ROL = { cliente: 'Cliente', secretario: 'Secretario' }
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Solo estos campos se pueden editar desde "Mi perfil". DNI y fecha de nacimiento
// se muestran pero no se modifican; el rol, el id y la contraseña no aparecen.
const formularioDesde = (perfil) => ({
  nombre: perfil.nombre ?? '',
  apellido: perfil.apellido ?? '',
  email: perfil.email ?? '',
  telefono: perfil.telefono ?? '',
  direccion: perfil.direccion ?? '',
})

function Perfil() {
  const { actualizarSesion } = useAuth()

  const [perfil, setPerfil] = useState(null)
  const [formulario, setFormulario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState(null)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const aplicarPerfil = (datos) => {
    setPerfil(datos)
    setFormulario(formularioDesde(datos))
  }

  useEffect(() => {
    getPerfil()
      .then(aplicarPerfil)
      .catch(() => setErrorCarga('No se pudo cargar tu perfil.'))
      .finally(() => setCargando(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!formulario.nombre.trim()) nuevosErrores.nombre = 'Ingresá tu nombre.'
    if (!formulario.apellido.trim()) nuevosErrores.apellido = 'Ingresá tu apellido.'

    if (!formulario.email.trim()) {
      nuevosErrores.email = 'Ingresá tu email.'
    } else if (!EMAIL_VALIDO.test(formulario.email.trim())) {
      nuevosErrores.email = 'Ingresá un email válido.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMensaje(null)

    if (!validar()) return

    setGuardando(true)
    try {
      const actualizado = await actualizarPerfil(formulario)
      aplicarPerfil(actualizado)
      // Se refleja en la sesión para que el resto de la app (por ejemplo el saludo
      // del panel) muestre los datos nuevos sin cerrar sesión.
      actualizarSesion({
        nombre: actualizado.nombre,
        apellido: actualizado.apellido,
        email: actualizado.email,
      })
      setErrores({})
      setMensaje('Tus datos se actualizaron correctamente.')
    } catch (err) {
      setErrores({ general: err.response?.data?.message || 'No se pudieron guardar los cambios.' })
    } finally {
      setGuardando(false)
    }
  }

  const handleFotoActualizada = (ruta) => {
    setPerfil((prev) => ({ ...prev, foto: ruta }))
  }

  if (cargando) {
    return <p className="mx-auto max-w-4xl px-4 py-12 text-texto/60">Cargando tu perfil...</p>
  }

  if (errorCarga) {
    return <p className="mx-auto max-w-4xl px-4 py-12 text-red-700">{errorCarga}</p>
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl text-verde-oscuro">Mi perfil</h1>
      <p className="mt-1 text-texto/70">
        Cuenta de tipo {ETIQUETA_ROL[perfil.rol] ?? perfil.rol}. Acá podés ver y editar tus datos.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[16rem_1fr]">
        <FotoPerfil
          foto={perfil.foto}
          nombre={perfil.nombre}
          apellido={perfil.apellido}
          onFotoActualizada={handleFotoActualizada}
        />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm"
        >
          <h2 className="font-serif text-lg text-verde-oscuro">Datos personales</h2>

          {errores.general && (
            <p role="alert" className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
              {errores.general}
            </p>
          )}
          {mensaje && (
            <p role="status" className="rounded-sm bg-verde-oscuro/10 px-3 py-2 text-sm text-verde-oscuro">
              {mensaje}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-texto/80" htmlFor="nombre">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                maxLength={50}
                value={formulario.nombre}
                onChange={handleChange}
                className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
              />
              {errores.nombre && <p className="mt-1 text-xs text-red-700">{errores.nombre}</p>}
            </div>

            <div>
              <label className="text-sm text-texto/80" htmlFor="apellido">
                Apellido
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                maxLength={50}
                value={formulario.apellido}
                onChange={handleChange}
                className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
              />
              {errores.apellido && <p className="mt-1 text-xs text-red-700">{errores.apellido}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              maxLength={100}
              value={formulario.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {errores.email && <p className="mt-1 text-xs text-red-700">{errores.email}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-texto/80" htmlFor="telefono">
                Teléfono <span className="text-texto/40">(opcional)</span>
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                maxLength={20}
                value={formulario.telefono}
                onChange={handleChange}
                className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
              />
            </div>

            <div>
              <label className="text-sm text-texto/80" htmlFor="direccion">
                Dirección <span className="text-texto/40">(opcional)</span>
              </label>
              <input
                id="direccion"
                name="direccion"
                type="text"
                maxLength={100}
                value={formulario.direccion}
                onChange={handleChange}
                className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-texto/80" htmlFor="dni">
                DNI
              </label>
              <input
                id="dni"
                type="text"
                value={perfil.dni ?? ''}
                disabled
                className="mt-1 w-full rounded-sm border border-verde-oscuro/20 bg-verde-oscuro/5 px-3 py-2 text-sm text-texto/60"
              />
            </div>

            <div>
              <label className="text-sm text-texto/80" htmlFor="fecha_nacimiento">
                Fecha de nacimiento
              </label>
              <input
                id="fecha_nacimiento"
                type="text"
                value={perfil.fecha_nacimiento ?? ''}
                disabled
                className="mt-1 w-full rounded-sm border border-verde-oscuro/20 bg-verde-oscuro/5 px-3 py-2 text-sm text-texto/60"
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-texto/50">
            El DNI y la fecha de nacimiento no se pueden modificar desde acá.
          </p>

          <button
            type="submit"
            disabled={guardando}
            className="mt-2 w-fit rounded-sm bg-verde-oscuro px-6 py-2.5 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Perfil
