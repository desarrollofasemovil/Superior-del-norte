const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123';

// Safely normalize string to UTF-8 using Latin1 to UTF-8 decoding to fix Mojibake
function normalizeToUtf8(str) {
  if (!str || typeof str !== 'string') return str;
  try {
    const latin1Buffer = Buffer.from(str, 'latin1');
    const utf8Decoded = latin1Buffer.toString('utf8');
    if (!utf8Decoded.includes('\uFFFD') && utf8Decoded !== str) {
      return utf8Decoded;
    }
  } catch (e) {}
  return str;
}

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
    if (user && user.nombre_completo) {
      user.nombre_completo = normalizeToUtf8(user.nombre_completo);
    }
    req.user = user;
    next();
  });
}

// Middleware to require admin role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de Administrador.' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  normalizeToUtf8,
  JWT_SECRET
};
