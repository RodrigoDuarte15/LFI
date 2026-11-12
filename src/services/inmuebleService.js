import apiClient, { SERVER_URL } from './apiClient'

// inmueble.foto llega como ruta relativa (ej: "/uploads/123-456.jpg").
// Esto arma la URL completa para poder usarla en un <img src="...">.
export const getUrlFoto = (foto) => (foto ? `${SERVER_URL}${foto}` : null)

// Un inmueble sin estado cargado se considera disponible (igual que en el backend).
// Cualquier otro estado (alquilado, vendido, mantenimiento...) lo deja fuera de
// consultas y operaciones nuevas.
export const inmuebleDisponible = (estado) => !estado || estado === 'disponible'

export const getInmuebles = async (filtros = {}) => {
  const respuesta = await apiClient.get('/inmuebles', { params: filtros })
  return respuesta.data
}

export const getOpcionesCatalogo = async (provincia = '') => {
  const respuesta = await apiClient.get('/inmuebles/opciones', { params: provincia ? { provincia } : {} })
  return respuesta.data
}

export const getInmuebleById = async (id) => {
  const respuesta = await apiClient.get(`/inmuebles/${id}`)
  return respuesta.data
}

export const crearInmueble = async (datos) => {
  const respuesta = await apiClient.post('/inmuebles', datos)
  return respuesta.data
}

export const actualizarInmueble = async (id, datos) => {
  const respuesta = await apiClient.put(`/inmuebles/${id}`, datos)
  return respuesta.data
}

export const eliminarInmueble = async (id) => {
  await apiClient.delete(`/inmuebles/${id}`)
}
