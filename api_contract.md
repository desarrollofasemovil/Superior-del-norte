# API Contract - Instituto Superior del Norte LMS

This contract defines the interaction between the Frontend and Backend for the Instituto Superior del Norte LMS course platform.

---

## 🔒 Authentication

### 1. User Login
Authenticates the student using their Cédula (national ID) as the username and password.

- **Endpoint:** `POST /api/auth/login`
- **Headers:** 
  - `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "cedula": "123456789",
    "password": "password123"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOi...",
    "user": {
      "cedula": "123456789",
      "nombre_completo": "Juan Pérez",
      "rol": "estudiante"
    }
  }
  ```
- **Error Response (400 Bad Request / 401 Unauthorized):**
  ```json
  {
    "error": "Cédula o contraseña incorrectas"
  }
  ```

---

## 📚 Course Content & Progress

All endpoints below require the JWT token in the `Authorization` header:
`Authorization: Bearer <token>`

### 2. Fetch Course Modules
Returns the dynamic list of modules for the specified course. The number of modules is not fixed — it depends on how many modules were configured for that course in the database.

- **Endpoint:** `GET /api/course/content?courseId=X`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "titulo": "Módulo 1: Inocuidad alimentaria y BPM",
      "descripcion": "Descripción breve...",
      "orden": 1,
      "tipo_recurso": "video",
      "contenido": "<h3>Contenido HTML...</h3>",
      "url_recurso": "https://example.com/video.mp4"
    }
  ]
  ```

### 3. Fetch User Progress
Returns the progression percentage and a list of completed module IDs for the logged-in student. The percentage is calculated dynamically: `completados / total_modulos_del_curso * 100`.

- **Endpoint:** `GET /api/course/progress?courseId=X`
- **Success Response (200 OK):**
  ```json
  {
    "progreso_porcentaje": 50.0,
    "modulos_completados": [1, 2, 3, 4]
  }
  ```

### 4. Mark Module as Completed
Marks a specific module as read/completed.

- **Endpoint:** `POST /api/course/progress`
- **Request Body:**
  ```json
  {
    "modulo_id": 1
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Progreso actualizado con éxito",
    "progreso_porcentaje": 50.0,
    "modulos_completados": [1]
  }
  ```

---

## 📝 Exam & Evaluation

Requires `Authorization: Bearer <token>`.

### 5. Fetch Exam Questions
Fetches the exam questions from the `preguntas` table in the database for the specified course (excluding correct answers for security).

Access is blocked with HTTP 403 if the student has not completed 100% of the course modules.
If the student has failed 3+ times in the last 10 minutes, returns HTTP 429 with remaining wait time.

- **Endpoint:** `GET /api/exam/questions?courseId=X`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "pregunta": "¿Cuál es la temperatura mínima segura para cocinar pollo?",
      "opciones": {
        "A": "60°C (140°F)",
        "B": "70°C (158°F)",
        "C": "74°C (165°F)",
        "D": "80°C (176°F)"
      }
    }
  ]
  ```
- **Note:** The `respuesta_correcta` field is NEVER included in this response — it is filtered server-side.

### 6. Submit Exam
Submits the student's answers. The backend fetches correct answers from the `preguntas` table, calculates the score, records the attempt, and if the score is ≥ 80%, generates a certificate and sends it via email with the PDF attached.

- **Endpoint:** `POST /api/exam/submit`
- **Request Body:**
  ```json
  {
    "courseId": 1,
    "respuestas": {
      "1": "C",
      "2": "B",
      "3": "C"
    }
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "puntaje": 90.0,
    "aprobado": true,
    "intentos": 1,
    "message": "¡Felicidades! Has aprobado con 90%. Tu certificado ya está disponible."
  }
  ```
- **Side Effect on Approval:** The backend asynchronously sends a congratulations email with the official PDF certificate attached to the student's registered email.

---

## 🎓 Certification

Requires `Authorization: Bearer <token>`.

### 7. Get Certificate Detail
Returns certificate metadata for the authenticated student and specified course.

- **Endpoint:** `GET /api/certificate/detail?courseId=X`
- **Success Response (200 OK):**
  ```json
  {
    "codigo_verificacion": "ALIM-ABCD-1234",
    "usuario_cedula": "123456789",
    "curso_id": 1,
    "fecha_emision": "2026-06-12",
    "calificacion_obtenida": 90.0,
    "numero_certificado": "AS-2026-0001"
  }
  ```

### 8. Download Certificate
Generates and streams the PDF certificate for approved students.

- **Endpoint:** `GET /api/certificate/download?courseId=X`
- **Success Response (200 OK):**
  - Content-Type: `application/pdf`
  - Binary Stream (PDF)
- **Error Response (400 Bad Request):**
  ```json
  {
    "error": "Debe completar y aprobar el examen final con al menos un 80% para descargar su certificado."
  }
  ```

### 9. Verify Certificate (Public Route)
Allows anyone to verify the authenticity of a certificate using its verification code. Does not require authentication.

- **Endpoint:** `GET /api/certificate/verify/:codigo`
- **Success Response (200 OK):**
  ```json
  {
    "valido": true,
    "usuario": "Juan Pérez",
    "cedula": "123456789",
    "fecha_emision": "2026-06-12",
    "curso_titulo": "Manipulación de Alimentos",
    "numero_certificado": "AS-2026-0001"
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "valido": false,
    "error": "Código de verificación no válido"
  }
  ```

---

## 👤 Student Management & Course Creation (Admin Only)

All `/api/admin/*` endpoints require `Authorization: Bearer <token>` with `rol: administrador`.

### 10. Create Student
Creates a student account, records their metadata, registers their payment status, assigns them to courses, and optionally issues immediate certification (bypass flow).

- **Endpoint:** `POST /api/admin/users/create`
- **Request Body:**
  ```json
  {
    "cedula": "987654321",
    "nombre_completo": "María García",
    "password": "pass123",
    "cursos": [1],
    "fecha_expedicion_cedula": "2018-09-24",
    "municipio_expedicion_cedula": "Bucaramanga",
    "municipio_nacimiento": "Giron",
    "anio_nacimiento": 1996,
    "pago_realizado": 1,
    "certificar_inmediatamente": true
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "Estudiante creado y matriculado con éxito.",
    "user": {
      "cedula": "987654321",
      "nombre_completo": "María García",
      "rol": "estudiante",
      "fecha_registro": "2026-06-17",
      "fecha_expedicion_cedula": "2018-09-24",
      "municipio_expedicion_cedula": "Bucaramanga",
      "municipio_nacimiento": "Giron",
      "anio_nacimiento": 1996,
      "pago_realizado": 1
    }
  }
  ```
- **Bypass flow side effect:** If `certificar_inmediatamente` is `true`, it automatically creates progress at 100%, records an approved exam attempt, generates a certificate, and triggers a congratulations email with the PDF attachment without requiring the student to take the exam.

### 11. Create Course formativo
Creates a new course along with its modules. A course requires a mandatory price.

- **Endpoint:** `POST /api/admin/courses`
- **Request Body:**
  ```json
  {
    "titulo": "Buenas Prácticas de Higiene para Lácteos",
    "descripcion": "Curso intensivo de inocuidad...",
    "imagen_url": "https://images.unsplash.com/photo-...",
    "precio": 120000,
    "modulos": [
      {
        "titulo_modulo": "Introducción",
        "tipo_contenido": "Texto",
        "data_contenido": "Contenido del módulo..."
      }
    ]
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "message": "Curso creado con éxito junto con sus módulos.",
    "curso": {
      "id": 2,
      "titulo": "Buenas Prácticas de Higiene para Lácteos",
      "descripcion": "Curso intensivo de inocuidad...",
      "imagen_url": "https://images.unsplash.com/photo-...",
      "precio": 120000,
      "creado_en": "2026-06-17"
    }
  }
  ```

### 12. Download Student Certificate
Allows the administrator to directly download the PDF certificate of any student.

- **Endpoint:** `GET /api/admin/certificate/download?cedula=X&courseId=Y`
- **Success Response (200 OK):**
  - Content-Type: `application/pdf`
  - Binary Stream (PDF)

### 13. Update Course
Updates the basic metadata (title, description, mandatory price) of an existing course.

- **Endpoint:** `PUT /api/admin/courses/:id`
- **Request Body:**
  ```json
  {
    "titulo": "Manipulación de Alimentos Premium",
    "descripcion": "Curso actualizado con regulaciones 2026...",
    "precio": 130000
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Curso actualizado con éxito."
  }
  ```

### 14. Update Course Module
Updates the metadata (title, content type) and interactive HTML data of an existing module.

- **Endpoint:** `PUT /api/admin/courses/:courseId/modules/:moduleId`
- **Request Body:**
  ```json
  {
    "titulo_modulo": "Módulo 1: Inocuidad y BPM (Edición 2026)",
    "tipo_contenido": "Texto",
    "data_contenido": "{\"url\":\"https://example.com/audio.mp3\",\"text\":\"## Nuevo Contenido BPM\"}"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Módulo de curso actualizado con éxito."
  }
  ```

### 15. Update Student Profile
Updates the profile information of a student, including name, document details, birth year, and course payment status.

- **Endpoint:** `PUT /api/admin/users/:cedula`
- **Request Body:**
  ```json
  {
    "nombre_completo": "Juan Pérez Modificado",
    "fecha_expedicion_cedula": "2015-05-12",
    "municipio_expedicion_cedula": "Medellín",
    "municipio_nacimiento": "Itagüí",
    "anio_nacimiento": 1993,
    "pago_realizado": 1
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "message": "Perfil del estudiante actualizado con éxito."
  }
  ```


