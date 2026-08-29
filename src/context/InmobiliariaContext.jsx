import { createContext, useState } from 'react'

export const InmobiliariaContext = createContext()

export function InmobiliariaProvider({ children }) {
  const [inmuebles, setInmuebles] = useState([
    { id: 1, direccion: 'Av. Libertador 1200', tipo: 'Departamento', precio: 450000, estado: 'Disponible' },
    { id: 2, direccion: 'Calle San Martín 450', tipo: 'Casa', precio: 680000, estado: 'Alquilado' }
  ])

  const [clientes, setClientes] = useState([
    { id: 1, nombre: 'Juan Pérez', tipo: 'Inquilino', telefono: '1122334455', email: 'juan@email.com' },
    { id: 2, nombre: 'María Gómez', tipo: 'Propietario', telefono: '1199887766', email: 'maria@email.com' }
  ])

  const [alquileres, setAlquileres] = useState([
    { id: 1, inmueble: 'Calle San Martín 450', inquilino: 'Juan Pérez', monto: 680000, vencimiento: '10/09/2026', estado: 'Al día' }
  ])

  const [recibos, setRecibos] = useState([
    { id: 1, numero: 'REC-001', cliente: 'Juan Pérez', concepto: 'Alquiler Septiembre', monto: 680000, fecha: '01/09/2026' }
  ])

  const [movimientos, setMovimientos] = useState([
    { id: 1, fecha: '01/09/2026', tipo: 'Ingreso', concepto: 'Cobro Alquiler REC-001', monto: 680000 },
    { id: 2, fecha: '02/09/2026', tipo: 'Egreso', concepto: 'Mantenimiento Plomería', monto: 45000 }
  ])

  return (
    <InmobiliariaContext.Provider value={{
      inmuebles, setInmuebles,
      clientes, setClientes,
      alquileres, setAlquileres,
      recibos, setRecibos,
      movimientos, setMovimientos
    }}>
      {children}
    </InmobiliariaContext.Provider>
  )
}