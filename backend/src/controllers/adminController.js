const db = require('../repositories/dbRepository');
const { normalizeToUtf8 } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../services/emailService');

async function getCourses(req, res, next) {
  try {
    const courses = await db.getCourses();
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

async function getCoursesList(req, res, next) {
  try {
    const courses = await db.getCourses();
    const simplified = courses.map(c => ({
      id: c.id,
      titulo: normalizeToUtf8(c.titulo)
    }));
    res.json(simplified);
  } catch (err) {
    next(err);
  }
}

async function createCourse(req, res, next) {
  const { titulo, descripcion, imagen_url, modulos } = req.body;

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ error: 'El título del curso es requerido.' });
  }

  if (!modulos || !Array.isArray(modulos) || modulos.length === 0) {
    return res.status(400).json({ error: 'Debe agregar al menos un módulo al curso.' });
  }

  for (let i = 0; i < modulos.length; i++) {
    const mod = modulos[i];
    if (!mod.titulo_modulo || !mod.titulo_modulo.trim() || !mod.tipo_contenido || !mod.data_contenido || !mod.data_contenido.trim()) {
      return res.status(400).json({ 
        error: `El módulo ${i + 1} debe tener título, tipo de contenido y contenido completos.` 
      });
    }
  }

  try {
    const newCourse = await db.createCourse({
      titulo: normalizeToUtf8(titulo),
      descripcion: normalizeToUtf8(descripcion || ''),
      imagen_url: imagen_url || '',
      modulos: modulos.map(m => ({
        titulo_modulo: normalizeToUtf8(m.titulo_modulo),
        tipo_contenido: m.tipo_contenido,
        data_contenido: normalizeToUtf8(m.data_contenido)
      }))
    });

    res.status(201).json({
      message: 'Curso creado con éxito junto con sus módulos.',
      curso: newCourse
    });
  } catch (err) {
    next(err);
  }
}

async function getMetrics(req, res, next) {
  try {
    const metrics = await db.getAdminMetrics();
    res.json(metrics);
  } catch (err) {
    next(err);
  }
}

async function getUsers(req, res, next) {
  const { cedula } = req.query;
  try {
    const users = await db.getAdminUsers(cedula);
    const normalizedUsers = users.map(u => ({
      ...u,
      nombre_completo: normalizeToUtf8(u.nombre_completo)
    }));
    res.json(normalizedUsers);
  } catch (err) {
    next(err);
  }
}

async function createStudent(req, res, next) {
  const { cedula, nombre_completo, password, cursos } = req.body;

  if (!cedula || !nombre_completo || !password) {
    return res.status(400).json({ error: 'La cédula, el nombre completo y la contraseña son requeridos.' });
  }

  if (!/^\d+$/.test(cedula)) {
    return res.status(400).json({ error: 'La cédula debe contener únicamente números.' });
  }

  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!nameRegex.test(nombre_completo)) {
    return res.status(400).json({ error: 'El nombre debe contener únicamente letras y espacios.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  if (!cursos || !Array.isArray(cursos) || cursos.length === 0) {
    return res.status(400).json({ error: 'Debe seleccionar al menos un curso para matricular al estudiante.' });
  }

  try {
    const existing = await db.getUser(cedula);
    if (existing) {
      return res.status(400).json({ error: 'Un usuario con esta cédula ya se encuentra registrado.' });
    }

    const cleanNombre = normalizeToUtf8(nombre_completo);
    const newUser = await db.createUser(cedula, cleanNombre, password, 'estudiante');

    for (const courseId of cursos) {
      await db.enrollUserInCourse(cedula, parseInt(courseId));
    }

    // Fire-and-forget: enviar email de bienvenida con credenciales.
    // No se usa await para no bloquear la respuesta HTTP si el servicio de email falla.
    sendWelcomeEmail({
      cedula,
      nombre_completo: cleanNombre,
      password, // Contraseña en texto plano antes de hashear (solo para el email)
      cursos
    }).catch((emailErr) => {
      console.error('[adminController] Error al enviar email de bienvenida:', emailErr.message);
    });

    res.status(201).json({
      message: 'Estudiante creado y matriculado con éxito.',
      user: {
        cedula: newUser.cedula,
        nombre_completo: newUser.nombre_completo,
        rol: newUser.rol,
        fecha_registro: newUser.fecha_registro
      }
    });
  } catch (err) {
    next(err);
  }
}

async function updateStudentCourses(req, res, next) {
  const { cedula } = req.params;
  const { cursos } = req.body;

  if (!cursos || !Array.isArray(cursos)) {
    return res.status(400).json({ error: 'Se requiere una lista de cursos válida' });
  }

  try {
    const user = await db.getUser(cedula);
    if (!user) {
      return res.status(404).json({ error: 'El usuario no existe' });
    }

    await db.updateUserCourses(cedula, cursos.map(id => parseInt(id)));
    res.json({ message: 'Matrícula de cursos actualizada con éxito' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCourses,
  getCoursesList,
  createCourse,
  getMetrics,
  getUsers,
  createStudent,
  updateStudentCourses
};
