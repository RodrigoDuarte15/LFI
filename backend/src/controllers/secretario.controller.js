// backend-api/src/controllers/secretario.controller.js

import pool from '../db.js';

// GET /api/secretarios - Obtener todos (READ)
export const getSecretarios = async (req, res) => {
    try {
        const query = `
            SELECT
                s.id_secretario,
                s.legajo,
                s.sector,
                s.usuario_id,
                u.nombre,
                u.apellido,
                u.email,
                u.telefono
            FROM secretario s
            JOIN usuario u ON s.usuario_id = u.id_usuario
            ORDER BY u.apellido ASC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener secretarios:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET).' });
    }
};

// GET /api/secretarios/:id - Obtener uno (READ Detail)
export const getSecretarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT
                s.id_secretario,
                s.legajo,
                s.sector,
                s.usuario_id,
                u.nombre,
                u.apellido,
                u.email,
                u.telefono
            FROM secretario s
            JOIN usuario u ON s.usuario_id = u.id_usuario
            WHERE s.id_secretario = ?
        `;
        const [rows] = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Secretario no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener secretario:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET by id).' });
    }
};

// POST /api/secretarios - Crear un nuevo secretario (CREATE)
export const createSecretario = async (req, res) => {
    const { legajo, sector, usuario_id } = req.body;

    if (!legajo || !usuario_id) {
        return res.status(400).json({ message: 'Faltan datos requeridos (legajo, usuario_id).' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO secretario (legajo, sector, usuario_id) VALUES (?, ?, ?)',
            [legajo, sector || null, usuario_id]
        );

        res.status(201).json({
            id: result.insertId,
            legajo,
            sector,
            usuario_id
        });
    } catch (error) {
        console.error('Error al crear secretario:', error);
        res.status(500).json({ message: 'Error interno al crear el secretario.' });
    }
};

// PUT /api/secretarios/:id - Actualizar un secretario (UPDATE)
export const updateSecretario = async (req, res) => {
    const { id } = req.params;
    const { legajo, sector } = req.body;

    if (!legajo) {
        return res.status(400).json({ message: 'Falta el dato requerido legajo para actualizar.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE secretario SET legajo = ?, sector = ? WHERE id_secretario = ?',
            [legajo, sector || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Secretario no encontrado para actualizar.' });
        }

        res.json({ id: Number(id), legajo, sector, message: 'Secretario actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar secretario:', error);
        res.status(500).json({ message: 'Error interno al actualizar el secretario.' });
    }
};

// DELETE /api/secretarios/:id - Eliminar un secretario (DELETE)
export const deleteSecretario = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM secretario WHERE id_secretario = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Secretario no encontrado para eliminar.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar secretario:', error);
        res.status(500).json({ message: 'Error interno al eliminar el secretario.' });
    }
};
