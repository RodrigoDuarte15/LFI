// backend-api/src/routes/secretario.routes.js

import express from 'express';
import {
    getSecretarios,
    getSecretarioById,
    createSecretario,
    updateSecretario,
    deleteSecretario
} from '../controllers/secretario.controller.js';

const router = express.Router();

router.get('/', getSecretarios);
router.get('/:id', getSecretarioById);
router.post('/', createSecretario);
router.put('/:id', updateSecretario);
router.delete('/:id', deleteSecretario);

export default router;
