import { useEffect, useState } from 'react'
import useAuth from '../../hooks/useAuth'
import { getDashboard } from '../../services/dashboardService'

const moneda = (valor) => `$${Number(valor).toLocaleString('es-AR')}`

function InicioPanel({ secciones, onSeleccionar }) {
  const { usuarioActual } = useAuth()
  const [resumen, setResumen] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard().then(setResumen).catch(() => setError('No se pudo cargar el resumen.'))
  }, [])

  const tarjetas = resumen ? [
    ['Inmuebles', resumen.estadisticas.inmuebles, 'registrados'],
    ['Disponibles', resumen.estadisticas.disponibles, 'para nuevas consultas'],
    ['Alquilados', resumen.estadisticas.alquilados, 'según estado del inmueble'],
    ['Vendidos', resumen.estadisticas.vendidos, 'según estado del inmueble'],
    ['Alquileres activos', resumen.estadisticas.alquileresActivos, 'contratos activos'],
    ['Clientes', resumen.estadisticas.clientes, 'registrados'],
    ['Solicitudes pendientes', resumen.estadisticas.solicitudesPendientes, 'requieren seguimiento'],
  ] : []

  return (
    <div>
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-dorado">Resumen general</p>
      <h2 className="mt-2 font-serif text-3xl text-verde-oscuro">
        {usuarioActual?.nombre ? `Hola, ${usuarioActual.nombre}` : 'Bienvenido'}
      </h2>
      <p className="mt-2 text-texto/70">La actividad de La Finca, en un solo lugar.</p>

      {error && <p role="alert" className="mt-6 rounded bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {!resumen && !error && <p className="mt-6 text-sm text-texto/60">Cargando resumen...</p>}

      {resumen && <>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tarjetas.map(([titulo, valor, nota]) => <article key={titulo} className="rounded-md border border-verde-oscuro/10 bg-white p-5 shadow-sm">
            <p className="text-sm text-texto/65">{titulo}</p>
            <p className="mt-2 font-serif text-3xl text-verde-oscuro">{Number(valor).toLocaleString('es-AR')}</p>
            <p className="mt-1 text-xs text-texto/55">{nota}</p>
          </article>)}
        </div>

        <section className="mt-6 rounded-md bg-white p-5 shadow-sm sm:p-6">
          <h3 className="font-serif text-xl text-verde-oscuro">Finanzas del mes</h3>
          <p className="mt-1 text-sm text-texto/60">Movimientos bancarios registrados en el mes actual</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Ingresos', moneda(resumen.estadisticas.ingresosMes)], ['Egresos', moneda(resumen.estadisticas.egresosMes)],
              ['Recibos pendientes', resumen.estadisticas.recibosPendientes], ['Recibos pagados', resumen.estadisticas.recibosPagados],
            ].map(([label, valor]) => <div key={label} className="border-l-2 border-dorado pl-3"><p className="text-sm text-texto/60">{label}</p><p className="mt-1 text-xl font-semibold text-verde-oscuro">{valor}</p></div>)}
          </div>
        </section>

        <section className="mt-6 rounded-md bg-white p-5 shadow-sm sm:p-6">
          <h3 className="font-serif text-xl text-verde-oscuro">Actividad reciente</h3>
          <div className="mt-4 grid gap-6 lg:grid-cols-3">
            {[
              ['Solicitudes', resumen.actividad.solicitudes.map((x) => ({ id: x.id_solicitud, fecha: x.fecha, titulo: x.inmueble, detalle: `${x.tipo} · ${x.estado}` }))],
              ['Alquileres', resumen.actividad.alquileres.map((x) => ({ id: x.id_alquiler, fecha: x.fecha, titulo: x.inmueble, detalle: `${x.estado} · ${moneda(x.monto)}` }))],
              ['Movimientos', resumen.actividad.movimientos.map((x) => ({ id: x.id_movimiento, fecha: x.fecha, titulo: x.inmueble, detalle: `${x.tipo} · ${moneda(x.monto)}` }))],
            ].map(([titulo, items]) => <div key={titulo}>
              <h4 className="text-sm font-semibold text-verde-oscuro">{titulo}</h4>
              {items.length ? <ul className="mt-2 divide-y divide-verde-oscuro/10">{items.map((x) => <li key={x.id} className="py-2"><p className="text-sm text-texto">{x.titulo}</p><p className="text-xs text-texto/55">{x.fecha} · {x.detalle}</p></li>)}</ul> : <p className="mt-2 text-sm text-texto/55">Sin actividad registrada.</p>}
            </div>)}
          </div>
        </section>
      </>}

      <section className="mt-8">
        <h3 className="font-serif text-xl text-verde-oscuro">Accesos de gestión</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {secciones.filter((seccion) => seccion.id !== 'inicio').map((seccion) => <li key={seccion.id}>
            <button type="button" onClick={() => onSeleccionar(seccion.id)} className="w-full rounded-md border border-verde-oscuro/10 bg-white p-4 text-left shadow-sm transition hover:border-dorado">
              <span className="font-serif text-lg text-verde-oscuro">{seccion.etiqueta}</span>
              <span className="mt-1 block text-sm text-texto/65">{seccion.descripcion}</span>
            </button>
          </li>)}
        </ul>
      </section>
    </div>
  )
}

export default InicioPanel
