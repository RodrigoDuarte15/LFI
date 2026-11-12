import apiClient from './apiClient'

export const getDashboard = async () => {
  const respuesta = await apiClient.get('/dashboard')
  return respuesta.data
}
