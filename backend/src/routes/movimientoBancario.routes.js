// backend-api/src/routes/movimientoBancario.routes.js

import express from 'express';
import {
    getMovimientos,
    getMovimientoById,
    createMovimiento,
    updateMovimiento,
    deleteMovimiento
} from '../controllers/movimientoBancario.controller.js';

const router = express.Router();

router.get('/', getMovimientos);
router.get('/:id', getMovimientoById);
router.post('/', createMovimiento);
router.put('/:id', updateMovimiento);
router.delete('/:id', deleteMovimiento);

export default router;
