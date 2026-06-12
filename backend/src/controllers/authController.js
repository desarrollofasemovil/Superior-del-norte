const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../repositories/dbRepository');
const { normalizeToUtf8, JWT_SECRET } = require('../middleware/auth');

async function login(req, res, next) {
  const { cedula, password } = req.body;

  if (!cedula || !password) {
    return res.status(400).json({ error: 'La cédula y la contraseña son obligatorias' });
  }

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
    next(err);
  }
}

async function register(req, res, next) {
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
    next(err);
  }
}

module.exports = {
  login,
  register
};
