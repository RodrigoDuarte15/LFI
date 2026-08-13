// backend-api/src/db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Carga las variables de entorno del archivo .env
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función de prueba para verificar la conexión
async function testConnection() {
    try {
        await pool.getConnection();
        console.log('✅ Conexión exitosa a MySQL (inmobiliaria).');
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error.message);
        // Si la base de datos no está levantada o las credenciales fallan, salimos.
        process.exit(1);
    }
}

testConnection();

export default pool;
