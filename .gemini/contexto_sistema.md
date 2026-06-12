# Contexto del Sistema - AlimSafe LMS

Este documento es la **Fuente de la Verdad** sobre el contexto de negocio, el flujo de usuario, el estado de implementación y la visión futura del LMS AlimSafe. Leerlo es obligatorio antes de cualquier cambio al proyecto.

---

## 1. Descripción General del Negocio

**AlimSafe** es una plataforma LMS orientada a la certificación oficial en **Manipulación Higiénica de Alimentos**. El estudiante paga una matrícula, accede a contenidos formativos en línea, presenta un examen y obtiene un certificado PDF con código de verificación público.

---

## 2. Flujo de Usuario del Estudiante

```
Acceso (Login) → Dashboard (mis cursos) → CourseViewer (módulos dinámicos)
→ Exam (≥80% para aprobar) → Certificate (descarga PDF + email automático)
```

1. **Matrícula Manual:** El admin crea la cuenta del estudiante y lo matricula en cursos desde el panel `/admin/dashboard`. Al crear la cuenta, el estudiante recibe un **email automático de bienvenida** con sus credenciales de acceso.
2. **Consumo de Módulos:** El número de módulos es dinámico por curso (configurable desde el panel admin). El simulador multimedia del frontend avanza el progreso. El **100% de módulos completados** (calculado dinámicamente contra la tabla `modulos`) desbloquea el examen.
3. **Examen Final:** Preguntas de opción múltiple almacenadas en la tabla `preguntas`. Mínimo 80% para aprobar. Calificación y validación son 100% en el backend. Cooldown de 10 minutos tras 3 intentos fallidos.
4. **Certificado:** PDF generado por `pdfkit` con número correlativo (`AS-YYYY-####`), código único (`ALIM-XXXX-XXXX`) y URL de verificación pública (`/verify/:code`). Al aprobar, el sistema envía automáticamente un **email de felicitaciones** con el certificado PDF adjunto.

---

## 3. Estado Actual del Proyecto (Junio 2026)

### Backend (`/backend`)
- **Stack:** Node.js + Express.
- **Arquitectura:** Capas separadas — `routes/`, `controllers/`, `services/`, `repositories/`. El servidor `server.js` solo configura Express y registra los routers.
- **Base de Datos:** SQLite3 (`database.sqlite`) con fallback JSON. Tablas: `usuarios`, `cursos`, `matriculas`, `modulos`, `progreso`, `examenes`, `certificados`, `preguntas`.
- **Autenticación:** JWT firmado con `jsonwebtoken`. Dos roles: `estudiante` y `administrador`.
- **Generación PDF:** `pdfkit` en `src/services/pdfService.js`. Orientación horizontal, logotipo, firma del Comité. URL de verificación configurable vía `FRONTEND_URL` en `.env`.
- **Contenido:** El curso de Manipulación de Alimentos tiene **8 módulos** sembrados en DB con contenido HTML estructurado (migrado desde `Información curso de manipulación.txt`). Nuevos cursos pueden tener cualquier número de módulos.
- **Examen:** Las preguntas están en la tabla `preguntas` en BD. El endpoint `GET /api/exam/questions?courseId=X` filtra `respuesta_correcta`. La calificación se hace consultando la BD con `getExamQuestionsWithAnswers()`.
- **Notificaciones Email:** `src/services/emailService.js` usa Nodemailer. En desarrollo (sin SMTP configurado), usa Ethereal Email y muestra el URL de previsualización en consola.
- **Endpoints Clave:**
  - `POST /api/auth/login` — JWT para estudiante y admin.
  - `GET /api/student/courses` — Cursos matriculados del estudiante.
  - `GET /api/course/content?courseId=` — Módulos del curso.
  - `GET /api/course/progress?courseId=` — Progreso del estudiante.
  - `POST /api/course/progress` — Marcar módulo completado.
  - `GET /api/exam/questions?courseId=` — Preguntas del examen (sin respuestas).
  - `POST /api/exam/submit` — Evalúa respuestas, emite certificado y envía email con PDF adjunto.
  - `GET /api/certificate/detail?courseId=` — Datos del certificado.
  - `GET /api/certificate/download?courseId=` — PDF del certificado.
  - `GET /api/certificate/verify/:code` — Verificación pública (no requiere auth).
  - `GET/POST /api/admin/*` — Métricas, CRUD de estudiantes (con email bienvenida), matrícula, creación de cursos.

### Frontend (`/frontend`)
- **Stack:** React 19 + Vite 8.
- **Enrutamiento:** React Router DOM (`HashRouter`). Las rutas declarativas son la fuente de verdad de la navegación.
  - `/login`, `/admin/login` — Autenticación.
  - `/dashboard` — Vista del estudiante con cursos y progreso.
  - `/course/:courseId` — CourseViewer con módulos.
  - `/course/:courseId/exam` — Examen final.
  - `/certificate/:courseId` — Vista del diploma.
  - `/admin/dashboard`, `/admin/create-course` — Panel administrativo.
  - `/verify`, `/verify/:code` — Verificación pública de certificados.
- **Estado Global:** `AppContext.jsx` (Context API). Centraliza autenticación, cursos del estudiante, módulos, progreso, examen y operaciones de admin.
- **Inicialización de Estado:** El `user` y `currentView` se inicializan sincrónicamente con lazy `useState` (decodificando el JWT del `localStorage`). **No hay `useEffect` de re-decodificación JWT** para evitar loops de renderizado.
- **Fetch Functions:** Estabilizadas con `useCallback` para que sus referencias no cambien en cada render.
- **Vistas Implementadas:** `Login`, `AdminLogin`, `Dashboard`, `CourseViewer`, `Exam`, `Certificate`, `AdminDashboard`, `CreateCourseScreen`, `VerifyCertificate`.

---

## 4. Correcciones Críticas Históricas

> [!IMPORTANT]
> **Bucle Infinito de Peticiones API (Resuelto):**
> Se resolvió un bucle donde `useEffect([token])` recreaba el objeto `user` en cada render, desencadenando `fetchStudentCourses()` cientos de veces/segundo.
>
> **Correcciones aplicadas:**
> - Eliminado el `useEffect([token])` de re-decodificación JWT.
> - `useEffect` usa `user?.cedula` y `user?.rol` (primitivos) en las dependencias.
> - Funciones de fetch estabilizadas con `useCallback`.
> - Eliminada la sincronización bidireccional en `App.jsx`.
> - Todos los componentes usan `useNavigate()`. **`setCurrentView` ya no navega.**

> [!IMPORTANT]
> **Bug DROP TABLE en Arranque (Resuelto):**
> `setupSqliteDB()` ejecutaba `DROP TABLE IF EXISTS` antes de crear las tablas, borrando todos los datos en cada reinicio del servidor.
>
> **Corrección aplicada:**
> - Eliminados todos los `DROP TABLE`.
> - Se usa `CREATE TABLE IF NOT EXISTS` + `INSERT OR IGNORE` para seeding idempotente.
> - Los datos de usuarios, matrículas, progreso y certificados persisten entre reinicios.

---

## 5. Visión de Negocio Futura

### Landing Page Pública
- Diseño premium orientado a conversión, con información del curso, testimonios y botón de matrícula.
- Flujo: Landing → Checkout (Mercado Pago) → Registro de credenciales → Acceso al LMS.

### Integración de Pagos
- **Mercado Pago (Checkout Pro/API):** Pagos locales con tarjetas, PSE (Colombia), Pix (Brasil).
- **Webhooks Post-Pago:** Endpoint en backend para escuchar `payment.approved` → matricular automáticamente → enviar credenciales por email.

---

## 6. Brechas Activas (Restantes)

> [!WARNING]
> **Brechas Conocidas:**
> 1. **Matrícula Solo Manual:** No existe flujo de auto-registro comercial. Los estudiantes solo se crean desde el panel del admin.
> 2. **Mojibake Residual:** Los correctores `decodeMojibake` en frontend y `normalizeToUtf8` en backend son parches. La causa raíz es la codificación de la conexión SQLite. Requiere configurar `pragma encoding = 'UTF-8'` y retirar los helpers progresivamente.
> 3. **Cooldown de Examen:** Implementado (10 min / 3 fallos), pero sin feedback visual del tiempo restante en el frontend.
> 4. **Email de estudiante hardcodeado:** `emailService.js` usa `${cedula}@alimsafe-student.co` como destinatario. Para producción se debe agregar campo `email` a la tabla `usuarios` y formulario de registro.
