import apiClient from './apiClient'

export const getAlquileres = async () => {
  const respuesta = await apiClient.get('/alquileres')
  return respuesta.data
}

export const getAlquilerById = async (id) => {
  const respuesta = await apiClient.get(`/alquileres/${id}`)
  return respuesta.data
}

export const crearAlquiler = async (datos) => {
  const respuesta = await apiClient.post('/alquileres', datos)
  return respuesta.data
}

export const actualizarAlquiler = async (id, datos) => {
  const respuesta = await apiClient.put(`/alquileres/${id}`, datos)
  return respuesta.data
}

export const eliminarAlquiler = async (id) => {
  await apiClient.delete(`/alquileres/${id}`)
}
