import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';

dotenv.config();
const app = express();

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

app.use(cors(corsOptions));

app.use(express.json());

app.use('/users', userRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`✅ User Service iniciado en http://localhost:${process.env.PORT}`);
        });
    })
    .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

app.use((err, req, res, next) => {
    console.error('❌ Error global:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
});
