# Backend API - Inmobiliaria

API REST hecha con **Node.js + Express + MySQL (mysql2)**, siguiendo el mismo patrón
del apunte "Backend y API REST con Node.js y Express": arquitectura de **Rutas → Controladores → Pool de conexión**.

## Estructura

```
backend-api/
├── .env.example
├── package.json
├── server.js
└── src/
    ├── db.js
    ├── controllers/
    │   ├── usuario.controller.js
    │   ├── cliente.controller.js
    │   ├── secretario.controller.js
    │   ├── inmueble.controller.js
    │   ├── alquiler.controller.js
    │   ├── recibo.controller.js
    │   └── movimientoBancario.controller.js
    └── routes/
        ├── usuario.routes.js
        ├── cliente.routes.js
        ├── secretario.routes.js
        ├── inmueble.routes.js
        ├── alquiler.routes.js
        ├── recibo.routes.js
        └── movimientoBancario.routes.js
```

## Paso 1: Instalar dependencias

```bash
cd backend-api
npm install
```

Esto instala `express`, `mysql2`, `cors` y `dotenv`, tal como en el apunte.

## Paso 2: Configurar la base de datos

1. Importá el archivo `inmobiliaria.sql` en tu MySQL (phpMyAdmin, WAMP/XAMPP, etc.).
2. Renombrá `.env.example` a `.env` y ajustá tus credenciales:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=inmobiliaria
DB_PORT=3306
PORT=4000
```

## Paso 3: Ejecutar el servidor

```bash
npm start
```

Deberías ver en consola: `✅ Conexión exitosa a MySQL (inmobiliaria).`

## Endpoints disponibles

Todos siguen el mismo esquema CRUD (GET, GET/:id, POST, PUT/:id, DELETE/:id):

| Recurso              | Prefijo               | Tabla                |
|-----------------------|------------------------|-----------------------|
| Usuarios              | `/api/usuarios`        | `usuario`             |
| Clientes               | `/api/clientes`        | `cliente` (+ JOIN `usuario`) |
| Secretarios           | `/api/secretarios`     | `secretario` (+ JOIN `usuario`) |
| Inmuebles             | `/api/inmuebles`       | `inmueble`             |
| Alquileres             | `/api/alquileres`      | `alquiler` (+ JOIN `inmueble`) |
| Recibos                | `/api/recibos`         | `recibo`               |
| Movimientos bancarios | `/api/movimientos`     | `movimiento_bancario`  |

### Ejemplo (probar con Postman o Insomnia, como en el apunte)

- `GET http://localhost:4000/api/inmuebles` → lista todos los inmuebles.
- `GET http://localhost:4000/api/inmuebles/1` → detalle del inmueble con id 1.
- `POST http://localhost:4000/api/inmuebles` con JSON en el body:

```json
{
  "titulo": "Departamento 2 ambientes",
  "tipo": "departamento",
  "direccion": "San Martín 123",
  "localidad": "Rosario",
  "provincia": "Santa Fe",
  "precio": 150000,
  "ambientes": 2,
  "dormitorios": 1,
  "banios": 1
}
```

- `PUT http://localhost:4000/api/inmuebles/1` → actualiza el inmueble.
- `DELETE http://localhost:4000/api/inmuebles/1` → elimina el inmueble.

Lo mismo aplica para `/api/usuarios`, `/api/clientes`, `/api/secretarios`,
`/api/alquileres`, `/api/recibos` y `/api/movimientos`, cada uno con los
campos propios de su tabla en `inmobiliaria.sql`.

## Siguiente paso

Igual que en el apunte: conectar esta API con el frontend de React usando **Axios**
(instancia con `baseURL: 'http://localhost:4000/api'`) y migrar el Context API
para que consuma estos endpoints en lugar de `localStorage`.
