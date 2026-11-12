import { startTransition } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

function Navbar() {
  const { usuarioActual, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const linkClase = ({ isActive }) =>
    `text-sm transition ${isActive ? 'text-dorado' : 'text-crema/80 hover:text-crema'}`

  // cerrarSesion (limpia token y usuario) y navigate('/') van juntos en una
  // misma transición para que React los aplique en un único render. Si se
  // aplicaran por separado, al salir desde una ruta protegida
  // (/panel/secretario) RutaProtegida podría ver primero "sin sesión" con la
  // ruta vieja y mandar a /login en vez de a /.
  const handleSalir = () => {
    startTransition(() => {
      cerrarSesion()
      navigate('/')
    })
  }

  return (
    <header className="bg-verde-oscuro">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-4">
        <Link to="/" className="font-serif text-xl text-crema">
          La Finca
        </Link>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
          <NavLink to="/" end className={linkClase}>
            Inicio
          </NavLink>
          <NavLink to="/catalogo" className={linkClase}>
            Catálogo
          </NavLink>

          {!usuarioActual ? (
            <>
              <NavLink to="/login" className={linkClase}>
                Ingresar
              </NavLink>
              <NavLink
                to="/registro"
                className="rounded-sm bg-dorado px-4 py-1.5 text-sm font-medium text-verde-oscuro transition hover:brightness-95"
              >
                Registrarse
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/perfil" className={linkClase}>
                Mi perfil
              </NavLink>
              {usuarioActual.rol === 'secretario' && (
                <NavLink to="/panel/secretario" className={linkClase}>
                  Panel
                </NavLink>
              )}
              <button
                type="button"
                onClick={handleSalir}
                className="text-sm text-crema/80 transition hover:text-crema"
              >
                Salir
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar
