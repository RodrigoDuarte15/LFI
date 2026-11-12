import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api',
})

// Origen del backend sin el prefijo /api (ej: http://localhost:4000), para
// construir URLs de archivos estáticos que Express sirve aparte (como las
// fotos guardadas en /uploads). Se deriva de baseURL para no duplicar el host.
export const SERVER_URL = apiClient.defaults.baseURL.replace(/\/api\/?$/, '')

// Antes de cada petición, si hay un token guardado, lo adjunta como
// Authorization: Bearer <token>.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Evento con el que apiClient le avisa a AuthProvider que el backend rechazó el
// token (vencido o inválido), para que cierre la sesión también en pantalla.
export const EVENTO_SESION_EXPIRADA = 'sesion-expirada'

apiClient.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const url = error.config?.url ?? ''
    const habiaSesion = Boolean(localStorage.getItem('token'))

    // Un 401 en /autenticacion/* es "credenciales incorrectas" del login, no una
    // sesión vencida: ahí no hay que cerrar nada.
    if (error.response?.status === 401 && habiaSesion && !url.startsWith('/autenticacion/')) {
      window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA))
    }

    return Promise.reject(error)
  },
)

export default apiClient
