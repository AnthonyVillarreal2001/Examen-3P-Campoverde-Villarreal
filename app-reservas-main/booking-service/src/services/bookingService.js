const { GraphQLError } = require('graphql');
const { formatInTimeZone } = require('date-fns-tz');
const { DateTime } = require('luxon');
const { sequelize } = require('../config/db');
const bookingRepo = require('../repositories/bookingRepository');
const { requireUser } = require('../adapters/userAdapter');
const { notifyReserva, notifyCancelacion } = require('../adapters/notificationAdapter');

const toISO = (date) => date instanceof Date ? date.toISOString() : date;

const requireBooking = (booking) => {
    if (!booking) {
        throw new GraphQLError('Reserva no encontrada', { extensions: { code: 'NOT_FOUND' } });
    }
};

const listBookings = async (authHeader) => {
    const user = await requireUser(authHeader);
    return bookingRepo.findByUser(user._id);
};

const listUpcoming = async (authHeader) => {
    const user = await requireUser(authHeader);
    return bookingRepo.findUpcoming(user._id);
};

const createBooking = async ({ fecha, servicio }, authHeader) => {
    const user = await requireUser(authHeader);
    const fechaObj = DateTime.fromISO(fecha, { zone: 'America/Guayaquil' }).toJSDate();

    return sequelize.transaction(async (t) => {
        const nueva = await bookingRepo.createBooking({
            userId: user._id,
            fecha: fechaObj,
            servicio,
            estado: 'activo'
        }, t);

        return nueva;
    }).then(async (booking) => {
        const fechaFormateada = formatInTimeZone(fechaObj, 'America/Guayaquil', 'dd/MM/yyyy HH:mm');
        await notifyReserva({
            email: user.email,
            nombre: user.nombre || 'Usuario',
            servicio,
            fecha: fechaFormateada
        });
        return booking;
    });
};

const cancelBooking = async (id, authHeader) => {
    const user = await requireUser(authHeader);

    const result = await sequelize.transaction(async (t) => {
        const booking = await bookingRepo.findByIdForUser(id, user._id, t);
        requireBooking(booking);

        booking.estado = 'cancelada';
        booking.canceladaEn = new Date();
        await booking.save({ transaction: t });

        const canceladas = await bookingRepo.findCanceladasAsc(user._id, t);
        if (canceladas.length > 5) {
            const aEliminar = canceladas.slice(0, canceladas.length - 5);
            const ids = aEliminar.map(r => r.id);
            await bookingRepo.deleteManyByIds(ids, t);
        }

        return booking;
    });

    const fechaFormateada = formatInTimeZone(result.fecha, 'America/Guayaquil', 'dd/MM/yyyy HH:mm');
    await notifyCancelacion({
        email: user.email,
        nombre: user.nombre || 'Usuario',
        servicio: result.servicio,
        fecha: fechaFormateada
    });

    return result;
};

const deleteBooking = async (id, authHeader) => {
    const user = await requireUser(authHeader);
    const deleted = await sequelize.transaction(async (t) => {
        const booking = await bookingRepo.findByIdForUser(id, user._id, t);
        requireBooking(booking);
        await bookingRepo.deleteByIdForUser(id, user._id, t);
        return true;
    });
    return deleted;
};

module.exports = {
    listBookings,
    listUpcoming,
    createBooking,
    cancelBooking,
    deleteBooking
};
