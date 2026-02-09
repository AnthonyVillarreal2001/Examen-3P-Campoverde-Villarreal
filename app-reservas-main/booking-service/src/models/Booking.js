const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true
    },
    fecha: {
        type: DataTypes.DATE,
        allowNull: false
    },
    servicio: {
        type: DataTypes.STRING,
        allowNull: false
    },
    canceladaEn: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    estado: {
        type: DataTypes.ENUM('activo', 'cancelada'),
        allowNull: false,
        defaultValue: 'activo'
    }
}, {
    tableName: 'bookings',
    underscored: true,
    timestamps: true,
    indexes: [
        { fields: ['user_id'] },
        { fields: ['estado'] },
        { fields: ['fecha'] }
    ]
});

module.exports = { Booking };
