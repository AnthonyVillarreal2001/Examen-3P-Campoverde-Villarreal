const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExist = await User.findOne({ email });
        if (userExist) return res.status(400).json({ message: 'Correo ya registrado' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        try {
            const syncRes = await fetch('http://user-service:5003/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    _id: user._id,
                    nombre: user.name,
                    email: user.email
                })
            });

            if (!syncRes.ok) {
                console.warn('⚠️ Falló sincronización con user-service');
            }
        } catch (error) {
            console.error('❌ Error al sincronizar con user-service:', error.message);
        }

        res.status(201).json({ message: 'Usuario registrado correctamente', userId: user._id });
    } catch (err) {
        console.error('❌ Error al registrar usuario:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign(
            {
                userId: user._id,
                nombre: user.name,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.me = async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) return res.status(401).json({ message: 'No autorizado' });

        const token = auth.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(payload.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json(user);
    } catch (err) {
        res.status(401).json({ message: 'Token inválido' });
    }
};
