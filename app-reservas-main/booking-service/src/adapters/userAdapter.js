const axios = require('axios');
const { GraphQLError } = require('graphql');

const BASE_URL = process.env.USER_SERVICE_URL || 'http://user-service:5003';

const requireUser = async (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new GraphQLError('Token no proporcionado', { extensions: { code: 'UNAUTHENTICATED' } });
    }

    try {
        const { data } = await axios.get(`${BASE_URL}/users/me`, {
            headers: { Authorization: authHeader }
        });
        if (!data || !data._id) {
            throw new GraphQLError('Usuario no autorizado', { extensions: { code: 'UNAUTHENTICATED' } });
        }
        return data;
    } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
            throw new GraphQLError('Usuario no autorizado', { extensions: { code: 'UNAUTHENTICATED' } });
        }
        throw new GraphQLError('No se pudo validar el usuario', { extensions: { code: 'BAD_GATEWAY' } });
    }
};

module.exports = { requireUser };
