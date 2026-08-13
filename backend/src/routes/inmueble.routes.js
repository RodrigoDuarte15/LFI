// backend-api/src/routes/inmueble.routes.js

import express from 'express';
import {
    getInmuebles,
    getInmuebleById,
    createInmueble,
    updateInmueble,
    deleteInmueble
} from '../controllers/inmueble.controller.js';

const router = express.Router();

router.get('/', getInmuebles);
router.get('/:id', getInmuebleById);
router.post('/', createInmueble);
router.put('/:id', updateInmueble);
router.delete('/:id', deleteInmueble);

export default router;
