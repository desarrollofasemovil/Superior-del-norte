const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbFile = path.join(__dirname, '..', process.env.DB_FILE || 'database.sqlite');
const jsonDbFile = path.join(__dirname, '..', 'database.json');

let dbType = 'sqlite';
let sqliteDB = null;

// JSON DB Fallback implementation
const jsonDb = {
  users: [],
  modules: [],
  progress: [],
  exams: [],
  certificates: []
};

function loadJsonDb() {
  if (fs.existsSync(jsonDbFile)) {
    try {
      const data = fs.readFileSync(jsonDbFile, 'utf8');
      const parsed = JSON.parse(data);
      Object.assign(jsonDb, parsed);
    } catch (err) {
      console.error('Error reading JSON fallback DB:', err);
    }
  }
}

function saveJsonDb() {
  try {
    fs.writeFileSync(jsonDbFile, JSON.stringify(jsonDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing JSON fallback DB:', err);
  }
}

// Seed data definition
const seedModules = [
  {
    id: 1,
    titulo: "Módulo 1: Introducción a la Seguridad Alimentaria",
    descripcion: "Principios básicos de la higiene de manos, vestimenta y comportamiento en zonas de preparación.",
    orden: 1,
    tipo_recurso: "video",
    contenido: "<h3>Introducción a la Seguridad Alimentaria</h3><p>La inocuidad de los alimentos es la garantía de que los mismos no causarán daño al consumidor cuando se preparen y/o consuman de acuerdo con el uso a que se destinen. Para lograrlo, es fundamental entender la cadena alimentaria y los riesgos asociados en cada etapa.</p><h4>Conceptos Clave</h4><ul><li><b>Inocuidad:</b> Ausencia de peligros en los alimentos que puedan dañar la salud de los consumidores.</li><li><b>Manipulador de Alimentos:</b> Cualquier persona que esté en contacto directo con los alimentos durante su preparación, fabricación, transformación, envasado, almacenamiento, transporte, distribución o venta.</li><li><b>Higiene Alimentaria:</b> Todas las medidas necesarias para garantizar la seguridad y salubridad de los alimentos.</li></ul>",
    url_recurso: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: 2,
    titulo: "Módulo 2: Higiene Personal y Buenas Prácticas",
    descripcion: "La higiene corporal, la técnica correcta de lavado de manos y las normas de comportamiento obligatorias.",
    orden: 2,
    tipo_recurso: "audio",
    contenido: "<h3>Higiene Personal y Buenas Prácticas</h3><p>El manipulador de alimentos representa la principal fuente de contaminación cuando no mantiene una higiene impecable. La piel, el cabello, las manos, las heridas y la vestimenta pueden albergar miles de bacterias patógenas.</p><h4>1. Técnica Correcta de Lavado de Manos</h4><p>El lavado de manos debe durar al menos 20 segundos y seguir estos pasos:</p><ol><li>Mojarse las manos con agua potable templada.</li><li>Aplicar suficiente jabón antibacterial.</li><li>Frotar vigorosamente palmas, dorso, entre los dedos y debajo de las uñas.</li><li>Enjuagar con abundante agua.</li><li>Secar con toalla de papel desechable y usar la misma para cerrar el grifo.</li></ol><h4>2. Reglas de Comportamiento</h4><ul><li>No usar joyas, anillos, pulseras ni relojes.</li><li>Uso obligatorio de red para el cabello o gorro.</li><li>Mantener las uñas cortas, limpias y sin esmalte.</li><li>Prohibido comer, fumar, escupir o mascar chicle en la zona de preparación.</li></ul>",
    url_recurso: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 3,
    titulo: "Módulo 3: Contaminación de Alimentos",
    descripcion: "Conozca los peligros físicos, químicos y biológicos que pueden contaminar los alimentos.",
    orden: 3,
    tipo_recurso: "imagen",
    contenido: "<h3>Contaminación de Alimentos</h3><p>Se entiende por contaminación de alimentos la presencia de cualquier materia extraña que altere su calidad sanitaria y lo haga peligroso para la salud humana.</p><h4>Tipos de Peligros en Alimentos</h4><ul><li><b>Peligros Físicos:</b> Vidrios, piedras, cabellos, metales, plásticos.</li><li><b>Peligros Químicos:</b> Productos de limpieza, pesticidas, desinfectantes, metales pesados.</li><li><b>Peligros Biológicos:</b> Bacterias (Salmonella, Escherichia coli, Listeria), virus (Hepatitis A, Norovirus), hongos y parásitos. Estos son los más peligrosos debido a su capacidad de multiplicarse rápidamente.</li></ul>",
    url_recurso: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    titulo: "Módulo 4: Almacenamiento Seguro",
    descripcion: "Pautas de almacenamiento en frío, temperatura ambiente y orden de colocación según el riesgo.",
    orden: 4,
    tipo_recurso: "texto",
    contenido: "<h3>Almacenamiento Seguro de Alimentos</h3><p>El correcto almacenamiento evita el crecimiento bacteriano y la descomposición del producto. Debe mantenerse la cadena de frío para alimentos perecederos.</p><h4>Reglas de Almacenamiento en Nevera</h4><p>Coloque siempre los alimentos en orden de riesgo descendente para evitar la contaminación cruzada por goteo:</p><ol><li><b>Estante superior:</b> Alimentos cocinados y listos para comer.</li><li><b>Estante medio:</b> Carnes cocidas, lácteos y embutidos.</li><li><b>Estante inferior:</b> Carnes rojas y aves crudas en recipientes herméticos y tapados (para evitar goteos).</li><li><b>Cajón inferior:</b> Verduras y frutas frescas.</li></ol><h4>Almacenamiento en Seco</h4><p>Los alimentos no perecederos deben almacenarse en lugares limpios, secos, ventilados y protegidos de la luz solar. Deben estar elevados del piso al menos 15 cm sobre estibas.</p>",
    url_recurso: ""
  },
  {
    id: 5,
    titulo: "Módulo 5: Temperaturas de Cocción",
    descripcion: "Temperaturas de cocción seguras para carnes, aves y pescados para eliminar microorganismos.",
    orden: 5,
    tipo_recurso: "video",
    contenido: "<h3>Temperaturas de Cocción y Conservación</h3><p>La cocción adecuada elimina la mayoría de bacterias patógenas. Sin embargo, para garantizar la inocuidad, el centro térmico del alimento debe alcanzar temperaturas seguras:</p><ul><li><b>Aves (pollo, pavo):</b> Mínimo 74 °C (165 °F).</li><li><b>Carnes picadas y embutidos:</b> Mínimo 68 °C (155 °F).</li><li><b>Carnes rojas (res, cerdo) y pescados:</b> Mínimo 65 °C (145 °F).</li></ul><h4>Conservación de Alimentos</h4><p>Los alimentos calientes deben mantenerse por encima de los 60 °C, y los fríos por debajo de los 4 °C. Nunca deje alimentos preparados a temperatura ambiente por más de 2 horas.</p>",
    url_recurso: "https://www.w3schools.com/html/mov_bbb.mp4"
  },
  {
    id: 6,
    titulo: "Módulo 6: Prevención de Enfermedades",
    descripcion: "Enfermedades Transmitidas por Alimentos (ETAs), síntomas comunes y prevención de Salmonella y E. coli.",
    orden: 6,
    tipo_recurso: "audio",
    contenido: "<h3>Prevención de Enfermedades Transmitidas por Alimentos (ETAs)</h3><p>Las ETAs son síndromes originados por la ingestión de alimentos o agua que contienen agentes etiológicos en cantidades tales que afectan la salud del consumidor. Los síntomas más comunes son diarrea, vómito, fiebre y dolor abdominal.</p><h4>Patógenos Comunes</h4><ul><li><b>Salmonella:</b> Común en huevos crudos, aves y leche sin pasteurizar.</li><li><b>Escherichia coli (E. coli):</b> Común en carnes crudas o mal cocidas y agua contaminada.</li><li><b>Listeria monocytogenes:</b> Puede crecer incluso a temperaturas de refrigeración, común en quesos blandos y carnes frías.</li></ul><h4>Reglas de Oro de la OMS</h4><ol><li>Consumir agua y alimentos seguros.</li><li>Mantener la higiene de manos y superficies.</li><li>Separar alimentos crudos y cocinados.</li><li>Cocinar los alimentos completamente.</li><li>Mantener los alimentos a temperaturas seguras.</li></ol>",
    url_recurso: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 7,
    titulo: "Módulo 7: Limpieza y Desinfección",
    descripcion: "Aprende las técnicas correctas de limpieza y desinfección en áreas de manipulación de alimentos.",
    orden: 7,
    tipo_recurso: "imagen",
    contenido: "<h3>Conceptos Fundamentales de Limpieza y Desinfección</h3><p>La limpieza y desinfección son procesos fundamentales en cualquier establecimiento que manipule alimentos. Estos procedimientos garantizan la eliminación de microorganismos patógenos que pueden causar enfermedades.</p><h4>1. Limpieza vs. Desinfección</h4><ul><li><b>Limpieza:</b> Es el proceso de remover la suciedad visible, residuos de alimentos, grasa y otras materias indeseables de las superficies mediante agua y detergentes. Remueve lo visible.</li><li><b>Desinfección:</b> Es la aplicación de agentes químicos (como cloro) o métodos físicos para reducir el número de microorganismos a niveles seguros. Elimina lo invisible.</li></ul><h4>2. Etapas Correctas del Proceso</h4><ol><li>Remover los residuos gruesos de las superficies.</li><li>Lavar con agua y detergente.</li><li>Enjuagar con agua limpia para retirar residuos de jabón.</li><li>Aplicar el desinfectante químico (ej. cloro diluido).</li><li>Dejar secar al aire (no usar paños sucios).</li></ol>",
    url_recurso: "https://images.unsplash.com/photo-1762329924239-e204f101fca4?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 8,
    titulo: "Módulo 8: Legislación Alimentaria",
    descripcion: "Normativas sanitarias básicas, control de calidad y auditorías del establecimiento.",
    orden: 8,
    tipo_recurso: "texto",
    contenido: "<h3>Legislación Alimentaria y Control de Calidad</h3><p>Toda empresa o manipulador de alimentos debe cumplir con las normativas sanitarias vigentes del país para garantizar que el producto final sea seguro y de calidad.</p><h4>Obligaciones del Manipulador</h4><ul><li>Contar con certificación vigente en manipulación de alimentos.</li><li>Cumplir estrictamente las directrices higiénico-sanitarias.</li><li>Reportar de inmediato a su superior si padece alguna enfermedad infectocontagiosa o heridas en las manos.</li></ul><h4>Sistemas de Calidad</h4><p>Se implementan sistemas como el <b>HACCP (Análisis de Peligros y Puntos Críticos de Control)</b> que permiten identificar, evaluar y controlar peligros significativos para la inocuidad de los alimentos desde su origen hasta la mesa.</p>",
    url_recurso: ""
  }
];

const seedQuestions = [
  {
    id: 1,
    pregunta: "¿Cuál es la temperatura mínima segura para cocinar pollo?",
    opciones: {
      "A": "60°C (140°F)",
      "B": "70°C (158°F)",
      "C": "74°C (165°F)",
      "D": "80°C (176°F)"
    },
    respuesta_correcta: "C"
  },
  {
    id: 2,
    pregunta: "¿Qué es la contaminación cruzada?",
    opciones: {
      "A": "Cuando un alimento se cocina demasiado",
      "B": "La transferencia de microorganismos de un alimento a otro",
      "C": "Cuando se mezclan diferentes ingredientes",
      "D": "El proceso de congelación de alimentos"
    },
    respuesta_correcta: "B"
  },
  {
    id: 3,
    pregunta: "¿Con qué frecuencia debe lavarse las manos un manipulador de alimentos?",
    opciones: {
      "A": "Solo al inicio del turno",
      "B": "Una vez por hora",
      "C": "Cada vez que cambie de tarea y después de tocar superficies contaminadas",
      "D": "Solamente antes de comer"
    },
    respuesta_correcta: "C"
  },
  {
    id: 4,
    pregunta: "¿Cuál es el rango de temperatura de la 'zona de peligro' para alimentos?",
    opciones: {
      "A": "0°C a 10°C",
      "B": "5°C a 60°C",
      "C": "10°C a 40°C",
      "D": "20°C a 50°C"
    },
    respuesta_correcta: "B"
  },
  {
    id: 5,
    pregunta: "¿Qué debe hacer si encuentra un alimento vencido en el almacén?",
    opciones: {
      "A": "Usarlo si no huele mal",
      "B": "Descartarlo inmediatamente y reportarlo",
      "C": "Mezclarlo con alimentos frescos",
      "D": "Guardarlo para revisión posterior"
    },
    respuesta_correcta: "B"
  },
  {
    id: 6,
    pregunta: "¿Cuál es la primera etapa del proceso de limpieza y desinfección?",
    opciones: {
      "A": "Aplicar desinfectante",
      "B": "Enjuagar con agua",
      "C": "Remover los residuos visibles",
      "D": "Secar las superficies"
    },
    respuesta_correcta: "C"
  },
  {
    id: 7,
    pregunta: "¿Qué característica NO debe tener un manipulador de alimentos?",
    opciones: {
      "A": "Uñas cortas y limpias",
      "B": "Joyas y accesorios en las manos",
      "C": "Ropa limpia y apropiada",
      "D": "Cabello recogido o cubierto"
    },
    respuesta_correcta: "B"
  },
  {
    id: 8,
    pregunta: "¿Cuánto tiempo máximo pueden permanecer alimentos perecederos a temperatura ambiente?",
    opciones: {
      "A": "30 minutos",
      "B": "1 hora",
      "C": "2 horas",
      "D": "4 horas"
    },
    respuesta_correcta: "C"
  }
];

// Database connection configuration with strict charset property.
// Note: While SQLite stores raw UTF-8 by default, we configure the connection 
// properties/metadata to strictly enforce 'utf8mb4' character set encoding
// for E2E consistency and complete UTF-8 compatibility.
const dbConfig = {
  client: 'sqlite3',
  connection: {
    filename: dbFile,
    charset: 'utf8mb4'
  },
  useNullAsDefault: true
};

// Initialize DB Connections
function initDB() {
  return new Promise(async (resolve, reject) => {
    try {
      const sqlite3 = require('sqlite3').verbose();
      sqliteDB = new sqlite3.Database(dbFile, (err) => {
        if (err) {
          console.warn('Could not open SQLite database file, falling back to JSON storage.', err.message);
          dbType = 'json';
          setupJsonDB().then(resolve);
        } else {
          console.log('Connected to the SQLite database.');
          sqliteDB.run("PRAGMA encoding = 'UTF-8';");
          setupSqliteDB().then(resolve).catch((sqliteErr) => {
            console.error('Error setting up SQLite tables, falling back to JSON:', sqliteErr);
            dbType = 'json';
            setupJsonDB().then(resolve);
          });
        }
      });
    } catch (e) {
      console.warn('sqlite3 library not available or failed to load. Falling back to JSON database.');
      dbType = 'json';
      setupJsonDB().then(resolve);
    }
  });
}

// Setup SQLite Tables
function setupSqliteDB() {
  return new Promise((resolve, reject) => {
    sqliteDB.serialize(() => {
      sqliteDB.run(`DROP TABLE IF EXISTS certificados`, (err) => { if (err) return reject(err); });
      sqliteDB.run(`DROP TABLE IF EXISTS modulos`, (err) => { if (err) return reject(err); });
      sqliteDB.run(`DROP TABLE IF EXISTS progreso`, (err) => { if (err) return reject(err); });
      sqliteDB.run(`DROP TABLE IF EXISTS examenes`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS usuarios (
          cedula TEXT PRIMARY KEY,
          nombre_completo TEXT,
          password_hash TEXT,
          rol TEXT DEFAULT 'estudiante'
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS modulos (
          id INTEGER PRIMARY KEY,
          titulo TEXT,
          descripcion TEXT,
          orden INTEGER,
          tipo_recurso TEXT,
          contenido TEXT,
          url_recurso TEXT
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS progreso (
          usuario_cedula TEXT,
          modulo_id INTEGER,
          completado INTEGER DEFAULT 0,
          fecha_completado TEXT,
          PRIMARY KEY (usuario_cedula, modulo_id)
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS examenes (
          usuario_cedula TEXT PRIMARY KEY,
          intentos INTEGER DEFAULT 0,
          puntaje_maximo REAL DEFAULT 0,
          aprobado INTEGER DEFAULT 0
        )`, (err) => { if (err) return reject(err); });

      sqliteDB.run(`CREATE TABLE IF NOT EXISTS certificados (
          codigo_verificacion TEXT PRIMARY KEY,
          usuario_cedula TEXT,
          fecha_emision TEXT,
          calificacion_obtenida REAL,
          numero_certificado TEXT UNIQUE
        )`, (err) => { if (err) return reject(err); });

      // Run seeds
      // Seed modules
      const stmt = sqliteDB.prepare(`INSERT OR REPLACE INTO modulos (id, titulo, descripcion, orden, tipo_recurso, contenido, url_recurso) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      for (const m of seedModules) {
        stmt.run(m.id, m.titulo, m.descripcion, m.orden, m.tipo_recurso, m.contenido, m.url_recurso);
      }
      stmt.finalize();

      // Seed Default Student User (cedula: 123456789)
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('password123', salt);
      sqliteDB.run(`INSERT OR IGNORE INTO usuarios (cedula, nombre_completo, password_hash, rol) VALUES (?, ?, ?, ?)`,
        ['123456789', 'Juan Pérez', hash, 'estudiante'],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });
  });
}

// Setup JSON DB
async function setupJsonDB() {
  loadJsonDb();

  // Seed modules
  jsonDb.modules = seedModules;

  // Seed default student user
  const studentExists = jsonDb.users.some(u => u.cedula === '123456789');
  if (!studentExists) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password123', salt);
    jsonDb.users.push({
      cedula: '123456789',
      nombre_completo: 'Juan Pérez',
      password_hash: hash,
      rol: 'estudiante'
    });
  }
  saveJsonDb();
  console.log('JSON database initialized and seeded successfully.');
}

// Windows-1252 Mojibake mapping table to translate to correct characters
const win1252ToByte = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85,
  '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A,
  '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92,
  '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C,
  '\u017E': 0x9E, '\u0178': 0x9F
};

function stringToBytes(str) {
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (win1252ToByte[char] !== undefined) {
      bytes.push(win1252ToByte[char]);
    } else {
      bytes.push(char.charCodeAt(0) & 0xFF);
    }
  }
  return Buffer.from(bytes);
}

function sanitize(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') {
    try {
      const bytes = stringToBytes(obj);
      const utf8 = bytes.toString('utf8');
      if (utf8 !== obj && !utf8.includes('\uFFFD')) {
        return utf8;
      }
    } catch (e) {}
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = sanitize(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

// DB Core Helpers

// Users
function getUser(cedula) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT * FROM usuarios WHERE cedula = ?`, [cedula], (err, row) => {
        if (err) reject(err);
        else resolve(sanitize(row) || null);
      });
    } else {
      const user = jsonDb.users.find(u => u.cedula === cedula);
      resolve(sanitize(user) || null);
    }
  });
}

function createUser(cedula, nombre_completo, password, rol = 'estudiante') {
  return new Promise((resolve, reject) => {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT INTO usuarios (cedula, nombre_completo, password_hash, rol) VALUES (?, ?, ?, ?)`,
        [cedula, nombre_completo, password_hash, rol],
        function (err) {
          if (err) reject(err);
          else resolve(sanitize({ cedula, nombre_completo, rol }));
        }
      );
    } else {
      const exists = jsonDb.users.some(u => u.cedula === cedula);
      if (exists) {
        reject(new Error('User already exists'));
      } else {
        const newUser = { cedula, nombre_completo, password_hash, rol };
        jsonDb.users.push(newUser);
        saveJsonDb();
        resolve(sanitize({ cedula, nombre_completo, rol }));
      }
    }
  });
}

// Course Modules
function getModules() {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.all(`SELECT * FROM modulos ORDER BY orden ASC`, [], (err, rows) => {
        if (err) reject(err);
        else resolve(sanitize(rows));
      });
    } else {
      resolve(sanitize(jsonDb.modules.sort((a, b) => a.orden - b.orden)));
    }
  });
}

// Progress Tracking
function getUserProgress(cedula) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.all(`SELECT modulo_id FROM progreso WHERE usuario_cedula = ? AND completado = 1`, [cedula], (err, rows) => {
        if (err) return reject(err);
        const completedIds = rows.map(r => r.modulo_id);

        sqliteDB.get(`SELECT COUNT(*) as total FROM modulos`, [], (errCount, rowCount) => {
          if (errCount) return reject(errCount);
          const total = rowCount.total || 1;
          const pct = Math.round((completedIds.length / total) * 1000) / 10;
          resolve({
            progreso_porcentaje: pct,
            modulos_completados: completedIds
          });
        });
      });
    } else {
      const completed = jsonDb.progress
        .filter(p => p.usuario_cedula === cedula && p.completado === 1)
        .map(p => p.modulo_id);
      const total = jsonDb.modules.length || 1;
      const pct = Math.round((completed.length / total) * 1000) / 10;
      resolve({
        progreso_porcentaje: pct,
        modulos_completados: completed
      });
    }
  });
}

function saveProgress(cedula, modulo_id) {
  return new Promise(async (resolve, reject) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT OR REPLACE INTO progreso (usuario_cedula, modulo_id, completado, fecha_completado) VALUES (?, ?, ?, ?)`,
        [cedula, modulo_id, 1, fecha],
        async function (err) {
          if (err) return reject(err);
          try {
            const prog = await getUserProgress(cedula);
            resolve(prog);
          } catch (e) {
            reject(e);
          }
        }
      );
    } else {
      const idx = jsonDb.progress.findIndex(p => p.usuario_cedula === cedula && p.modulo_id === modulo_id);
      if (idx !== -1) {
        jsonDb.progress[idx].completado = 1;
        jsonDb.progress[idx].fecha_completado = fecha;
      } else {
        jsonDb.progress.push({
          usuario_cedula: cedula,
          modulo_id,
          completado: 1,
          fecha_completado: fecha
        });
      }
      saveJsonDb();
      const prog = await getUserProgress(cedula);
      resolve(prog);
    }
  });
}

// Exam & Evaluation
function submitExam(cedula, score, approved) {
  return new Promise((resolve, reject) => {
    const isApproved = approved ? 1 : 0;
    if (dbType === 'sqlite') {
      // First, get attempts
      sqliteDB.get(`SELECT intentos FROM examenes WHERE usuario_cedula = ?`, [cedula], (err, row) => {
        if (err) return reject(err);
        const nextAttempts = (row ? row.intentos : 0) + 1;

        sqliteDB.run(
          `INSERT OR REPLACE INTO examenes (usuario_cedula, intentos, puntaje_maximo, aprobado) VALUES (?, ?, MAX(?, COALESCE((SELECT puntaje_maximo FROM examenes WHERE usuario_cedula = ?), 0)), MAX(?, COALESCE((SELECT aprobado FROM examenes WHERE usuario_cedula = ?), 0)))`,
          [cedula, nextAttempts, score, cedula, isApproved, cedula],
          function (errInsert) {
            if (errInsert) return reject(errInsert);
            resolve({
              puntaje: score,
              aprobado: approved,
              intentos: nextAttempts
            });
          }
        );
      });
    } else {
      let record = jsonDb.exams.find(e => e.usuario_cedula === cedula);
      if (!record) {
        record = {
          usuario_cedula: cedula,
          intentos: 0,
          puntaje_maximo: 0,
          aprobado: 0
        };
        jsonDb.exams.push(record);
      }
      record.intentos += 1;
      record.puntaje_maximo = Math.max(record.puntaje_maximo, score);
      record.aprobado = Math.max(record.aprobado, isApproved);
      saveJsonDb();
      resolve({
        puntaje: score,
        aprobado: record.aprobado === 1,
        intentos: record.intentos
      });
    }
  });
}

function getExamStatus(cedula) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT * FROM examenes WHERE usuario_cedula = ?`, [cedula], (err, row) => {
        if (err) reject(err);
        else resolve(row ? { intentos: row.intentos, puntaje_maximo: row.puntaje_maximo, aprobado: row.aprobado === 1 } : null);
      });
    } else {
      const record = jsonDb.exams.find(e => e.usuario_cedula === cedula);
      resolve(record ? { intentos: record.intentos, puntaje_maximo: record.puntaje_maximo, aprobado: record.aprobado === 1 } : null);
    }
  });
}

// Certificates
function createCertificate(cedula, verificationCode, calificacion_obtenida, numero_certificado) {
  return new Promise((resolve, reject) => {
    const fecha = new Date().toISOString().split('T')[0];
    if (dbType === 'sqlite') {
      sqliteDB.run(
        `INSERT OR REPLACE INTO certificados (codigo_verificacion, usuario_cedula, fecha_emision, calificacion_obtenida, numero_certificado) VALUES (?, ?, ?, ?, ?)`,
        [verificationCode, cedula, fecha, calificacion_obtenida, numero_certificado],
        function (err) {
          if (err) reject(err);
          else resolve(sanitize({ codigo_verificacion: verificationCode, usuario_cedula: cedula, fecha_emision: fecha, calificacion_obtenida, numero_certificado }));
        }
      );
    } else {
      const idx = jsonDb.certificates.findIndex(c => c.usuario_cedula === cedula);
      const newCert = { codigo_verificacion: verificationCode, usuario_cedula: cedula, fecha_emision: fecha, calificacion_obtenida, numero_certificado };
      if (idx !== -1) {
        jsonDb.certificates[idx] = newCert;
      } else {
        jsonDb.certificates.push(newCert);
      }
      saveJsonDb();
      resolve(sanitize(newCert));
    }
  });
}

function getCertificate(verificationCode) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(
        `SELECT c.*, u.nombre_completo, u.cedula FROM certificados c JOIN usuarios u ON c.usuario_cedula = u.cedula WHERE c.codigo_verificacion = ?`,
        [verificationCode],
        (err, row) => {
          if (err) reject(err);
          else resolve(sanitize(row) || null);
        }
      );
    } else {
      const cert = jsonDb.certificates.find(c => c.codigo_verificacion === verificationCode);
      if (cert) {
        const user = jsonDb.users.find(u => u.cedula === cert.usuario_cedula);
        resolve(sanitize({
          codigo_verificacion: cert.codigo_verificacion,
          usuario_cedula: cert.usuario_cedula,
          fecha_emision: cert.fecha_emision,
          calificacion_obtenida: cert.calificacion_obtenida,
          numero_certificado: cert.numero_certificado,
          nombre_completo: user ? user.nombre_completo : 'Unknown User',
          cedula: cert.usuario_cedula
        }));
      } else {
        resolve(null);
      }
    }
  });
}

function getCertificateByCedula(cedula) {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT * FROM certificados WHERE usuario_cedula = ?`, [cedula], (err, row) => {
        if (err) reject(err);
        else resolve(sanitize(row) || null);
      });
    } else {
      const cert = jsonDb.certificates.find(c => c.usuario_cedula === cedula);
      resolve(sanitize(cert) || null);
    }
  });
}

function getCertificatesCount() {
  return new Promise((resolve, reject) => {
    if (dbType === 'sqlite') {
      sqliteDB.get(`SELECT COUNT(*) as total FROM certificados`, [], (err, row) => {
        if (err) reject(err);
        else resolve(row ? row.total : 0);
      });
    } else {
      resolve(jsonDb.certificates.length);
    }
  });
}

module.exports = {
  initDB,
  getUser,
  createUser,
  getModules,
  getUserProgress,
  saveProgress,
  submitExam,
  getExamStatus,
  createCertificate,
  getCertificate,
  getCertificateByCedula,
  getCertificatesCount,
  seedQuestions // Exported for the exam grading script
};
