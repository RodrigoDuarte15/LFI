import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const valoresIniciales = {
  nombre: '',
  apellido: '',
  dni: '',
  fecha_nacimiento: '',
  email: '',
  password: '',
  confirmarPassword: '',
  telefono: '',
  direccion: '',
}

function Registro() {
  const { registrarUsuario } = useAuth()

  const [datos, setDatos] = useState(valoresIniciales)
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setDatos((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!datos.nombre.trim()) {
      nuevosErrores.nombre = 'Ingresá tu nombre.'
    }

    if (!datos.apellido.trim()) {
      nuevosErrores.apellido = 'Ingresá tu apellido.'
    }

    if (!datos.dni.trim()) {
      nuevosErrores.dni = 'Ingresá tu DNI.'
    } else if (!/^\d{7,8}$/.test(datos.dni.trim())) {
      nuevosErrores.dni = 'El DNI debe tener 7 u 8 dígitos, sin puntos.'
    }

    if (!datos.fecha_nacimiento) {
      nuevosErrores.fecha_nacimiento = 'Ingresá tu fecha de nacimiento.'
    } else {
      const nacimiento = new Date(datos.fecha_nacimiento)
      const hoy = new Date()
      let edad = hoy.getFullYear() - nacimiento.getFullYear()
      const todaviaNoCumplioEsteAnio =
        hoy.getMonth() < nacimiento.getMonth() ||
        (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())
      if (todaviaNoCumplioEsteAnio) edad -= 1

      if (edad < 18) {
        nuevosErrores.fecha_nacimiento = 'Tenés que ser mayor de edad para registrarte.'
      }
    }

    if (!datos.email.trim()) {
      nuevosErrores.email = 'Ingresá tu email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim())) {
      nuevosErrores.email = 'Ingresá un email válido.'
    }

    if (!datos.password) {
      nuevosErrores.password = 'Ingresá una contraseña.'
    } else if (datos.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres.'
    }

    if (datos.confirmarPassword !== datos.password) {
      nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setEnviado(false)

    if (!validar()) return

    // confirmarPassword solo sirve para validar en el formulario: no se envía.
    // La contraseña viaja tal cual al backend, que es quien hace el bcrypt.hash().
    // oxlint-disable-next-line no-unused-vars
    const { confirmarPassword, ...datosParaEnviar } = datos

    setCargando(true)
    const resultado = await registrarUsuario(datosParaEnviar)
    setCargando(false)

    if (resultado.exito) {
      setDatos(valoresIniciales)
      setErrores({})
      setEnviado(true)
    } else {
      setErrores({ general: resultado.mensaje })
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <h1 className="text-center font-serif text-3xl text-verde-oscuro">
        Únase a La Finca
      </h1>
      <p className="mt-2 text-center text-sm text-texto/70">
        Complete sus datos para acceder a la gestión de propiedades.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm"
      >
        {errores.general && (
          <p className="rounded-sm bg-red-50 px-3 py-2 text-center text-sm text-red-700">
            {errores.general}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-texto/80" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={datos.nombre}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {errores.nombre && (
              <p className="mt-1 text-xs text-red-700">{errores.nombre}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="apellido">
              Apellido
            </label>
            <input
              id="apellido"
              name="apellido"
              type="text"
              value={datos.apellido}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {errores.apellido && (
              <p className="mt-1 text-xs text-red-700">{errores.apellido}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-texto/80" htmlFor="dni">
              DNI
            </label>
            <input
              id="dni"
              name="dni"
              type="text"
              placeholder="Sin puntos ni espacios"
              value={datos.dni}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {errores.dni && <p className="mt-1 text-xs text-red-700">{errores.dni}</p>}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="fecha_nacimiento">
              Fecha de nacimiento
            </label>
            <input
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              type="date"
              value={datos.fecha_nacimiento}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {errores.fecha_nacimiento && (
              <p className="mt-1 text-xs text-red-700">{errores.fecha_nacimiento}</p>
            )}
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
            value={datos.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
          />
          {errores.email && <p className="mt-1 text-xs text-red-700">{errores.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-texto/80" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={datos.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {errores.password && (
              <p className="mt-1 text-xs text-red-700">{errores.password}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="confirmarPassword">
              Confirmar
            </label>
            <input
              id="confirmarPassword"
              name="confirmarPassword"
              type="password"
              value={datos.confirmarPassword}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {errores.confirmarPassword && (
              <p className="mt-1 text-xs text-red-700">{errores.confirmarPassword}</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm text-texto/80" htmlFor="telefono">
            Teléfono <span className="text-texto/40">(opcional)</span>
          </label>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            value={datos.telefono}
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
            value={datos.direccion}
            onChange={handleChange}
            className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="mt-2 rounded-sm bg-verde-oscuro py-2.5 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
        >
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        {enviado && (
          <p className="text-center text-sm text-verde-oscuro">
            Cuenta creada correctamente. Ya podés iniciar sesión.
          </p>
        )}
      </form>

      <p className="mt-6 text-center text-sm text-texto/70">
        ¿Ya tiene una cuenta?{' '}
        <Link to="/login" className="text-dorado hover:underline">
          Inicie sesión
        </Link>
      </p>
    </div>
  )
}

export default Registro
