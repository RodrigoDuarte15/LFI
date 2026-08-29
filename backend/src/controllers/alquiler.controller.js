// backend-api/src/controllers/alquiler.controller.js

import pool from '../db.js';

// GET /api/alquileres - Obtener todos (READ), con JOIN para traer datos del inmueble
export const getAlquileres = async (req, res) => {
    try {
        const query = `
            SELECT
                a.id_alquiler,
                a.fecha_inicio,
                a.fecha_fin,
                a.monto,
                a.estado,
                a.cliente_id,
                a.inmueble_id,
                i.titulo AS inmuebleTitulo,
                i.direccion AS inmuebleDireccion
            FROM alquiler a
            JOIN inmueble i ON a.inmueble_id = i.id_inmueble
            ORDER BY a.fecha_inicio DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener alquileres:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET).' });
    }
};

// GET /api/alquileres/:id - Obtener uno (READ Detail)
export const getAlquilerById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM alquiler WHERE id_alquiler = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Alquiler no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener alquiler:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET by id).' });
    }
};

// POST /api/alquileres - Crear un nuevo alquiler (CREATE)
export const createAlquiler = async (req, res) => {
    const { fecha_inicio, fecha_fin, monto, estado, cliente_id, inmueble_id } = req.body;

    if (!fecha_inicio || !monto || !cliente_id || !inmueble_id) {
        return res.status(400).json({ message: 'Faltan datos requeridos (fecha_inicio, monto, cliente_id, inmueble_id).' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO alquiler (fecha_inicio, fecha_fin, monto, estado, cliente_id, inmueble_id) VALUES (?, ?, ?, ?, ?, ?)',
            [fecha_inicio, fecha_fin || null, monto, estado || 'activo', cliente_id, inmueble_id]
        );

        res.status(201).json({
            id: result.insertId,
            fecha_inicio,
            fecha_fin,
            monto,
            estado: estado || 'activo',
            cliente_id,
            inmueble_id
        });
    } catch (error) {
        console.error('Error al crear alquiler:', error);
        res.status(500).json({ message: 'Error interno al crear el alquiler.' });
    }
};

// PUT /api/alquileres/:id - Actualizar un alquiler (UPDATE)
export const updateAlquiler = async (req, res) => {
    const { id } = req.params;
    const { fecha_inicio, fecha_fin, monto, estado } = req.body;

    if (!fecha_inicio || !monto) {
        return res.status(400).json({ message: 'Faltan datos requeridos para actualizar.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE alquiler SET fecha_inicio = ?, fecha_fin = ?, monto = ?, estado = ? WHERE id_alquiler = ?',
            [fecha_inicio, fecha_fin || null, monto, estado || 'activo', id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Alquiler no encontrado para actualizar.' });
        }

        res.json({ id: Number(id), fecha_inicio, fecha_fin, monto, estado, message: 'Alquiler actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar alquiler:', error);
        res.status(500).json({ message: 'Error interno al actualizar el alquiler.' });
    }
};

// DELETE /api/alquileres/:id - Eliminar un alquiler (DELETE)
export const deleteAlquiler = async (req, res) => {
    const { id } = req.params;

    try {
        // En un sistema real, primero revisaríamos si tiene recibos asociados (relaciones)
        const [result] = await pool.query('DELETE FROM alquiler WHERE id_alquiler = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Alquiler no encontrado para eliminar.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar alquiler:', error);
        res.status(500).json({ message: 'Error interno al eliminar el alquiler.' });
    }
};
