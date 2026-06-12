const db = require('../repositories/dbRepository');
const { normalizeToUtf8 } = require('../middleware/auth');

async function verifyCertificate(req, res, next) {
  const { codigo } = req.params;

  try {
    const cert = await db.getCertificate(codigo);
    if (!cert) {
      return res.status(404).json({ valido: false, error: 'Código de verificación no válido o certificado inexistente' });
    }

    res.json({
      valido: true,
      usuario: normalizeToUtf8(cert.nombre_completo),
      cedula: cert.cedula,
      fecha_emision: cert.fecha_emision,
      codigo_verificacion: cert.codigo_verificacion,
      calificacion_obtenida: cert.calificacion_obtenida || 100,
      numero_certificado: cert.numero_certificado || 'AS-2026-0001',
      curso_titulo: cert.curso_titulo || 'Manipulación de Alimentos'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  verifyCertificate
};
