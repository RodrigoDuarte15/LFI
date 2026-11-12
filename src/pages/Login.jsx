import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import hero from '../assets/hero.png'

// Destino de cada rol después de iniciar sesión. Solo rutas que ya existen
// en App.jsx: como no hay Panel Cliente, el cliente va al catálogo.
const RUTA_POR_ROL = {
  secretario: '/panel/secretario',
  cliente: '/catalogo',
}

function Login() {
  const { usuarioActual, iniciarSesion } = useAuth()

  const [datos, setDatos] = useState({ email: '', password: '' })
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setDatos((prev) => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const nuevosErrores = {}

    if (!datos.email.trim()) {
      nuevosErrores.email = 'Ingresá tu email.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email.trim())) {
      nuevosErrores.email = 'Ingresá un email válido.'
    }

    if (!datos.password) {
      nuevosErrores.password = 'Ingresá tu contraseña.'
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validar()) return

    setCargando(true)
    const resultado = await iniciarSesion(datos.email, datos.password)
    setCargando(false)

    // Si salió bien no hay nada más que hacer acá: AuthProvider ya actualizó
    // usuarioActual y el redirect de más abajo se encarga de la navegación.
    if (!resultado.exito) {
      setErrores({ general: resultado.mensaje })
      setDatos((prev) => ({ ...prev, password: '' }))
    }
  }

  // La sesión es la única fuente de verdad: recién cuando AuthProvider tiene
  // al usuario se redirige según su rol, así nunca se navega antes de que la
  // sesión esté actualizada. Además, quien ya está logueado y entra a /login
  // va directo a su destino.
  if (usuarioActual) {
    return <Navigate to={RUTA_POR_ROL[usuarioActual.rol] ?? '/'} replace />
  }

  return (
    <div
      className="flex min-h-[80vh] items-center justify-center bg-cover bg-center px-4 py-12"
      style={{
        backgroundImage: `linear-gradient(rgba(20,38,28,0.85), rgba(20,38,28,0.9)), url(${hero})`,
      }}
    >
      <div className="w-full max-w-sm rounded-md bg-crema p-8 shadow-lg">
        <h1 className="text-center font-serif text-2xl text-verde-oscuro">
          La Finca
        </h1>
        <p className="mt-1 text-center text-xs uppercase tracking-wide text-texto/50">
          Portal de gestión patrimonial
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          {errores.general && (
            <p className="rounded-sm bg-red-50 px-3 py-2 text-center text-sm text-red-700">
              {errores.general}
            </p>
          )}

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
            {errores.email && (
              <p className="mt-1 text-xs text-red-700">{errores.email}</p>
            )}
          </div>

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

          <button
            type="submit"
            disabled={cargando}
            className="mt-2 rounded-sm bg-verde-oscuro py-2.5 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
          >
            {cargando ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-texto/70">
          ¿No tiene una cuenta?{' '}
          <Link to="/registro" className="text-dorado hover:underline">
            Regístrese
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
