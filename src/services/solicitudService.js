import apiClient from './apiClient'

// El cliente crea la solicitud; la identidad sale del token, no se manda ningún id de cliente.
export const crearSolicitud = async (datos) => {
  const respuesta = await apiClient.post('/solicitudes', datos)
  return respuesta.data
}

// Gestión (solo secretario)
export const getSolicitudes = async () => {
  const respuesta = await apiClient.get('/solicitudes')
  return respuesta.data
}

export const actualizarEstadoSolicitud = async (id, estado) => {
  const respuesta = await apiClient.put(`/solicitudes/${id}`, { estado })
  return respuesta.data
}
