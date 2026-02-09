const { enviarCorreo } = require('../services/mailer');

exports.enviarCorreoReserva = async (req, res) => {
    const { email, nombre, servicio, fecha } = req.body;

    try {
        const fechaFormateada = fecha;
        await enviarCorreo({
            to: email,
            subject: 'Confirmación de Reserva',
            html: `<h1>Hola ${nombre}</h1><p>Tu reserva para <strong>${servicio}</strong> ha sido confirmada para el día <strong>${fechaFormateada}</strong>.</p>`
        });
        res.json({ message: 'Correo enviado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al enviar el correo de reserva' });
    }
};

exports.enviarCorreoCancelacion = async (req, res) => {
    const { email, nombre, servicio, fecha } = req.body;

    try {
        const fechaFormateada = fecha;
        await enviarCorreo({
            to: email,
            subject: 'Cancelación de Reserva',
            html: `<h1>Hola ${nombre}</h1><p>Tu reserva para <strong>${servicio}</strong> del día <strong>${fechaFormateada}</strong> ha sido cancelada.</p>`
        });
        res.json({ message: 'Correo de cancelación enviado correctamente' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al enviar el correo de cancelación' });
    }
};
