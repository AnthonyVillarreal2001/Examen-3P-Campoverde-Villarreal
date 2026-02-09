const { Op } = require('sequelize');
const { Booking } = require('../models/Booking');

const findByUser = async (userId, transaction) => {
    return Booking.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        transaction
    });
};

const findUpcoming = async (userId, transaction) => {
    return Booking.findAll({
        where: {
            userId,
            estado: 'activo',
            fecha: { [Op.gte]: new Date() }
        },
        order: [['fecha', 'ASC']],
        limit: 5,
        transaction
    });
};

const createBooking = async (data, transaction) => Booking.create(data, { transaction });

const findByIdForUser = async (id, userId, transaction) => Booking.findOne({ where: { id, userId }, transaction });

const deleteByIdForUser = async (id, userId, transaction) => Booking.destroy({ where: { id, userId }, transaction });

const findCanceladasAsc = async (userId, transaction) => Booking.findAll({
    where: { userId, estado: 'cancelada' },
    order: [['canceladaEn', 'ASC']],
    transaction
});

const deleteManyByIds = async (ids, transaction) => Booking.destroy({ where: { id: ids }, transaction });

module.exports = {
    findByUser,
    findUpcoming,
    createBooking,
    findByIdForUser,
    deleteByIdForUser,
    findCanceladasAsc,
    deleteManyByIds
};
