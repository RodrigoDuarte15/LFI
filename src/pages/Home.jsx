import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getInmuebles } from '../services/inmuebleService'
import InmuebleCard from '../components/inmuebles/InmuebleCard'
import hero from '../assets/hero.png'

function Home() {
  const [inmuebles, setInmuebles] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getInmuebles()
      .then((data) => setInmuebles(data.filter((item) => !item.estado || item.estado === 'disponible').slice(0, 3)))
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [])

  return <div>
    <section className="relative isolate flex min-h-[590px] items-center overflow-hidden bg-cover bg-center text-crema sm:min-h-[660px]" style={{ backgroundImage: `linear-gradient(90deg, rgba(20,38,28,.88), rgba(20,38,28,.5)), url(${hero})` }}>
      <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8">
        <p className="text-sm font-medium uppercase tracking-[.22em] text-dorado">La Finca · Inmobiliaria</p>
        <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">Encontrá tu próximo lugar con La Finca</h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-crema/85 sm:text-lg">Un espacio simple y confiable para descubrir inmuebles, comparar opciones y dar el próximo paso, ya sea para alquilar o comprar.</p>
        <Link to="/catalogo" className="mt-9 inline-flex rounded-sm bg-dorado px-6 py-3 font-medium text-verde-oscuro transition hover:brightness-95">Explorar el catálogo <span aria-hidden="true" className="ml-2">→</span></Link>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-crema/10 to-transparent" />
    </section>

    <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[.8fr_1.2fr] md:items-center md:py-20">
      <div><p className="text-sm font-semibold uppercase tracking-[.16em] text-dorado">Encontrar, consultar, avanzar</p><h2 className="mt-3 font-serif text-3xl leading-tight text-verde-oscuro sm:text-4xl">Tu búsqueda, con claridad desde el primer día.</h2></div>
      <p className="text-base leading-8 text-texto/75">La Finca reúne inmuebles para alquiler y compraventa en un catálogo organizado y fácil de recorrer. Consultá cada propiedad con su información disponible y encontrá opciones que se ajusten a lo que estás buscando.</p>
    </section>

    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-[.16em] text-dorado">Una buena manera de empezar</p><h2 className="mt-2 font-serif text-3xl text-verde-oscuro">Inmuebles destacados</h2></div>
          <Link to="/catalogo" className="text-sm font-medium text-verde hover:text-dorado">Ver todo el catálogo →</Link>
        </div>
        {cargando && <p className="py-8 text-texto/60">Cargando inmuebles...</p>}
        {error && <p role="status" className="rounded-md bg-crema p-5 text-texto/70">No pudimos cargar los inmuebles ahora. Podés probar desde el catálogo.</p>}
        {!cargando && !error && inmuebles.length > 0 && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{inmuebles.map((inmueble) => <InmuebleCard key={inmueble.id_inmueble} inmueble={inmueble} />)}</div>}
        {!cargando && !error && inmuebles.length === 0 && <p className="rounded-md bg-crema p-5 text-texto/70">En este momento no hay inmuebles disponibles para destacar. Visitá el catálogo para consultar todas las opciones.</p>}
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-sm font-semibold uppercase tracking-[.16em] text-dorado">Empezá por lo que buscás</p><h2 className="mt-2 font-serif text-3xl text-verde-oscuro">Accesos rápidos</h2></div><Link to="/catalogo" className="text-sm font-medium text-verde hover:text-dorado">Explorar todas las propiedades →</Link></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        {[['Alquiler', 'Encontrá tu próximo hogar o espacio para trabajar.', 'alquiler'], ['Compraventa', 'Explorá propiedades para dar el siguiente paso.', 'compra']].map(([titulo, texto, operacion]) => <Link key={operacion} to={`/catalogo?operacion=${operacion}`} className="group rounded-md border border-verde-oscuro/10 bg-white p-6 transition hover:border-dorado hover:shadow-sm"><span className="text-sm font-semibold uppercase tracking-wider text-dorado">La Finca</span><h3 className="mt-3 font-serif text-2xl text-verde-oscuro">{titulo}</h3><p className="mt-2 text-sm leading-6 text-texto/65">{texto}</p><span className="mt-5 block text-sm font-medium text-verde group-hover:text-dorado">Ver opciones →</span></Link>)}
      </div>
    </section>

    <section className="bg-verde-oscuro py-14 text-crema sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 md:grid-cols-3">
        {[
          ['Información clara', 'Cada inmueble presenta sus datos disponibles para ayudarte a evaluar tus opciones.'],
          ['Búsqueda ordenada', 'Recorré el catálogo y encontrá propiedades según el tipo de operación.'],
          ['Acompañamiento simple', 'Enviá tu consulta desde la propiedad que te interesa y seguí el proceso con La Finca.'],
        ].map(([titulo, texto], i) => <article key={titulo} className="border-l border-dorado/70 pl-5"><span className="text-xs font-semibold tracking-[.18em] text-dorado">0{i + 1}</span><h3 className="mt-3 font-serif text-xl">{titulo}</h3><p className="mt-2 text-sm leading-6 text-crema/65">{texto}</p></article>)}
      </div>
      <div className="mx-auto mt-10 max-w-6xl px-5 sm:px-8"><Link to="/catalogo" className="inline-flex rounded-sm bg-crema px-5 py-3 text-sm font-medium text-verde-oscuro hover:bg-white">Conocé el catálogo →</Link></div>
    </section>
  </div>
}

export default Home
