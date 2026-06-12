# Documentación de API - Sistema AlimSafe CMS

Esta documentación describe el diseño de base de datos y la especificación de los endpoints del backend para el sistema dinámico de gestión de contenidos (CMS) multi-módulo de AlimSafe.

---

## 💾 1. Esquema de Base de Datos (Relacional)

El almacenamiento es compatible con SQLite (principal) y fallback de almacenamiento JSON. Soporta múltiples cursos dinámicos e independientes.

### Tabla `cursos`
Almacena la información principal de cada curso formativo.
- `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
- `titulo`: `TEXT` (Título principal)
- `descripcion`: `TEXT` (Resumen curricular)
- `imagen_url`: `TEXT` (URL de imagen de portada)
- `creado_en`: `TEXT` (Fecha de registro de curso, formato `YYYY-MM-DD`)

### Tabla `modulos`
Almacena los módulos formativos asociados a un curso específico mediante una relación de clave foránea. **El número de módulos es dinámico por curso** — el progreso del 100% se calcula comparando registros completados contra el total de módulos del curso.
- `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
- `curso_id`: `INTEGER` (Clave foránea que referencia a `cursos(id)` en cascada)
- `titulo_modulo`: `TEXT` (Nombre del módulo)
- `orden`: `INTEGER` (Secuencia ordinal del módulo dentro del curso)
- `tipo_contenido`: `TEXT` (Tipo: `Texto`, `Video`, `Audio`, `Imagen`)
- `data_contenido`: `TEXT` (JSON serializado `{"url": "...", "text": "..."}`)

### Tabla `preguntas`
Almacena las preguntas del examen para cada curso. Las preguntas se cargan desde esta tabla en los endpoints de examen.
- `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
- `curso_id`: `INTEGER` (Clave foránea → `cursos(id)` ON DELETE CASCADE)
- `pregunta`: `TEXT`
- `opcion_a`, `opcion_b`, `opcion_c`, `opcion_d`: `TEXT`
- `respuesta_correcta`: `TEXT` — `'A'`, `'B'`, `'C'` o `'D'`. **Nunca se expone al cliente.**

### Tabla `examenes`
Almacena los intentos y estados evaluativos del estudiante para cada curso.
- `usuario_cedula`: `TEXT`
- `curso_id`: `INTEGER`
- `intentos`: `INTEGER` (Cantidad de intentos realizados)
- `puntaje_maximo`: `REAL` (Máxima nota obtenida, de 0 a 100)
- `aprobado`: `INTEGER` (Estado de aprobación: `1` para aprobado, `0` para no aprobado)
- `fecha_ultimo_intento`: `TEXT` (ISO timestamp del último intento — usado para cooldown de 10 min)
- *Clave Primaria:* `(usuario_cedula, curso_id)`

### Tabla `certificados`
Almacena las credenciales de diploma oficial emitidas por curso aprobado.
- `codigo_verificacion`: `TEXT PRIMARY KEY` (Código de validez formato `ALIM-XXXX-XXXX`)
- `usuario_cedula`: `TEXT`
- `curso_id`: `INTEGER`
- `fecha_emision`: `TEXT`
- `calificacion_obtenida`: `REAL`
- `numero_certificado`: `TEXT UNIQUE` (Registro secuencial formato `AS-2026-XXXX`)

---

## ⚙️ 2. Especificación de Endpoints (Backend)

Todos los endpoints (excepto las rutas públicas y de autenticación) requieren el token JWT en el header: `Authorization: Bearer <token>`.


### A. Crear Curso y Módulos (Solo Administradores)
Crea de manera atómica un curso completo. Si la inserción del curso o de algún módulo falla, se ejecuta un rollback para evitar registros huérfanos.

- **Endpoint:** `POST /api/admin/courses`
- **Request Body:**
```json
{
  "titulo": "Buenas Prácticas de Higiene para Lácteos",
  "descripcion": "Curso intensivo de inocuidad en el procesamiento y empaque de productos lácteos.",
  "imagen_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150",
  "modulos": [
    {
      "titulo_modulo": "Introducción e Higiene Corporal",
      "tipo_contenido": "Texto",
      "data_contenido": "<h3>Teoría</h3><p>El manipulador de lácteos debe mantener las uñas cortas...</p>"
    },
    {
      "titulo_modulo": "Simulación de Enfriamiento",
      "tipo_contenido": "Video",
      "data_contenido": "https://www.w3schools.com/html/mov_bbb.mp4"
    }
  ]
}
```
- **Response (201 Created):**
```json
{
  "message": "Curso creado con éxito junto con sus módulos.",
  "curso": {
    "id": 2,
    "titulo": "Buenas Prácticas de Higiene para Lácteos",
    "descripcion": "Curso intensivo de inocuidad...",
    "imagen_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150",
    "creado_en": "2026-05-26",
    "modulos": [...]
  }
}
```

### B. Listar Cursos Matriculados (Estudiantes)
Obtiene todos los cursos en los que el estudiante se encuentra matriculado, incluyendo el porcentaje de avance calculado dinámicamente.

- **Endpoint:** `GET /api/student/courses`
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "titulo": "Manipulación de Alimentos",
    "descripcion": "Curso estándar de 3 horas...",
    "imagen_url": "https://images.unsplash.com...",
    "creado_en": "2026-05-20",
    "fecha_matricula": "2026-05-20",
    "progreso_porcentaje": 12.5
  }
]
```

### C. endpoints Refactorizados con `courseId`
Los siguientes endpoints ahora aceptan `courseId` como parámetro en el query o en el body de la petición para realizar el filtrado dinámico del contenido:

1. **Obtener Temario:** `GET /api/course/content?courseId=X`
   - Retorna los módulos formateados para el visualizador del frontend correspondientes al curso solicitado.
2. **Obtener Progreso:** `GET /api/course/progress?courseId=X`
   - Retorna el porcentaje y los IDs de los módulos completados del curso solicitado.
3. **Preguntas de Examen:** `GET /api/exam/questions?courseId=X`
   - Retorna el quiz. Bloquea el acceso si no se han completado todos los módulos específicos de dicho curso.
4. **Enviar Examen:** `POST /api/exam/submit` (Envía `{ respuestas, courseId }`)
   - Evalúa y guarda el intento de examen para el curso solicitado. Si aprueba (>= 80%), genera el certificado en base de datos.
5. **Descargar Certificado PDF:** `GET /api/certificate/download?courseId=X`
   - Genera dinámicamente el certificado en PDF inyectando el nombre del curso en lugar de estar quemado.

---

## 🎨 3. Previsualización Óptima de Imagen en Frontend

Para lograr una experiencia premium (sin placeholders estáticos ni errores visuales de carga de imagen), se provee el siguiente método de previsualización en tiempo real mediante React:

1. **Estado de error reactivo (`imageError`):** Se mantiene un estado booleano para rastrear si la URL de la imagen es válida y cargable.
2. **Manejador de error en tag de imagen (`onError`):** Al cambiar la URL, se asume inicialmente como válida (`imageError = false`). Si el navegador falla al cargar la imagen, el evento `onError` del tag `<img>` lo captura y activa `imageError = true`.
3. **Renderizado condicional (Fallback elegante con Gradiente HSL):** 
   - Si la URL está vacía o `imageError` es `true`, se renderiza una tarjeta de fondo degradado corporativo (`linear-gradient`) y un ícono estilizado de `BookOpen` de lucide-react.
   - Si la imagen carga con éxito, se despliega como portada de fondo con un overlay translúcido para asegurar la legibilidad del título superior.

### Ejemplo de Código Implementado:
```jsx
// En el componente de Creación del Curso
const [imagenUrl, setImagenUrl] = useState('');
const [imageError, setImageError] = useState(false);

const handleImageChange = (val) => {
  setImagenUrl(val);
  setImageError(false); // Resetear estado al cambiar URL
};

// En el Renderizado
<div className="cover-preview-container">
  {imagenUrl.trim() && !imageError ? (
    <img 
      src={imagenUrl} 
      alt="Portada" 
      onError={() => setImageError(true)} 
      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
    />
  ) : (
    <div className="fallback-gradient-cover">
      <BookOpen size={48} />
      <span>Sin Portada Dinámica</span>
    </div>
  )}
</div>
```
