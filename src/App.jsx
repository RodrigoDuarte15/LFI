import { Routes, Route, Navigate } from 'react-router-dom'
import Navegacion from './components/Navegacion'
import Login from './components/Login'
import Vistainmuebles from './components/Vistainmuebles'
import Vistaalquileres from './components/Vistaalquileres'
import Vistaclientes from './components/Vistaclientes'
import Vistarecibos from './components/Vistarecibos'
import Vistamovimientos from './components/Vistamovimientos'
import Vistadashboard from './components/Vistadashboard'
import Vistaconfiguracion from './components/Vistaconfiguracion'

function App() {
  return (
    <div>
      <Navegacion />
      <Routes>
        <Route path="/" element={<Navigate to="/inmuebles" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inmuebles" element={<Vistainmuebles />} />
        <Route path="/alquileres" element={<Vistaalquileres />} />
        <Route path="/clientes" element={<Vistaclientes />} />
        <Route path="/recibos" element={<Vistarecibos />} />
        <Route path="/movimientos" element={<Vistamovimientos />} />
        <Route path="/dashboard" element={<Vistadashboard />} />
        <Route path="/configuracion" element={<Vistaconfiguracion />} />
      </Routes>
    </div>
  )
}

export default App