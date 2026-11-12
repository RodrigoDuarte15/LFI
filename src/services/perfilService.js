import apiClient from './apiClient'

// Todas las rutas son de la cuenta autenticada: no llevan id, el backend toma la
// identidad del token.

export const getPerfil = async () => {
  const respuesta = await apiClient.get('/perfil')
  return respuesta.data
}

export const actualizarPerfil = async (datos) => {
  const respuesta = await apiClient.put('/perfil', datos)
  return respuesta.data
}

// El campo se llama "foto", igual que en recibirFotoPerfil (backend). Al ser
// FormData, el navegador arma solo el Content-Type multipart con su boundary.
export const subirFotoPerfil = async (archivo) => {
  const datos = new FormData()
  datos.append('foto', archivo)

  const respuesta = await apiClient.put('/perfil/foto', datos)
  return respuesta.data
}
