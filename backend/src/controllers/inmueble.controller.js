// backend-api/src/controllers/inmueble.controller.js

import pool from '../db.js';

// GET /api/inmuebles - Obtener todos (READ)
export const getInmuebles = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id_inmueble, titulo, tipo, direccion, localidad, provincia, estado, precio,
                    superficie, ambientes, dormitorios, banios, foto, propietario_id, secretario_id, inquilino_id
             FROM inmueble
             ORDER BY id_inmueble DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener inmuebles:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET).' });
    }
};

// GET /api/inmuebles/:id - Obtener uno (READ Detail)
export const getInmuebleById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM inmueble WHERE id_inmueble = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Inmueble no encontrado.' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener inmueble:', error);
        res.status(500).json({ message: 'Error interno del servidor (GET by id).' });
    }
};

// POST /api/inmuebles - Crear un nuevo inmueble (CREATE)
export const createInmueble = async (req, res) => {
    const {
        titulo, tipo, direccion, localidad, provincia, estado, precio,
        descripcion, superficie, ambientes, dormitorios, banios, foto,
        propietario_id, secretario_id, inquilino_id
    } = req.body;

    // Validación básica: asegura que los campos necesarios existan
    if (!titulo || !tipo || !direccion || !precio) {
        return res.status(400).json({ message: 'Faltan datos requeridos (titulo, tipo, direccion, precio).' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO inmueble
                (titulo, tipo, direccion, localidad, provincia, estado, precio, descripcion,
                 superficie, ambientes, dormitorios, banios, foto, propietario_id, secretario_id, inquilino_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                titulo, tipo, direccion, localidad || null, provincia || null,
                estado || 'disponible', precio, descripcion || null, superficie || null,
                ambientes || null, dormitorios || null, banios || null, foto || null,
                propietario_id || null, secretario_id || null, inquilino_id || null
            ]
        );

        res.status(201).json({ id: result.insertId, titulo, tipo, direccion, precio, estado: estado || 'disponible' });
    } catch (error) {
        console.error('Error al crear inmueble:', error);
        res.status(500).json({ message: 'Error interno al crear el inmueble.' });
    }
};

// PUT /api/inmuebles/:id - Actualizar un inmueble (UPDATE)
export const updateInmueble = async (req, res) => {
    const { id } = req.params;
    const {
        titulo, tipo, direccion, localidad, provincia, estado, precio,
        descripcion, superficie, ambientes, dormitorios, banios, foto,
        propietario_id, secretario_id, inquilino_id
    } = req.body;

    if (!titulo || !tipo || !direccion || !precio) {
        return res.status(400).json({ message: 'Faltan datos requeridos para actualizar.' });
    }

    try {
        const [result] = await pool.query(
            `UPDATE inmueble SET
                titulo = ?, tipo = ?, direccion = ?, localidad = ?, provincia = ?, estado = ?,
                precio = ?, descripcion = ?, superficie = ?, ambientes = ?, dormitorios = ?,
                banios = ?, foto = ?, propietario_id = ?, secretario_id = ?, inquilino_id = ?
             WHERE id_inmueble = ?`,
            [
                titulo, tipo, direccion, localidad || null, provincia || null, estado || 'disponible',
                precio, descripcion || null, superficie || null, ambientes || null, dormitorios || null,
                banios || null, foto || null, propietario_id || null, secretario_id || null,
                inquilino_id || null, id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inmueble no encontrado para actualizar.' });
        }

        res.json({ id: Number(id), titulo, tipo, direccion, precio, estado, message: 'Inmueble actualizado con éxito.' });
    } catch (error) {
        console.error('Error al actualizar inmueble:', error);
        res.status(500).json({ message: 'Error interno al actualizar el inmueble.' });
    }
};

// DELETE /api/inmuebles/:id - Eliminar un inmueble (DELETE)
export const deleteInmueble = async (req, res) => {
    const { id } = req.params;

    try {
        // En un sistema real, primero revisaríamos si tiene alquileres asociados (relaciones)
        const [result] = await pool.query('DELETE FROM inmueble WHERE id_inmueble = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inmueble no encontrado para eliminar.' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar inmueble:', error);
        res.status(500).json({ message: 'Error interno al eliminar el inmueble.' });
    }
};
