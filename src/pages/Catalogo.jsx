import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getInmuebles, getOpcionesCatalogo } from '../services/inmuebleService'
import InmuebleCard from '../components/inmuebles/InmuebleCard'

const FILTROS_VACIOS = { q: '', tipo: '', operacion: '', localidad: '', provincia: '', precioMin: '', precioMax: '', estado: '' }
const ESTADOS = [
  ['disponible', 'Disponible'],
  ['alquilado', 'Alquilado'],
  ['vendido', 'Vendido'],
]

function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtros, setFiltros] = useState(() => ({
    ...FILTROS_VACIOS,
    q: searchParams.get('q') || '',
    operacion: searchParams.get('operacion') || '',
  }))
  const [inmuebles, setInmuebles] = useState([])
  const [opciones, setOpciones] = useState({ tipos: [], provincias: [], localidades: [] })
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [errorPrecio, setErrorPrecio] = useState('')

  useEffect(() => {
    let vigente = true
    getOpcionesCatalogo(filtros.provincia)
      .then((datos) => { if (vigente) setOpciones(datos) })
      .catch(() => { if (vigente) setOpciones({ tipos: [], provincias: [], localidades: [] }) })
    return () => { vigente = false }
  }, [filtros.provincia])

  useEffect(() => {
    let vigente = true
    setCargando(true)
    getInmuebles({ publico: true, q: filtros.q || undefined, tipo: filtros.tipo || undefined,
      operacion: filtros.operacion || undefined, localidad: filtros.localidad || undefined,
      provincia: filtros.provincia || undefined, precioMin: filtros.precioMin || undefined,
      precioMax: filtros.precioMax || undefined, estado: filtros.estado || undefined })
      .then((datos) => { if (vigente) { setInmuebles(datos); setError('') } })
      .catch(() => { if (vigente) setError('No se pudieron cargar los inmuebles. Probá nuevamente.') })
      .finally(() => { if (vigente) setCargando(false) })
    return () => { vigente = false }
  }, [])

  const actualizar = (evento) => {
    const { name, value } = evento.target
    setFiltros((actuales) => ({ ...actuales, [name]: value, ...(name === 'provincia' ? { localidad: '' } : {}) }))
  }

  const buscar = async (evento) => {
    evento.preventDefault()
    setErrorPrecio('')
    if (filtros.precioMin && filtros.precioMax && Number(filtros.precioMin) > Number(filtros.precioMax)) {
      setErrorPrecio('El precio mínimo no puede superar al máximo.')
      return
    }
    setCargando(true)
    setError('')
    const parametros = Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor !== ''))
    setSearchParams(parametros)
    try {
      const resultados = await getInmuebles({ publico: true, ...parametros })
      setInmuebles(resultados)
    } catch {
      setError('No se pudieron cargar los inmuebles. Probá nuevamente.')
    } finally {
      setCargando(false)
    }
  }

  const limpiar = async () => {
    setFiltros(FILTROS_VACIOS)
    setSearchParams({})
    setErrorPrecio('')
    setError('')
    setCargando(true)
    try { setInmuebles(await getInmuebles({ publico: true })) }
    catch { setError('No se pudieron cargar los inmuebles. Probá nuevamente.') }
    finally { setCargando(false) }
  }

  const filtrosActivos = useMemo(() => Object.entries(filtros)
    .filter(([, valor]) => valor !== '')
    .map(([clave, valor]) => `${{ q: 'Búsqueda', tipo: 'Tipo', operacion: 'Operación', localidad: 'Localidad', provincia: 'Provincia', precioMin: 'Desde', precioMax: 'Hasta', estado: 'Estado' }[clave]}: ${clave === 'operacion' ? (valor === 'alquiler' ? 'Alquiler' : 'Venta') : valor}`), [filtros])

  const campo = 'mt-1 w-full rounded-sm border border-verde-oscuro/15 bg-white px-3 py-2.5 text-sm text-texto outline-none transition focus:border-dorado focus:ring-2 focus:ring-dorado/20'

  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
    <div className="mb-7">
      <p className="text-sm font-semibold uppercase tracking-[.16em] text-dorado">La Finca</p>
      <h1 className="mt-2 font-serif text-3xl text-verde-oscuro sm:text-4xl">Catálogo de inmuebles</h1>
      <p className="mt-2 text-sm text-texto/65">Buscá y combiná filtros para encontrar una propiedad.</p>
    </div>

    <form onSubmit={buscar} className="rounded-md border border-verde-oscuro/10 bg-white p-4 shadow-sm sm:p-6">
      <label htmlFor="busqueda" className="text-sm font-medium text-verde-oscuro">Buscar por ubicación</label>
      <div className="mt-2 flex gap-2">
        <input id="busqueda" name="q" type="search" value={filtros.q} onChange={actualizar} placeholder="Dirección, localidad o provincia" className={`${campo} mt-0 min-w-0 flex-1`} />
        <button type="submit" className="shrink-0 rounded-sm bg-verde-oscuro px-4 py-2 text-sm font-medium text-crema transition hover:bg-verde" aria-label="Buscar inmuebles"><span aria-hidden="true">⌕</span><span className="ml-2 hidden sm:inline">Buscar</span></button>
      </div>

      <details className="mt-5 group" open>
        <summary className="cursor-pointer list-none text-sm font-semibold text-verde-oscuro marker:hidden">Filtros <span className="ml-1 text-dorado group-open:hidden">＋</span><span className="ml-1 text-dorado hidden group-open:inline">−</span></summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm text-texto/80">Tipo de inmueble
            <select name="tipo" value={filtros.tipo} onChange={actualizar} className={campo}><option value="">Todos los tipos</option>{opciones.tipos.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}</select>
          </label>
          <label className="text-sm text-texto/80">Operación
            <select name="operacion" value={filtros.operacion} onChange={actualizar} className={campo}><option value="">Alquiler o venta</option><option value="alquiler">Alquiler</option><option value="compra">Venta</option></select>
          </label>
          <label className="text-sm text-texto/80">Provincia
            <select name="provincia" value={filtros.provincia} onChange={actualizar} className={campo}><option value="">Todas las provincias</option>{opciones.provincias.map((provincia) => <option key={provincia} value={provincia}>{provincia}</option>)}</select>
          </label>
          <label className="text-sm text-texto/80">Localidad
            <select name="localidad" value={filtros.localidad} onChange={actualizar} className={campo}><option value="">Todas las localidades</option>{opciones.localidades.map((localidad) => <option key={localidad} value={localidad}>{localidad}</option>)}</select>
          </label>
          <label className="text-sm text-texto/80">Precio mínimo
            <input name="precioMin" type="number" min="0" step="any" inputMode="decimal" value={filtros.precioMin} onChange={actualizar} placeholder="$ Desde" className={campo} />
          </label>
          <label className="text-sm text-texto/80">Precio máximo
            <input name="precioMax" type="number" min="0" step="any" inputMode="decimal" value={filtros.precioMax} onChange={actualizar} placeholder="$ Hasta" className={campo} />
          </label>
          <label className="text-sm text-texto/80">Disponibilidad
            <select name="estado" value={filtros.estado} onChange={actualizar} className={campo}><option value="">Todos los estados</option>{ESTADOS.map(([valor, etiqueta]) => <option key={valor} value={valor}>{etiqueta}</option>)}</select>
          </label>
        </div>
        {errorPrecio && <p role="alert" className="mt-3 text-sm text-red-700">{errorPrecio}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" className="rounded-sm bg-dorado px-5 py-2.5 text-sm font-semibold text-verde-oscuro transition hover:brightness-95">Aplicar filtros</button>
          <button type="button" onClick={limpiar} className="rounded-sm border border-verde-oscuro/20 px-5 py-2.5 text-sm font-medium text-verde-oscuro transition hover:bg-verde-oscuro/5">Limpiar filtros</button>
        </div>
      </details>
    </form>

    <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" className="text-sm text-texto/65">{cargando ? 'Buscando inmuebles...' : `${inmuebles.length} ${inmuebles.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}`}</p>
      {filtrosActivos.length > 0 && <div className="flex flex-wrap gap-2" aria-label="Filtros activos">{filtrosActivos.map((filtro) => <span key={filtro} className="rounded-full bg-verde-oscuro/5 px-3 py-1 text-xs text-verde-oscuro">{filtro}</span>)}</div>}
    </div>

    {error && <p role="alert" className="mt-5 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!cargando && !error && inmuebles.length > 0 && <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{inmuebles.map((inmueble) => <InmuebleCard key={inmueble.id_inmueble} inmueble={inmueble} />)}</div>}
    {!cargando && !error && inmuebles.length === 0 && <div className="mt-6 rounded-md border border-verde-oscuro/10 bg-white px-5 py-10 text-center"><h2 className="font-serif text-xl text-verde-oscuro">No encontramos inmuebles con esos criterios</h2><p className="mt-2 text-sm text-texto/65">Probá cambiar la búsqueda o quitar alguno de los filtros.</p><button type="button" onClick={limpiar} className="mt-5 rounded-sm bg-verde-oscuro px-5 py-2.5 text-sm font-medium text-crema hover:bg-verde">Limpiar filtros</button></div>}
  </div>
}

export default Catalogo
