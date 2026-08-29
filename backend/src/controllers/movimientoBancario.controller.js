// backend-api/src/controllers/movimientoBancario.controller.js

import pool from '../db.js';

// GET /api/movimientos - Obtener todos (READ)
export const getMovimientos = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id_movimiento, fecha, tipo, descripcion, monto, recibo_id FROM movimiento_bancario ORDER BY fecha DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener movimientos bancarios:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET).' });
    }
};

// GET /api/movimientos/:id - Obtener uno (READ Detail)
export const getMovimientoById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM movimiento_bancario WHERE id_movimiento = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Movimiento bancario no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener movimiento bancario:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET by id).' });
    }
};

// POST /api/movimientos - Crear un nuevo movimiento (CREATE)
export const createMovimiento = async (req, res) => {
    const { fecha, tipo, descripcion, monto, recibo_id } = req.body;

    if (!fecha || !tipo || !monto) {
        return res.status(400).json({ message: 'Faltan datos requeridos (fecha, tipo, monto).' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO movimiento_bancario (fecha, tipo, descripcion, monto, recibo_id) VALUES (?, ?, ?, ?, ?)',
            [fecha, tipo, descripcion || null, monto, recibo_id || null]
        );

        res.status(201).json({ id: result.insertId, fecha, tipo, descripcion, monto, recibo_id });
    } catch (error) {
        console.error('Error al crear movimiento bancario:', error);
        res.status(500).json({ message: 'Error interno al crear el movimiento bancario.' });
    }
};

// PUT /api/movimientos/:id - Actualizar un movimiento (UPDATE)
export const updateMovimiento = async (req, res) => {
    const { id } = req.params;
    const { fecha, tipo, descripcion, monto } = req.body;

    if (!fecha || !tipo || !monto) {
        return res.status(400).json({ message: 'Faltan datos requeridos para actualizar.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE movimiento_bancario SET fecha = ?, tipo = ?, descripcion = ?, monto = ? WHERE id_movimiento = ?',
            [fecha, tipo, descripcion || null, monto, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movimiento bancario no encontrado para actualizar.' });
        }

        res.json({ id: Number(id), fecha, tipo, descripcion, monto, message: 'Movimiento actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar movimiento bancario:', error);
        res.status(500).json({ message: 'Error interno al actualizar el movimiento bancario.' });
    }
};

// DELETE /api/movimientos/:id - Eliminar un movimiento (DELETE)
export const deleteMovimiento = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM movimiento_bancario WHERE id_movimiento = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Movimiento bancario no encontrado para eliminar.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar movimiento bancario:', error);
        res.status(500).json({ message: 'Error interno al eliminar el movimiento bancario.' });
    }
};
