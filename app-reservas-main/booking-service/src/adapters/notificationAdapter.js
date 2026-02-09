const axios = require('axios');

const BASE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5002';

const notifyReserva = async ({ email, nombre, servicio, fecha }) => {
    try {
        await axios.post(`${BASE_URL}/notify/reserva`, { email, nombre, servicio, fecha });
    } catch (err) {
        console.error('❌ Error notificando reserva:', err.response?.data || err.message);
    }
};

const notifyCancelacion = async ({ email, nombre, servicio, fecha }) => {
    try {
        await axios.post(`${BASE_URL}/notify/cancelacion`, { email, nombre, servicio, fecha });
    } catch (err) {
        console.error('❌ Error notificando cancelación:', err.response?.data || err.message);
    }
};

module.exports = { notifyReserva, notifyCancelacion };
