import { useEffect, useState } from 'react'
import {
  getCuentasBancarias,
  crearCuentaBancaria,
  actualizarCuentaBancaria,
  eliminarCuentaBancaria,
} from '../../services/cuentaBancariaService'

const valoresIniciales = {
  banco: '',
  numero_cuenta: '',
  tipo: '',
  cbu: '',
}

function SeccionCuentasBancarias() {
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [formulario, setFormulario] = useState(valoresIniciales)
  const [editandoId, setEditandoId] = useState(null)
  const [erroresFormulario, setErroresFormulario] = useState({})
  const [enviando, setEnviando] = useState(false)

  const cargarCuentas = () => {
    setCargando(true)
    getCuentasBancarias()
      .then(setCuentas)
      .catch(() => setError('No se pudieron cargar las cuentas bancarias.'))
      .finally(() => setCargando(false))
  }

  useEffect(() => {
    cargarCuentas()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormulario((prev) => ({ ...prev, [name]: value }))
  }

  // Las 4 columnas son NOT NULL en la base, así que las 4 son obligatorias
  // tanto para crear como para editar (el PUT reemplaza las 4 por completo).
  const validar = () => {
    const nuevosErrores = {}

    if (!formulario.banco.trim()) nuevosErrores.banco = 'Ingresá el banco.'
    if (!formulario.numero_cuenta.trim()) nuevosErrores.numero_cuenta = 'Ingresá el número de cuenta.'
    if (!formulario.tipo.trim()) nuevosErrores.tipo = 'Ingresá el tipo de cuenta.'
    if (!formulario.cbu.trim()) nuevosErrores.cbu = 'Ingresá el CBU.'

    setErroresFormulario(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  // El listado ya trae las 4 columnas, no hace falta pedir el detalle.
  const handleEditarClick = (cuenta) => {
    setEditandoId(cuenta.id_cuenta)
    setFormulario({
      banco: cuenta.banco || '',
      numero_cuenta: cuenta.numero_cuenta || '',
      tipo: cuenta.tipo || '',
      cbu: cuenta.cbu || '',
    })
    setErroresFormulario({})
  }

  const handleCancelar = () => {
    setEditandoId(null)
    setFormulario(valoresIniciales)
    setErroresFormulario({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validar()) return

    setEnviando(true)
    try {
      if (editandoId) {
        await actualizarCuentaBancaria(editandoId, formulario)
      } else {
        await crearCuentaBancaria(formulario)
      }
      setFormulario(valoresIniciales)
      setEditandoId(null)
      setErroresFormulario({})
      cargarCuentas()
    } catch (err) {
      setErroresFormulario({
        general: err.response?.data?.message || 'No se pudo guardar la cuenta bancaria.',
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleEliminar = async (id) => {
    const confirmar = window.confirm('¿Seguro que querés eliminar esta cuenta bancaria?')
    if (!confirmar) return

    try {
      await eliminarCuentaBancaria(id)
      cargarCuentas()
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar la cuenta bancaria.')
    }
  }

  return (
    <div className="mt-12">
      <h2 className="font-serif text-2xl text-verde-oscuro">Cuentas Bancarias</h2>
      <p className="mt-1 text-texto/70">
        Cuentas disponibles para asociar a los movimientos bancarios.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 flex flex-col gap-4 rounded-md bg-white p-6 shadow-sm"
      >
        <h3 className="font-serif text-lg text-verde-oscuro">
          {editandoId ? `Editar cuenta #${editandoId}` : 'Nueva cuenta bancaria'}
        </h3>

        {erroresFormulario.general && (
          <p className="rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
            {erroresFormulario.general}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-texto/80" htmlFor="banco">
              Banco
            </label>
            <input
              id="banco"
              name="banco"
              type="text"
              maxLength={100}
              value={formulario.banco}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {erroresFormulario.banco && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.banco}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="numero_cuenta">
              Número de cuenta
            </label>
            <input
              id="numero_cuenta"
              name="numero_cuenta"
              type="text"
              maxLength={30}
              value={formulario.numero_cuenta}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {erroresFormulario.numero_cuenta && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.numero_cuenta}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-texto/80" htmlFor="tipo">
              Tipo de cuenta
            </label>
            <input
              id="tipo"
              name="tipo"
              type="text"
              maxLength={30}
              placeholder="Ej: Caja de ahorro, Cuenta corriente"
              value={formulario.tipo}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {erroresFormulario.tipo && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.tipo}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-texto/80" htmlFor="cbu">
              CBU
            </label>
            <input
              id="cbu"
              name="cbu"
              type="text"
              maxLength={22}
              value={formulario.cbu}
              onChange={handleChange}
              className="mt-1 w-full rounded-sm border border-verde-oscuro/20 px-3 py-2 text-sm outline-none focus:border-dorado"
            />
            {erroresFormulario.cbu && (
              <p className="mt-1 text-xs text-red-700">{erroresFormulario.cbu}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={enviando}
            className="rounded-sm bg-verde-oscuro px-6 py-2.5 text-sm font-medium text-crema transition hover:bg-verde disabled:opacity-60"
          >
            {enviando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Crear cuenta'}
          </button>

          {editandoId && (
            <button
              type="button"
              onClick={handleCancelar}
              className="rounded-sm border border-verde-oscuro/30 px-6 py-2.5 text-sm text-verde-oscuro transition hover:bg-verde-oscuro/5"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mt-8">
        {cargando && <p className="text-texto/60">Cargando...</p>}
        {error && <p className="text-red-700">{error}</p>}

        {!cargando && !error && (
          <div className="overflow-x-auto rounded-md bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-verde-oscuro/5 text-xs uppercase tracking-wide text-verde-oscuro/70">
                <tr>
                  <th className="px-4 py-3">Banco</th>
                  <th className="px-4 py-3">Número de cuenta</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">CBU</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cuentas.map((cuenta) => (
                  <tr key={cuenta.id_cuenta} className="border-t border-verde-oscuro/10">
                    <td className="px-4 py-3">{cuenta.banco}</td>
                    <td className="px-4 py-3">{cuenta.numero_cuenta}</td>
                    <td className="px-4 py-3 capitalize">{cuenta.tipo}</td>
                    <td className="px-4 py-3">{cuenta.cbu}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditarClick(cuenta)}
                          className="text-dorado hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminar(cuenta.id_cuenta)}
                          className="text-red-700 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {cuentas.length === 0 && (
              <p className="px-4 py-6 text-center text-texto/60">
                Todavía no hay cuentas bancarias cargadas.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SeccionCuentasBancarias
