import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

// rolesPermitidos es opcional: sin ese prop, se comporta como antes (solo
// exige estar logueado). Pasando rolesPermitidos={['secretario']} además
// exige que el rol del usuario esté en esa lista.
//
// Esto es solo UX (evita que React muestre la pantalla). La protección real
// está en el backend: cada endpoint administrativo valida el rol de nuevo
// con autorizarRoles, así que aunque alguien fuerce la ruta igual no va a
// poder operar contra la API.
function RutaProtegida({ rolesPermitidos }) {
  const { usuarioActual } = useAuth()

  if (!usuarioActual) {
    return <Navigate to="/login" replace />
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuarioActual.rol)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RutaProtegida
