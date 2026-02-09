require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('🚀 Conectado a MongoDB');
        app.listen(PORT, '0.0.0.0', () => console.log(`✅ Servidor escuchando en puerto ${PORT}`));
    })
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));
