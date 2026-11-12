import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { crearSolicitud } from '../../services/solicitudService'
import { inmuebleDisponible } from '../../services/inmuebleService'

const LARGO_MAXIMO_MENSAJE = 500

// Bloque "Consultar por este inmueble" del detalle. Solo manifiesta interés: no hay
// carrito ni pago. Para identificarse hace falta una cuenta (así queda asociada a una
// persona con DNI y mayor de edad, como pide la consigna).
function ConsultaInmueble({ inmueble }) {
  const { usuarioActual } = useAuth()

  const [tipo, setTipo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)

  const contenedor = 'mt-6 border-t border-verde-oscuro/10 pt-6'

  if (!inmuebleDisponible(inmueble.estado)) {
    return (
      <div className={contenedor}>
        <p className="text-sm text-texto/70">Este inmueble no está disponible por el momento.</p>
      </div>
    )
  }

  if (!usuarioActual) {
    return (
      <div className={contenedor}>
        <h2 className="font-serif text-lg text-verde-oscuro">¿Te interesa esta propiedad?</h2>
        <p className="mt-2 text-sm text-texto/70">
          Para consultar por alquiler o compra necesitás una cuenta: así podemos identificarte.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            to="/login"
            className="rounded-sm bg-verde-oscuro px-4 py-2 text-sm font-medium text-crema transition hover:bg-verde"
          >
            Ingresar
          </Link>
          <Link
            to="/registro"
            className="rounded-sm border border-verde-oscuro/30 px-4 py-2 text-sm text-verde-oscuro transition hover:bg-verde-oscuro/5"
          >
            Registrarme
          </Link>
        </div>
      </div>
    )
  }

  if (usuarioActual.rol !== 'cliente') {
    return (
      <div className={contenedor}>
        <p className="text-sm text-texto/70">
          Las consultas las realizan los clientes desde su cuenta. Las gestionás desde el panel.
        </p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setExito(null)

    if (!tipo) {
      setError('Elegí si querés alquilar o comprar.')
      return
    }

    setError(null)
    setEnviando(true)
    try {
      const respuesta = await crearSolicitud({ inmueble_id: inmueble.id_inmueble, tipo, mensaje })
      setExito(respuesta.message || 'Consulta enviada.')
      setTipo('')
      setMensaje('')
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar la consulta.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={contenedor}>
      <h2 className="font-serif text-lg text-verde-oscuro">Consultar por este inmueble</h2>

      {exito && (
        <p role="status" className="mt-3 rounded-sm bg-verde-oscuro/10 px-3 py-2 text-sm text-verde-oscuro">
          {exito}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <fieldset className="mt-4">
        <legend className="text-sm text-texto/80">Quiero consultar por</legend>
        <div className="mt-2 flex gap-4 text-sm text-texto/80">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tipo_consulta"
              value="alquiler"
              checked={tipo === 'alquiler'}
              onChange={(e) => setTipo(e.target.value)}
            />
            Alquiler
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tipo_consulta"
              value="compra"
              checked={tipo === 'compra'}
              onChange={(e) => setTipo(e.target.value)}
            />
            Compra
          </label>
        </div>
      </fieldset>

      <div className="mt-4">
        <label className="text-sm text-texto/80" htmlFor="consulta-mensaje">
          Mensaje <span className="text-texto/40">(opcional)</span>
        </label>
        <textarea
          id="consulta-mensaje"
          rows={3}
          maxLength={LARGO_MAXIMO_MENSAJE}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
        />
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="mt-4 w-full rounded-sm bg-verde-oscuro px-4 py-2.5 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
      >
        {enviando ? 'Enviando...' : 'Enviar consulta'}
      </button>
    </form>
  )
}

export default ConsultaInmueble
