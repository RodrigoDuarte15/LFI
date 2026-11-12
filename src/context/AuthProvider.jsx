import { useEffect, useState } from 'react'
import apiClient, { EVENTO_SESION_EXPIRADA } from '../services/apiClient'
import { AuthContext } from './AuthContext'

// Lee la fecha de vencimiento (exp) que el backend puso dentro del JWT. No
// verifica la firma (eso lo hace el backend en cada pedido): solo evita
// presentar como "logueado" a alguien cuyo token ya venció.
const tokenVigente = (token) => {
  try {
    const cuerpo = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(cuerpo))
    return typeof exp !== 'number' || exp * 1000 > Date.now()
  } catch {
    return false
  }
}

function AuthProvider({ children }) {
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const token = localStorage.getItem('token')
    const usuarioGuardado = localStorage.getItem('usuario')

    if (!token && !usuarioGuardado) {
      return null
    }

    try {
      if (token && usuarioGuardado && tokenVigente(token)) {
        return JSON.parse(usuarioGuardado)
      }
    } catch {
      // usuario guardado corrupto: se trata igual que una sesión inválida
    }

    // Sesión incompleta, corrupta o con el token vencido: se descarta, para que la
    // app no se muestre "logueada" (sin botón de ingresar) con una sesión que ya
    // no sirve contra el backend.
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    return null
  })

  const iniciarSesion = async (email, password) => {
    try {
      const respuesta = await apiClient.post('/autenticacion/login', { email, password })
      const { token, usuario } = respuesta.data

      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))
      setUsuarioActual(usuario)

      return { exito: true }
    } catch (error) {
      const mensaje = error.response?.data?.message || 'No se pudo iniciar sesión.'
      return { exito: false, mensaje }
    }
  }

  const registrarUsuario = async (datos) => {
    try {
      const respuesta = await apiClient.post('/autenticacion/registro', datos)
      return { exito: true, usuario: respuesta.data }
    } catch (error) {
      const mensaje = error.response?.data?.message || 'No se pudo completar el registro.'
      return { exito: false, mensaje }
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuarioActual(null)
  }

  // Refleja en la sesión los datos editados en "Mi perfil", sin pedir un nuevo
  // login. Solo toma los campos que el perfil puede cambiar: el id y el rol de
  // la sesión no se tocan desde acá.
  const actualizarSesion = ({ nombre, apellido, email }) => {
    if (!usuarioActual) return

    const actualizado = {
      ...usuarioActual,
      nombre: nombre ?? usuarioActual.nombre,
      apellido: apellido ?? usuarioActual.apellido,
      email: email ?? usuarioActual.email,
    }

    localStorage.setItem('usuario', JSON.stringify(actualizado))
    setUsuarioActual(actualizado)
  }

  // apiClient avisa con este evento cuando el backend rechaza el token
  // (venció mientras la pestaña seguía abierta): se cierra la sesión en pantalla.
  useEffect(() => {
    window.addEventListener(EVENTO_SESION_EXPIRADA, cerrarSesion)
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, cerrarSesion)
  }, [])

  const valores = {
    usuarioActual,
    iniciarSesion,
    registrarUsuario,
    cerrarSesion,
    actualizarSesion,
  }

  return <AuthContext.Provider value={valores}>{children}</AuthContext.Provider>
}

export default AuthProvider
