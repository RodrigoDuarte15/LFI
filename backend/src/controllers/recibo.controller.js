// backend-api/src/controllers/recibo.controller.js

import pool from '../db.js';

// GET /api/recibos - Obtener todos (READ)
export const getRecibos = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id_recibo, fecha_emision, periodo, monto_base, luz, agua, expensas, tasas, iva,
                    total, estado, alquiler_id, cliente_id
             FROM recibo
             ORDER BY fecha_emision DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener recibos:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET).' });
    }
};

// GET /api/recibos/:id - Obtener uno (READ Detail)
export const getReciboById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM recibo WHERE id_recibo = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Recibo no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener recibo:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET by id).' });
    }
};

// POST /api/recibos - Crear un nuevo recibo (CREATE)
export const createRecibo = async (req, res) => {
    const {
        fecha_emision, periodo, monto_base, luz, agua, expensas, tasas, iva,
        total, estado, alquiler_id, cliente_id
    } = req.body;

    if (!fecha_emision || !periodo || !monto_base || !total || !alquiler_id || !cliente_id) {
        return res.status(400).json({
            message: 'Faltan datos requeridos (fecha_emision, periodo, monto_base, total, alquiler_id, cliente_id).'
        });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO recibo
                (fecha_emision, periodo, monto_base, luz, agua, expensas, tasas, iva, total, estado, alquiler_id, cliente_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                fecha_emision, periodo, monto_base, luz || 0, agua || 0, expensas || 0,
                tasas || 0, iva || 0, total, estado || 'pendiente', alquiler_id, cliente_id
            ]
        );

        res.status(201).json({ id: result.insertId, fecha_emision, periodo, total, estado: estado || 'pendiente' });
    } catch (error) {
        console.error('Error al crear recibo:', error);
        res.status(500).json({ message: 'Error interno al crear el recibo.' });
    }
};

// PUT /api/recibos/:id - Actualizar un recibo (UPDATE)
export const updateRecibo = async (req, res) => {
    const { id } = req.params;
    const { estado, total } = req.body;

    // En la práctica lo que más se actualiza de un recibo es su estado (pendiente/pagado) y el total
    if (!estado || total === undefined) {
        return res.status(400).json({ message: 'Faltan datos requeridos para actualizar (estado, total).' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE recibo SET estado = ?, total = ? WHERE id_recibo = ?',
            [estado, total, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Recibo no encontrado para actualizar.' });
        }

        res.json({ id: Number(id), estado, total, message: 'Recibo actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar recibo:', error);
        res.status(500).json({ message: 'Error interno al actualizar el recibo.' });
    }
};

// DELETE /api/recibos/:id - Eliminar un recibo (DELETE)
export const deleteRecibo = async (req, res) => {
    const { id } = req.params;

    try {
        // En un sistema real, primero revisaríamos si tiene movimientos bancarios asociados (relaciones)
        const [result] = await pool.query('DELETE FROM recibo WHERE id_recibo = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Recibo no encontrado para eliminar.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar recibo:', error);
        res.status(500).json({ message: 'Error interno al eliminar el recibo.' });
    }
};
