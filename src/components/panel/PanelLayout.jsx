// Estructura visual del panel del secretario: título, menú de secciones y el
// área donde se muestra la sección elegida. El menú es lateral desde pantallas
// medianas y una fila desplazable en celulares. No conoce el contenido de cada
// sección: solo recibe la lista de secciones y cuál está activa.
function PanelLayout({ titulo, secciones, seccionActiva, onSeleccionar, children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-serif text-3xl text-verde-oscuro">{titulo}</h1>

      <div className="mt-6 md:flex md:items-start md:gap-8">
        <nav
          aria-label="Secciones del panel"
          className="md:sticky md:top-4 md:w-60 md:shrink-0 md:rounded-md md:bg-white md:p-2 md:shadow-sm"
        >
          <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:p-0">
            {secciones.map((seccion) => {
              const activa = seccion.id === seccionActiva

              return (
                <li key={seccion.id} className="shrink-0 md:shrink">
                  <button
                    type="button"
                    onClick={() => onSeleccionar(seccion.id)}
                    aria-current={activa ? 'page' : undefined}
                    className={`w-full whitespace-nowrap rounded-sm border border-verde-oscuro/20 px-4 py-2 text-left text-sm transition md:border-0 md:border-l-4 ${
                      activa
                        ? 'border-verde-oscuro bg-verde-oscuro font-medium text-crema md:border-dorado'
                        : 'bg-white text-texto/80 hover:bg-verde-oscuro/10 md:border-transparent md:bg-transparent'
                    }`}
                  >
                    {seccion.etiqueta}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* [&>*:first-child]:mt-0 anula el margen superior que traen las secciones
            (pensado para cuando estaban apiladas), así quedan alineadas con el menú. */}
        <section className="mt-6 min-w-0 flex-1 md:mt-0 [&>*:first-child]:mt-0">
          {children}
        </section>
      </div>
    </div>
  )
}

export default PanelLayout
