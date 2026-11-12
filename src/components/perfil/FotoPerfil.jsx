import { useEffect, useRef, useState } from 'react'
import { subirFotoPerfil } from '../../services/perfilService'
import { getUrlFoto } from '../../services/inmuebleService'

// Mismos límites que valida el backend (recibirFotoPerfil). Acá se controlan antes
// de subir para avisar al instante, pero el backend vuelve a validar siempre.
const TIPOS_ADMITIDOS = ['image/jpeg', 'image/png', 'image/webp']
const TAMANO_MAXIMO = 2 * 1024 * 1024

function FotoPerfil({ foto, nombre, apellido, onFotoActualizada }) {
  const inputRef = useRef(null)
  const [archivo, setArchivo] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState(null)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const [urlRota, setUrlRota] = useState(null)

  // Vista previa local del archivo elegido (antes de subirlo). La URL temporal se
  // libera al cambiar de archivo o al salir de la pantalla.
  useEffect(() => {
    if (!archivo) {
      setVistaPrevia(null)
      return undefined
    }

    const url = URL.createObjectURL(archivo)
    setVistaPrevia(url)
    return () => URL.revokeObjectURL(url)
  }, [archivo])

  const urlActual = vistaPrevia || getUrlFoto(foto)
  // Si la imagen no se puede cargar (por ejemplo, el archivo ya no existe) se
  // muestra el avatar predeterminado en lugar de una imagen rota.
  const mostrarImagen = Boolean(urlActual) && urlActual !== urlRota
  const iniciales = `${nombre?.[0] ?? ''}${apellido?.[0] ?? ''}`.toUpperCase() || '?'

  const limpiarSeleccion = () => {
    setArchivo(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSeleccion = (e) => {
    const elegido = e.target.files[0]
    setError(null)
    setMensaje(null)

    if (!elegido) return

    if (!TIPOS_ADMITIDOS.includes(elegido.type)) {
      limpiarSeleccion()
      setError('Formato no admitido: subí una imagen JPG, PNG o WEBP.')
      return
    }

    if (elegido.size > TAMANO_MAXIMO) {
      limpiarSeleccion()
      setError('La imagen supera el máximo permitido de 2 MB.')
      return
    }

    setArchivo(elegido)
  }

  const handleGuardar = async () => {
    if (!archivo) return

    setSubiendo(true)
    setError(null)
    setMensaje(null)

    try {
      const { foto: fotoNueva } = await subirFotoPerfil(archivo)
      onFotoActualizada(fotoNueva)
      limpiarSeleccion()
      setMensaje('Foto de perfil actualizada.')
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo subir la foto.')
    } finally {
      setSubiendo(false)
    }
  }

  const handleCancelar = () => {
    limpiarSeleccion()
    setError(null)
  }

  return (
    <div className="h-fit rounded-md bg-white p-6 text-center shadow-sm">
      <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-verde-oscuro">
        {mostrarImagen ? (
          <img
            src={urlActual}
            alt="Foto de perfil"
            onError={() => setUrlRota(urlActual)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label="Avatar predeterminado"
            className="flex h-full w-full items-center justify-center font-serif text-4xl text-crema"
          >
            {iniciales}
          </div>
        )}
      </div>

      <h2 className="mt-4 font-serif text-lg text-verde-oscuro">Foto de perfil</h2>
      <p className="mt-1 text-xs text-texto/60">JPG, PNG o WEBP. Máximo 2 MB.</p>

      {error && (
        <p role="alert" className="mt-3 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {mensaje && (
        <p role="status" className="mt-3 rounded-sm bg-verde-oscuro/10 px-3 py-2 text-sm text-verde-oscuro">
          {mensaje}
        </p>
      )}

      <input
        ref={inputRef}
        id="foto-perfil"
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleSeleccion}
        aria-label="Elegir una nueva foto de perfil"
        className="mt-4 block w-full text-left text-sm text-texto/80 file:mr-3 file:rounded-sm file:border-0 file:bg-verde-oscuro/10 file:px-3 file:py-1.5 file:text-sm file:text-verde-oscuro"
      />

      {archivo && (
        <div className="mt-3 flex justify-center gap-2">
          <button
            type="button"
            onClick={handleGuardar}
            disabled={subiendo}
            className="rounded-sm bg-verde-oscuro px-4 py-2 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
          >
            {subiendo ? 'Subiendo...' : 'Guardar foto'}
          </button>
          <button
            type="button"
            onClick={handleCancelar}
            disabled={subiendo}
            className="rounded-sm border border-verde-oscuro/30 px-4 py-2 text-sm text-verde-oscuro transition hover:bg-verde-oscuro/5 disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}

export default FotoPerfil
