// backend-api/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importamos las rutas
import usuarioRoutes from './src/routes/usuario.routes.js';
import clienteRoutes from './src/routes/cliente.routes.js';
import secretarioRoutes from './src/routes/secretario.routes.js';
import inmuebleRoutes from './src/routes/inmueble.routes.js';
import alquilerRoutes from './src/routes/alquiler.routes.js';
import reciboRoutes from './src/routes/recibo.routes.js';
import movimientoRoutes from './src/routes/movimientoBancario.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // El puerto 4000 es común para APIs

// Middlewares
app.use(cors()); // Permite peticiones desde el frontend de React (puerto 5173/3000)
app.use(express.json()); // Permite a Express leer JSON en el body de las peticiones

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de Inmobiliaria Funcionando!');
});

// Rutas de la API, cada una con su prefijo
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/secretarios', secretarioRoutes);
app.use('/api/inmuebles', inmuebleRoutes);
app.use('/api/alquileres', alquilerRoutes);
app.use('/api/recibos', reciboRoutes);
app.use('/api/movimientos', movimientoRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});
