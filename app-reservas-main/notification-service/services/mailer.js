const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
})

async function enviarCorreo({ to, subject, html }) {
    const mailOptions = {
        from: `"Sistema de Reservas" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    }

    return transporter.sendMail(mailOptions)
}

module.exports = { enviarCorreo }