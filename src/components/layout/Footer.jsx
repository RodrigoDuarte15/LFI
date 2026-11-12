import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-verde-oscuro py-9 text-sm text-crema/65">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-4 sm:flex-row">
        <div className="text-center sm:text-left">
          <Link to="/" className="font-serif text-xl text-crema">La Finca</Link>
          <p className="mt-1">Encontrá tu próximo lugar.</p>
        </div>
        <nav aria-label="Navegación del pie" className="flex gap-5">
          <Link to="/" className="hover:text-crema">Inicio</Link>
          <Link to="/catalogo" className="hover:text-crema">Catálogo</Link>
          <Link to="/login" className="hover:text-crema">Ingresar</Link>
        </nav>
        <p>© {new Date().getFullYear()} La Finca</p>
      </div>
    </footer>
  )
}

export default Footer
