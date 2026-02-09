const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const axios = require('axios');
const { formatInTimeZone } = require('date-fns-tz');
const { DateTime } = require('luxon');

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: 'Token inválido' });
    }
}

router.get('/bookings', verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.userId });

        const bookingsFormateadas = bookings.map(b => {
            const reservaObj = b.toObject();
            reservaObj.fechaFormateada = formatInTimeZone(reservaObj.fecha, 'America/Guayaquil', 'dd/MM/yyyy HH:mm:ss');
            return reservaObj;
        });

        res.json(bookingsFormateadas);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ message: 'Error al obtener reservas' });
    }
});

router.post('/bookings', verifyToken, async (req, res) => {
    try {
        const { fecha, servicio } = req.body;

        const fechaObj = DateTime.fromISO(fecha, { zone: 'America/Guayaquil' }).toJSDate();
        console.log('Fecha recibida (raw):', fecha);
        console.log('Fecha convertida a Date:', fechaObj);

        const nueva = new Booking({
            userId: req.user.userId,
            fecha: fechaObj,
            servicio,
            estado: 'activo'
        });
        await nueva.save();

        const email = req.user.email;
        const nombre = req.user.nombre || 'Usuario';

        const fechaFormateada = formatInTimeZone(fechaObj, 'America/Guayaquil', 'dd/MM/yyyy HH:mm');

        await axios.post('http://notification-service:5002/notify/reserva', {
            email,
            nombre,
            servicio,
            fecha: fechaFormateada
        });

        res.status(201).json({ message: 'Reserva creada', reserva: nueva });
    } catch (error) {
        console.error('Error al crear la reserva:', error.response?.data || error.message || error);
        res.status(500).json({ message: 'Error al crear la reserva' });
    }
});

router.put('/reservas/:id/cancelar', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const reserva = await Booking.findOne({ _id: id, userId: req.user.userId });
        if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada' });

        reserva.estado = 'cancelada';
        reserva.canceladaEn = new Date();
        await reserva.save();

        const canceladas = await Booking.find({
            userId: req.user.userId,
            estado: 'cancelada'
        }).sort({ canceladaEn: 1 });

        if (canceladas.length > 5) {
            const aEliminar = canceladas.slice(0, canceladas.length - 5);
            const idsAEliminar = aEliminar.map(r => r._id);
            await Booking.deleteMany({ _id: { $in: idsAEliminar } });
        }

        const email = req.user.email;
        const nombre = req.user.nombre || 'Usuario';

        const fechaFormateada = formatInTimeZone(reserva.fecha, 'America/Guayaquil', 'dd/MM/yyyy HH:mm');

        await axios.post('http://notification-service:5002/notify/cancelacion', {
            email,
            nombre,
            servicio: reserva.servicio,
            fecha: fechaFormateada
        });

        res.json({ message: 'Reserva cancelada correctamente' });
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        res.status(500).json({ message: 'Error al cancelar la reserva' });
    }
});

router.delete('/bookings/:id', verifyToken, async (req, res) => {
    try {
        const eliminado = await Booking.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!eliminado) return res.status(404).json({ message: 'Reserva no encontrada' });
        res.json({ message: 'Reserva eliminada correctamente', reserva: eliminado });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la reserva' });
    }
});

router.get('/reservas/proximas', verifyToken, async (req, res) => {
    try {
        const today = new Date();
        const reservasProximas = await Booking.find({
            userId: req.user.userId,
            estado: 'activo',
            fecha: { $gte: today }
        }).sort({ fecha: 1 }).limit(5);

        res.json(reservasProximas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener próximas reservas' });
    }
});

module.exports = router;
