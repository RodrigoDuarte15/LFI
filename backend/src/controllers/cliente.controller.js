// backend-api/src/controllers/cliente.controller.js

import pool from '../db.js';

// GET /api/clientes - Obtener todos (READ), con JOIN a usuario para traer nombre/apellido
export const getClientes = async (req, res) => {
    try {
        const query = `
            SELECT
                c.id_cliente,
                c.fecha_registro,
                c.estado_cuenta,
                c.usuario_id,
                u.nombre,
                u.apellido,
                u.email,
                u.telefono
            FROM cliente c
            JOIN usuario u ON c.usuario_id = u.id_usuario
            ORDER BY u.apellido ASC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET).' });
    }
};

// GET /api/clientes/:id - Obtener uno (READ Detail)
export const getClienteById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT
                c.id_cliente,
                c.fecha_registro,
                c.estado_cuenta,
                c.usuario_id,
                u.nombre,
                u.apellido,
                u.email,
                u.telefono
            FROM cliente c
            JOIN usuario u ON c.usuario_id = u.id_usuario
            WHERE c.id_cliente = ?
        `;
        const [rows] = await pool.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET by id).' });
    }
};

// POST /api/clientes - Crear un nuevo cliente (CREATE)
// El cliente se crea sobre un usuario_id ya existente (ese usuario debe tener rol "cliente")
export const createCliente = async (req, res) => {
    const { fecha_registro, estado_cuenta, usuario_id } = req.body;

    if (!usuario_id) {
        return res.status(400).json({ message: 'Falta el dato requerido usuario_id.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO cliente (fecha_registro, estado_cuenta, usuario_id) VALUES (?, ?, ?)',
            [fecha_registro || new Date(), estado_cuenta || 0, usuario_id]
        );

        res.status(201).json({
            id: result.insertId,
            fecha_registro,
            estado_cuenta,
            usuario_id
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ message: 'Error interno al crear el cliente.' });
    }
};

// PUT /api/clientes/:id - Actualizar un cliente (UPDATE)
export const updateCliente = async (req, res) => {
    const { id } = req.params;
    const { estado_cuenta } = req.body;

    if (estado_cuenta === undefined) {
        return res.status(400).json({ message: 'Falta el dato requerido estado_cuenta para actualizar.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE cliente SET estado_cuenta = ? WHERE id_cliente = ?',
            [estado_cuenta, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado para actualizar.' });
        }

        res.json({ id: Number(id), estado_cuenta, message: 'Cliente actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ message: 'Error interno al actualizar el cliente.' });
    }
};

// DELETE /api/clientes/:id - Eliminar un cliente (DELETE)
export const deleteCliente = async (req, res) => {
    const { id } = req.params;

    try {
        // En un sistema real, primero revisaríamos si tiene alquileres/inmuebles asociados (relaciones)
        const [result] = await pool.query('DELETE FROM cliente WHERE id_cliente = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado para eliminar.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ message: 'Error interno al eliminar el cliente.' });
    }
};
