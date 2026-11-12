import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getInmuebleById, getUrlFoto } from '../services/inmuebleService'
import ConsultaInmueble from '../components/solicitudes/ConsultaInmueble'

function DetalleInmueble() {
  const { id } = useParams()
  const [inmueble, setInmueble] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setCargando(true)
    setError(null)

    getInmuebleById(id)
      .then(setInmueble)
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('No encontramos este inmueble.')
        } else {
          setError('No se pudo cargar el inmueble.')
        }
      })
      .finally(() => setCargando(false))
  }, [id])

  if (cargando) {
    return (
      <p className="mx-auto max-w-4xl px-4 py-12 text-texto/60">Cargando...</p>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-red-700">{error}</p>
        <Link to="/catalogo" className="mt-4 inline-block text-dorado hover:underline">
          Volver al catálogo
        </Link>
      </div>
    )
  }

  const {
    titulo,
    tipo,
    direccion,
    localidad,
    provincia,
    estado,
    precio,
    descripcion,
    superficie,
    ambientes,
    dormitorios,
    banios,
    foto,
  } = inmueble

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link to="/catalogo" className="text-sm text-dorado hover:underline">
        ← Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-video w-full overflow-hidden rounded-md bg-verde-oscuro/10">
            {foto ? (
              <img src={getUrlFoto(foto)} alt={titulo} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-texto/40">
                Sin foto
              </div>
            )}
          </div>

          <div className="mt-6">
            {tipo && (
              <span className="rounded-full border border-verde-oscuro/20 px-2 py-0.5 text-xs capitalize text-verde-oscuro/70">
                {tipo}
              </span>
            )}
            <h1 className="mt-2 font-serif text-3xl text-verde-oscuro">{titulo}</h1>
            <p className="mt-1 text-texto/70">
              {direccion}
              {localidad ? `, ${localidad}` : ''}
              {provincia ? `, ${provincia}` : ''}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-verde-oscuro/10 py-4 text-sm text-texto/70 sm:grid-cols-4">
            {dormitorios != null && <span>{dormitorios} dormitorios</span>}
            {banios != null && <span>{banios} baños</span>}
            {ambientes != null && <span>{ambientes} ambientes</span>}
            {superficie != null && <span>{superficie} m²</span>}
          </div>

          {descripcion && (
            <div className="mt-6">
              <h2 className="font-serif text-xl text-verde-oscuro">Descripción</h2>
              <p className="mt-2 leading-relaxed text-texto/80">{descripcion}</p>
            </div>
          )}

          {/* Texto genérico de la agencia, no proviene de un campo del inmueble */}
          <div className="mt-6 rounded-md border border-verde-oscuro/15 bg-verde-oscuro/5 p-5">
            <h2 className="font-serif text-lg text-verde-oscuro">
              Requisitos para alquilar
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-texto/80">
              <li>1. Documento de identidad vigente.</li>
              <li>2. Últimos recibos de sueldo o certificación de ingresos.</li>
              <li>3. Garantía propietaria o seguro de caución.</li>
              <li>4. Depósito equivalente a un mes de alquiler.</li>
            </ul>
          </div>

          {/* Placeholder visual: todavía no hay integración real con un mapa */}
          <div className="mt-6">
            <h2 className="font-serif text-lg text-verde-oscuro">Ubicación</h2>
            <div className="mt-3 flex h-40 items-center justify-center rounded-md border border-dashed border-verde-oscuro/20 bg-verde-oscuro/5 text-sm text-texto/60">
              {direccion}
              {localidad ? `, ${localidad}` : ''} (mapa no disponible todavía)
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-md bg-white p-6 shadow-sm">
          {estado && (
            <span className="rounded-full bg-verde-oscuro/10 px-3 py-1 text-sm capitalize text-verde-oscuro">
              {estado}
            </span>
          )}
          <p className="mt-3 font-serif text-2xl text-verde-oscuro">
            {precio ? `$${Number(precio).toLocaleString('es-AR')}` : 'Consultar'}
          </p>
          <p className="mt-1 text-xs text-texto/50">Precio informado por la inmobiliaria</p>

          <ConsultaInmueble inmueble={inmueble} />
        </aside>
      </div>
    </div>
  )
}

export default DetalleInmueble
