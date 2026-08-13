// backend-api/src/controllers/usuario.controller.js

import pool from '../db.js';

// GET /api/usuarios - Obtener todos (READ)
export const getUsuarios = async (req, res) => {
    try {
        // No devolvemos el password por seguridad
        const [rows] = await pool.query(
            'SELECT id_usuario, nombre, apellido, dni, email, telefono, direccion, rol FROM usuario ORDER BY apellido ASC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET).' });
    }
};

// GET /api/usuarios/:id - Obtener uno (READ Detail)
export const getUsuarioById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT id_usuario, nombre, apellido, dni, email, telefono, direccion, rol FROM usuario WHERE id_usuario = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET by id).' });
    }
};

// POST /api/usuarios - Crear un nuevo usuario (CREATE)
export const createUsuario = async (req, res) => {
    const { nombre, apellido, dni, email, password, telefono, direccion, rol } = req.body;

    // Validación básica: asegura que los campos necesarios existan
    if (!nombre || !apellido || !dni || !email || !password) {
        return res.status(400).json({ message: 'Faltan datos requeridos (nombre, apellido, dni, email, password).' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO usuario (nombre, apellido, dni, email, password, telefono, direccion, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellido, dni, email, password, telefono || null, direccion || null, rol || null]
        );

        res.status(201).json({
            id: result.insertId,
            nombre,
            apellido,
            dni,
            email,
            telefono,
            direccion,
            rol
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error interno al crear el usuario.' });
    }
};

// PUT /api/usuarios/:id - Actualizar un usuario (UPDATE)
export const updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, dni, email, telefono, direccion, rol } = req.body;

    if (!nombre || !apellido || !dni || !email) {
        return res.status(400).json({ message: 'Faltan datos requeridos para actualizar.' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE usuario SET nombre = ?, apellido = ?, dni = ?, email = ?, telefono = ?, direccion = ?, rol = ? WHERE id_usuario = ?',
            [nombre, apellido, dni, email, telefono || null, direccion || null, rol || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para actualizar.' });
        }

        res.json({ id: Number(id), nombre, apellido, dni, email, telefono, direccion, rol, message: 'Usuario actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ message: 'Error interno al actualizar el usuario.' });
    }
};

// DELETE /api/usuarios/:id - Eliminar un usuario (DELETE)
export const deleteUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado para eliminar.' });
        }

        res.status(204).send(); // 204 No Content (Éxito sin devolver cuerpo)
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno al eliminar el usuario.' });
    }
};
