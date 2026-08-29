// backend-api/src/routes/alquiler.routes.js

import express from 'express';
import {
    getAlquileres,
    getAlquilerById,
    createAlquiler,
    updateAlquiler,
    deleteAlquiler
} from '../controllers/alquiler.controller.js';

const router = express.Router();

router.get('/', getAlquileres);
router.get('/:id', getAlquilerById);
router.post('/', createAlquiler);
router.put('/:id', updateAlquiler);
router.delete('/:id', deleteAlquiler);

export default router;
