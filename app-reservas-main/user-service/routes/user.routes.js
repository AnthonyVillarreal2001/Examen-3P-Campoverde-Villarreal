import express from 'express';
import User from '../models/User.js';
import { verifyToken } from '../middleware/verifyToken.js';
import Joi from 'joi';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { _id, nombre, email } = req.body;

        if (!_id || !nombre || !email) {
            return res.status(400).json({ message: 'Datos incompletos' });
        }

        const user = await User.create({ _id, nombre, email });
        res.status(201).json(user);
    } catch (err) {
        console.error('❌ Error creando usuario en user-service:', err);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
});

router.get('/me', verifyToken, async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener perfil' });
    }
});

router.put('/me/update', verifyToken, async (req, res) => {
    const schema = Joi.object({
        nombre: Joi.string().min(2).max(50),
        email: Joi.string().email(),
        telefono: Joi.string().allow('', null),
        direccion: Joi.string().allow('', null)
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: req.body },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Error al actualizar perfil' });
    }
});

export default router;