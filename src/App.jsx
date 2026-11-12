import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Catalogo from './pages/Catalogo'
import DetalleInmueble from './pages/DetalleInmueble'
import Registro from './pages/Registro'
import Login from './pages/Login'
import PanelSecretario from './pages/panel/PanelSecretario'
import Perfil from './pages/Perfil'
import RutaProtegida from './components/RutaProtegida'

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/inmueble/:id" element={<DetalleInmueble />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/login" element={<Login />} />
          <Route element={<RutaProtegida rolesPermitidos={['cliente', 'secretario']} />}>
            <Route path="/perfil" element={<Perfil />} />
          </Route>

          <Route element={<RutaProtegida rolesPermitidos={['secretario']} />}>
            <Route path="/panel/secretario" element={<PanelSecretario />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
