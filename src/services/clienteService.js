import apiClient from './apiClient'

// Por ahora solo se necesita el listado, para armar el <select> de clientes
// al crear un alquiler. Si más adelante hace falta getClienteById u otras
// operaciones, se agregan acá.
export const getClientes = async () => {
  const respuesta = await apiClient.get('/clientes')
  return respuesta.data
}
