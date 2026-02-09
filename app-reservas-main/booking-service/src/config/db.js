const { Sequelize } = require('sequelize');

const {
    POSTGRES_URL,
    POSTGRES_HOST = 'postgres',
    POSTGRES_PORT = '5432',
    POSTGRES_DB = 'bookingdb',
    POSTGRES_USER = 'booking',
    POSTGRES_PASSWORD = 'booking'
} = process.env;

const sequelize = POSTGRES_URL
    ? new Sequelize(POSTGRES_URL, {
        dialect: 'postgres',
        logging: false,
    })
    : new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, {
        host: POSTGRES_HOST,
        port: POSTGRES_PORT,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            idle: 10000
        }
    });

module.exports = { sequelize };
