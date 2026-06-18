const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFile = path.join(__dirname, '..', process.env.DB_FILE || 'database.sqlite');
const db = new sqlite3.Database(dbFile);

function cleanMecanica() {
  let content = fs.readFileSync(path.join(__dirname, '../../../Contenidos/mecanica basica automotriz.txt'), 'utf8');
  
  // ETAPA 1.1: Eliminación de Índices de Referencia
  content = content.replace(/\[[\d\s,\-]+\]/g, '');
  
  // ETAPA 1.2: Saneamiento de Caracteres Especiales
  content = content.replace(/\s+\./g, '.');
  content = content.replace(/\s+,/g, ',');

  // Módulo delimiter is already "## Módulo X:"
  return content;
}

function cleanPrimerosAuxilios() {
  let content = fs.readFileSync(path.join(__dirname, '../../../Contenidos/Primeros auxilios.txt'), 'utf8');
  
  // ETAPA 1.1: Eliminación de Índices de Referencia
  content = content.replace(/\[.*?\]/g, '');

  // ETAPA 1.2: Saneamiento de Caracteres Especiales
  content = content.replace(/\n\s*\.\n/g, '.\n');
  content = content.replace(/\n\s*\./g, '.');
  
  // ETAPA 1.3: Conversión a Formato Markdown
  content = content.replace(/^(Módulo \d+:.*)/gm, '## $1');
  
  // Emphasize important terms (subheadings)
  // We can see things like "Conducta P.A.S. (Proteger, Avisar, Socorrer)" followed by text.
  // Actually, standardizing Módulo tags is enough for module separation.
  
  return content;
}

function extractModules(content) {
  // We split the content by "## Módulo".
  const parts = content.split(/^## Módulo \d+:/m);
  
  // The first part is usually intro/description. The rest are the modules.
  const intro = parts[0].trim();
  const modules = parts.slice(1).map((modText, index) => {
    // The split removed the '## Módulo X:', we might want to keep the title or extract it.
    // Let's use a regex that keeps the delimiter to extract titles properly.
    return modText;
  });
  
  return { intro, modules };
}

function extractModulesWithTitles(content) {
  const regex = /^(## Módulo \d+:\s*(.*))$/gm;
  let match;
  const indices = [];
  while ((match = regex.exec(content)) !== null) {
    indices.push({
      index: match.index,
      title: match[2].trim() // The title after "Módulo X:"
    });
  }

  const modules = [];
  for (let i = 0; i < indices.length; i++) {
    const start = indices[i].index;
    const end = (i + 1 < indices.length) ? indices[i + 1].index : content.length;
    // Remove the heading from the content to store it cleanly, or we can keep it.
    // Markdown formatting requires headers. We can keep it or use the title for DB.
    // Since 'data_contenido' might be rendered directly as Markdown, let's keep the markdown content.
    let moduleContent = content.substring(start, end).trim();
    // Convert ## Módulo X: Title to ### Title for consistency if needed, but keeping ## is fine.
    
    // As per instruction "## para temas principales y ### para subtemas", let's leave it.
    // We will parse out lines starting with "**" or such if needed, but raw MD is great.
    
    // We need to convert some markdown lists to actual HTML if the frontend expects HTML.
    // WAIT: The user said "Insertar el contenido formateado en Markdown... listo para que el componente frontend del LMS lo interprete". So we store MD directly!
    // We just wrap it in JSON.
    
    modules.push({
      titulo_modulo: indices[i].title,
      orden: i + 1,
      tipo_contenido: 'texto',
      contenido: moduleContent
    });
  }
  return modules;
}

async function migrate() {
  console.log("Iniciando limpieza de contenidos...");
  
  const mecanicaRaw = cleanMecanica();
  const primerosAuxiliosRaw = cleanPrimerosAuxilios();

  const mecanicaMods = extractModulesWithTitles(mecanicaRaw);
  const primerosAuxiliosMods = extractModulesWithTitles(primerosAuxiliosRaw);

  console.log(`Extraídos ${mecanicaMods.length} módulos de Mecánica Básica.`);
  console.log(`Extraídos ${primerosAuxiliosMods.length} módulos de Primeros Auxilios.`);

  db.serialize(() => {
    db.run("PRAGMA encoding = 'UTF-8';");
    db.run("BEGIN TRANSACTION;");

    // Insert or update courses
    // 4 -> Mecánica Básica
    // 5 -> Primeros Auxilios
    const stmtCursos = db.prepare(`INSERT OR IGNORE INTO cursos (id, titulo, descripcion, imagen_url, creado_en) VALUES (?, ?, ?, ?, ?)`);
    
    stmtCursos.run(4, 'Curso de Mecánica Básica', 'Capacitación práctica en diagnóstico preventivo, sistemas del vehículo, cambio de neumáticos y mantenimiento esencial para conductores.', '', new Date().toISOString().split('T')[0]);
    
    stmtCursos.run(5, 'Curso de Primeros Auxilios', 'Formación vital en atención prehospitalaria, reanimación cardiopulmonar (RCP), manejo de heridas y respuesta inmediata ante emergencias médicas.', '', new Date().toISOString().split('T')[0]);
    
    stmtCursos.finalize();

    // Clean existing modules for these courses to avoid duplicates during testing
    db.run(`DELETE FROM modulos WHERE curso_id IN (4, 5)`);

    const stmtModulos = db.prepare(`INSERT INTO modulos (curso_id, titulo_modulo, orden, tipo_contenido, data_contenido) VALUES (?, ?, ?, ?, ?)`);

    // Insert Mecanica
    for (const mod of mecanicaMods) {
      const data_contenido = JSON.stringify({ text: mod.contenido });
      stmtModulos.run(4, mod.titulo_modulo, mod.orden, mod.tipo_contenido, data_contenido);
    }

    // Insert Primeros Auxilios
    for (const mod of primerosAuxiliosMods) {
      const data_contenido = JSON.stringify({ text: mod.contenido });
      stmtModulos.run(5, mod.titulo_modulo, mod.orden, mod.tipo_contenido, data_contenido);
    }

    stmtModulos.finalize();

    db.run("COMMIT;", (err) => {
      if (err) {
        console.error("Error committing transaction:", err);
      } else {
        console.log("Migración completada exitosamente.");
      }
      db.close();
    });
  });
}

migrate();
