import apiClient from './apiClient'

// Todas las rutas son solo para el secretario (el backend lo exige con el token).

export const getCompraventas = async () => {
  const respuesta = await apiClient.get('/compraventas')
  return respuesta.data
}

export const crearCompraventa = async (datos) => {
  const respuesta = await apiClient.post('/compraventas', datos)
  return respuesta.data
}

export const actualizarCompraventa = async (id, datos) => {
  const respuesta = await apiClient.put(`/compraventas/${id}`, datos)
  return respuesta.data
}

export const confirmarCompraventa = async (id) => {
  const respuesta = await apiClient.post(`/compraventas/${id}/confirmar`)
  return respuesta.data
}

export const anularCompraventa = async (id) => {
  const respuesta = await apiClient.post(`/compraventas/${id}/anular`)
  return respuesta.data
}

export const eliminarCompraventa = async (id) => {
  await apiClient.delete(`/compraventas/${id}`)
}
