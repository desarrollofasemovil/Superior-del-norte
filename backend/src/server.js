const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const db = require('./db');
const { generateCertificatePDF } = require('./pdf');

const app = express();
const PORT = process.env.PORT || 5000;
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

app.use(cors());
app.use(express.json());

// Force UTF-8 encoding header for all API responses except binary downloads
app.use((req, res, next) => {
  if (!req.path.includes('/certificate/download')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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

// Helper to generate verification code in format ALIM-XXXX-XXXX
function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let r1 = '';
  let r2 = '';
  for (let i = 0; i < 4; i++) {
    r1 += chars.charAt(Math.floor(Math.random() * chars.length));
    r2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ALIM-${r1}-${r2}`;
}

// --- Endpoints ---

// 1. Authenticate / Login
app.post('/api/auth/login', async (req, res) => {
  const { cedula, password } = req.body;

  // Basic Validation
  if (!cedula || !password) {
    return res.status(400).json({ error: 'La cédula y la contraseña son obligatorias' });
  }

  // Check if cedula is numeric
  if (!/^\d+$/.test(cedula)) {
    return res.status(400).json({ error: 'La cédula debe contener únicamente números' });
  }

  try {
    const user = await db.getUser(cedula);
    if (!user) {
      return res.status(401).json({ error: 'Cédula o contraseña incorrectas' });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Cédula o contraseña incorrectas' });
    }

    // Sign JWT
    const cleanNombre = normalizeToUtf8(user.nombre_completo);
    const token = jwt.sign(
      { cedula: user.cedula, nombre_completo: cleanNombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: {
        cedula: user.cedula,
        nombre_completo: cleanNombre,
        rol: user.rol
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. Register (Optional, for admin/testing purposes)
app.post('/api/auth/register', async (req, res) => {
  const { cedula, nombre_completo, password } = req.body;

  if (!cedula || !nombre_completo || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  if (!/^\d+$/.test(cedula)) {
    return res.status(400).json({ error: 'La cédula debe contener únicamente números' });
  }

  try {
    const existingUser = await db.getUser(cedula);
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya está registrado' });
    }

    const cleanNombreInput = normalizeToUtf8(nombre_completo);
    const newUser = await db.createUser(cedula, cleanNombreInput, password);
    res.status(201).json({
      message: 'Usuario registrado con éxito',
      user: {
        cedula: newUser.cedula,
        nombre_completo: normalizeToUtf8(newUser.nombre_completo),
        rol: newUser.rol
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 3. Get Course Modules
app.get('/api/course/content', authenticateToken, async (req, res) => {
  try {
    const modules = await db.getModules();
    res.json(modules);
  } catch (err) {
    console.error('Get modules error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 4. Get Student Progress
app.get('/api/course/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await db.getUserProgress(req.user.cedula);
    res.json(progress);
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 5. Update Student Progress
app.post('/api/course/progress', authenticateToken, async (req, res) => {
  const { modulo_id } = req.body;

  if (!modulo_id) {
    return res.status(400).json({ error: 'El id de módulo es requerido' });
  }

  try {
    const updatedProgress = await db.saveProgress(req.user.cedula, parseInt(modulo_id));
    res.json({
      message: 'Progreso actualizado con éxito',
      ...updatedProgress
    });
  } catch (err) {
    console.error('Update progress error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 6. Get Exam Questions
app.get('/api/exam/questions', authenticateToken, async (req, res) => {
  try {
    const progress = await db.getUserProgress(req.user.cedula);
    const modules = await db.getModules();
    if (progress.modulos_completados.length < modules.length) {
      return res.status(403).json({ error: 'Debe completar los 8 módulos del curso antes de realizar la evaluación final.' });
    }
    // Map seed questions to omit the correct answer
    const questionsPublic = db.seedQuestions.map(q => ({
      id: q.id,
      pregunta: q.pregunta,
      opciones: q.opciones
    }));
    res.json(questionsPublic);
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 7. Submit Exam
app.post('/api/exam/submit', authenticateToken, async (req, res) => {
  const { respuestas } = req.body; // format: { "1": "B", "2": "C" }

  if (!respuestas || typeof respuestas !== 'object') {
    return res.status(400).json({ error: 'Las respuestas son requeridas en formato de objeto' });
  }

  try {
    // 0. Verify modules are completed
    const progress = await db.getUserProgress(req.user.cedula);
    const modules = await db.getModules();
    if (progress.modulos_completados.length < modules.length) {
      return res.status(403).json({ error: 'Debe completar los 8 módulos del curso antes de enviar la evaluación.' });
    }

    // 1. Evaluate answers
    const totalQuestions = db.seedQuestions.length;
    let correctCount = 0;

    for (const q of db.seedQuestions) {
      const studentAns = respuestas[q.id.toString()] || respuestas[q.id];
      if (studentAns && studentAns.toUpperCase() === q.respuesta_correcta.toUpperCase()) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalQuestions) * 100);
    const approved = score >= 80; // Pass mark is 80%

    // 2. Submit results to DB
    const results = await db.submitExam(req.user.cedula, score, approved);

    // 3. If approved, generate/upsert certificate in DB
    if (approved) {
      // Check if certificate already exists
      let cert = await db.getCertificateByCedula(req.user.cedula);
      if (!cert) {
        const code = generateVerificationCode();
        const count = await db.getCertificatesCount();
        const nextNum = count + 1;
        const numeroCert = `AS-2026-${String(nextNum).padStart(4, '0')}`;
        cert = await db.createCertificate(req.user.cedula, code, score, numeroCert);
      }
    }

    res.json({
      puntaje: score,
      aprobado: approved,
      intentos: results.intentos,
      message: approved 
        ? `¡Felicidades! Has aprobado con ${score}%. Tu certificado ya está disponible.` 
        : `Has reprobado con ${score}%. Se requiere al menos un 80% para aprobar. Por favor, intenta de nuevo.`
    });
  } catch (err) {
    console.error('Submit exam error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 7.5 Get Certificate Detail (JSON)
app.get('/api/certificate/detail', authenticateToken, async (req, res) => {
  try {
    const cert = await db.getCertificateByCedula(req.user.cedula);
    if (!cert) {
      return res.status(404).json({ error: 'Certificado no emitido aún.' });
    }
    res.json(cert);
  } catch (err) {
    console.error('Get certificate detail error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 8. Download Certificate (PDF)
app.get('/api/certificate/download', authenticateToken, async (req, res) => {
  try {
    const cert = await db.getCertificateByCedula(req.user.cedula);
    if (!cert) {
      return res.status(400).json({ error: 'Debe completar y aprobar el examen final con al menos un 80% para descargar su certificado.' });
    }

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Certificado_Manipulacion_Alimentos_${req.user.cedula}.pdf`);

    // Generate PDF to response stream
    const pdfData = {
      nombre_completo: normalizeToUtf8(req.user.nombre_completo),
      cedula: req.user.cedula,
      fecha_emision: cert.fecha_emision,
      codigo_verificacion: cert.codigo_verificacion,
      calificacion_obtenida: cert.calificacion_obtenida || 100,
      numero_certificado: cert.numero_certificado || 'AS-2026-0001'
    };

    generateCertificatePDF(res, pdfData);
  } catch (err) {
    console.error('Download certificate error:', err);
    // Note: Can't set headers if they are already sent
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error interno al generar el PDF' });
    }
  }
});

// 9. Verify Certificate (Public Route)
app.get('/api/certificate/verify/:codigo', async (req, res) => {
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
      numero_certificado: cert.numero_certificado || 'AS-2026-0001'
    });
  } catch (err) {
    console.error('Verify certificate error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Initialize database and start server
db.initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
