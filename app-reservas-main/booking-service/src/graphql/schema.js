const { formatInTimeZone } = require('date-fns-tz');
const bookingService = require('../services/bookingService');

const typeDefs = `#graphql
    type Booking {
        id: ID!
        userId: String!
        fecha: String!
        servicio: String!
        canceladaEn: String
        estado: String!
        createdAt: String!
        updatedAt: String!
        fechaFormateada: String
    }

    type Query {
        bookings: [Booking!]!
        upcomingBookings: [Booking!]!
    }

    type Mutation {
        createBooking(fecha: String!, servicio: String!): Booking!
        cancelBooking(id: ID!): Booking!
        deleteBooking(id: ID!): Boolean!
    }
`;

const resolvers = {
    Query: {
        bookings: async (_, __, { authHeader }) => bookingService.listBookings(authHeader),
        upcomingBookings: async (_, __, { authHeader }) => bookingService.listUpcoming(authHeader)
    },
    Mutation: {
        createBooking: async (_, { fecha, servicio }, { authHeader }) => bookingService.createBooking({ fecha, servicio }, authHeader),
        cancelBooking: async (_, { id }, { authHeader }) => bookingService.cancelBooking(id, authHeader),
        deleteBooking: async (_, { id }, { authHeader }) => bookingService.deleteBooking(id, authHeader)
    },
    Booking: {
        id: (parent) => parent.id,
        fecha: (parent) => parent.fecha instanceof Date ? parent.fecha.toISOString() : parent.fecha,
        canceladaEn: (parent) => parent.canceladaEn instanceof Date ? parent.canceladaEn.toISOString() : parent.canceladaEn,
        createdAt: (parent) => parent.createdAt instanceof Date ? parent.createdAt.toISOString() : parent.createdAt,
        updatedAt: (parent) => parent.updatedAt instanceof Date ? parent.updatedAt.toISOString() : parent.updatedAt,
        fechaFormateada: (parent) => parent.fecha ? formatInTimeZone(parent.fecha, 'America/Guayaquil', 'dd/MM/yyyy HH:mm:ss') : null
    }
};

module.exports = { typeDefs, resolvers };
