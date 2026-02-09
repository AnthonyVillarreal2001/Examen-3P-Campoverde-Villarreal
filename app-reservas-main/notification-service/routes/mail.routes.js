const express = require('express');
const router = express.Router();
const { enviarCorreoReserva } = require('../controllers/mail.controller');
const { enviarCorreoCancelacion } = require('../controllers/mail.controller');

router.post('/reserva', enviarCorreoReserva);

router.post('/cancelacion', enviarCorreoCancelacion);

module.exports = router;
