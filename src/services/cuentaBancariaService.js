import apiClient from './apiClient'

export const getCuentasBancarias = async () => {
  const respuesta = await apiClient.get('/cuentas-bancarias')
  return respuesta.data
}

export const getCuentaBancariaById = async (id) => {
  const respuesta = await apiClient.get(`/cuentas-bancarias/${id}`)
  return respuesta.data
}

export const crearCuentaBancaria = async (datos) => {
  const respuesta = await apiClient.post('/cuentas-bancarias', datos)
  return respuesta.data
}

export const actualizarCuentaBancaria = async (id, datos) => {
  const respuesta = await apiClient.put(`/cuentas-bancarias/${id}`, datos)
  return respuesta.data
}

export const eliminarCuentaBancaria = async (id) => {
  await apiClient.delete(`/cuentas-bancarias/${id}`)
}
