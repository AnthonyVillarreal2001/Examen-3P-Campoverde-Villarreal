import jwt from 'jsonwebtoken';

export function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ Formato de token inválido o header Authorization ausente');
        return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const token = authHeader.split(' ')[1];
    console.log('🔐 Token recibido:', token);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('❌ JWT_SECRET no está definido en variables de entorno');
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
    console.log('🔑 JWT_SECRET actual:', secret);

    try {
        const decoded = jwt.verify(token, secret);
        console.log('✅ Token válido, payload:', decoded);
        req.user = {
            userId: decoded.userId,
            nombre: decoded.nombre,
            email: decoded.email
        };
        next();
    } catch (err) {
        console.error('❌ Error al verificar token:', err.message);
        return res.status(401).json({ message: 'Token inválido' });
    }
}