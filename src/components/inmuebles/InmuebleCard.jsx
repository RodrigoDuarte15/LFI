import { Link } from 'react-router-dom'
import { getUrlFoto, inmuebleDisponible } from '../../services/inmuebleService'

function InmuebleCard({ inmueble }) {
  const {
    id_inmueble,
    titulo,
    tipo,
    direccion,
    localidad,
    estado,
    precio,
    superficie,
    ambientes,
    dormitorios,
    banios,
    foto,
  } = inmueble

  return (
    <Link
      to={`/inmueble/${id_inmueble}`}
      className="group flex flex-col overflow-hidden rounded-md bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-verde-oscuro/10">
        {foto ? (
          <img
            src={getUrlFoto(foto)}
            alt={titulo}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-verde-oscuro/40">
            Sin foto
          </div>
        )}

        {estado && (
          <span className="absolute left-3 top-3 rounded-full bg-verde-oscuro px-3 py-1 text-xs capitalize text-crema">
            {estado}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {tipo && (
          <span className="w-fit rounded-full border border-verde-oscuro/20 px-2 py-0.5 text-xs capitalize text-verde-oscuro/70">
            {tipo}
          </span>
        )}

        <h3 className="font-serif text-lg text-verde-oscuro">{titulo}</h3>

        <p className="text-sm text-texto/70">
          {direccion}
          {localidad ? `, ${localidad}` : ''}
        </p>

        <p className="mt-auto pt-2 font-serif text-lg text-verde-oscuro">
          {precio ? `$${Number(precio).toLocaleString('es-AR')}` : 'Consultar'}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-verde-oscuro/10 pt-2 text-sm text-texto/70">
          {dormitorios != null && <span>{dormitorios} dorm.</span>}
          {banios != null && <span>{banios} baños</span>}
          {ambientes != null && <span>{ambientes} amb.</span>}
          {superficie != null && <span>{superficie} m²</span>}
        </div>

        {inmuebleDisponible(estado) && (
          <p className="text-sm font-medium text-dorado">Consultar por alquiler o compra →</p>
        )}
      </div>
    </Link>
  )
}

export default InmuebleCard
