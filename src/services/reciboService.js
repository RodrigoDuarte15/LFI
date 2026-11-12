import apiClient from './apiClient'

export const getRecibos = async () => {
  const respuesta = await apiClient.get('/recibos')
  return respuesta.data
}

export const getReciboById = async (id) => {
  const respuesta = await apiClient.get(`/recibos/${id}`)
  return respuesta.data
}

export const crearRecibo = async (datos) => {
  const respuesta = await apiClient.post('/recibos', datos)
  return respuesta.data
}

// El backend solo acepta { estado, total } en este PUT (columnas fijas,
// no reemplazo total). No mandar otros campos: el controller los ignora igual.
export const actualizarRecibo = async (id, datos) => {
  const respuesta = await apiClient.put(`/recibos/${id}`, datos)
  return respuesta.data
}

export const eliminarRecibo = async (id) => {
  await apiClient.delete(`/recibos/${id}`)
}
