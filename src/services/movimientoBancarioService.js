import apiClient from './apiClient'

export const getMovimientos = async () => {
  const respuesta = await apiClient.get('/movimientos')
  return respuesta.data
}

export const getMovimientoById = async (id) => {
  const respuesta = await apiClient.get(`/movimientos/${id}`)
  return respuesta.data
}

export const crearMovimiento = async (datos) => {
  const respuesta = await apiClient.post('/movimientos', datos)
  return respuesta.data
}

// El backend solo acepta { fecha, tipo, descripcion, monto } en este PUT.
// recibo_id no se puede modificar una vez creado el movimiento.
export const actualizarMovimiento = async (id, datos) => {
  const respuesta = await apiClient.put(`/movimientos/${id}`, datos)
  return respuesta.data
}

export const eliminarMovimiento = async (id) => {
  await apiClient.delete(`/movimientos/${id}`)
}
