// backend-api/src/routes/recibo.routes.js

import express from 'express';
import {
    getRecibos,
    getReciboById,
    createRecibo,
    updateRecibo,
    deleteRecibo
} from '../controllers/recibo.controller.js';

const router = express.Router();

router.get('/', getRecibos);
router.get('/:id', getReciboById);
router.post('/', createRecibo);
router.put('/:id', updateRecibo);
router.delete('/:id', deleteRecibo);

export default router;
