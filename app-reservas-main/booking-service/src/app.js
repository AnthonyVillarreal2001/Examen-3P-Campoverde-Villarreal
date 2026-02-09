require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { typeDefs, resolvers } = require('./graphql/schema');
const { sequelize } = require('./config/db');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const buildContext = ({ req }) => ({ authHeader: req.headers.authorization || '' });

async function startServer() {
    try {
        const maxRetries = 10;
        const delayMs = 3000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await sequelize.authenticate();
                await sequelize.sync();
                console.log('🚀 Conectado a PostgreSQL (Booking Service)');
                break;
            } catch (err) {
                console.error(`❌ Intento ${attempt}/${maxRetries} conectando a PostgreSQL:`, err.message);
                if (attempt === maxRetries) throw err;
                await new Promise(r => setTimeout(r, delayMs));
            }
        }

        const server = new ApolloServer({
            typeDefs,
            resolvers,
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
        });

        await server.start();

        app.use('/graphql', express.json(), expressMiddleware(server, {
            context: async (ctx) => buildContext(ctx)
        }));

        app.get('/health', (_, res) => res.json({ status: 'ok' }));

        await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));
        console.log(`✅ Booking service GraphQL corriendo en puerto ${PORT}`);
    } catch (err) {
        console.error('❌ Error al iniciar Booking Service:', err);
    }
}

startServer();
