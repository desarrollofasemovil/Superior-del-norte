# API Contract - AlimentosLMS

This contract defines the interaction between the Frontend and Backend for the AlimentosLMS course platform.

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
Returns the modules list of the 3-hour Manipulación de Alimentos course.

- **Endpoint:** `GET /api/course/content`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "titulo": "Módulo 1: Higiene Personal y Hábitos del Manipulador",
      "descripcion": "Principios básicos de la higiene de manos, vestimenta y comportamiento en zonas de preparación.",
      "orden": 1,
      "tipo_recurso": "video",
      "contenido": "La higiene personal es el primer escudo contra la contaminación de los alimentos...",
      "url_recurso": "/media/modulo1.mp4"
    },
    {
      "id": 2,
      "titulo": "Módulo 2: Enfermedades Transmitidas por Alimentos (ETAs)",
      "descripcion": "Conozca los virus, bacterias y parásitos comunes y cómo prevenirlos.",
      "orden": 2,
      "tipo_recurso": "audio",
      "contenido": "Las ETAs representan un riesgo de salud pública masivo...",
      "url_recurso": "/media/modulo2.mp3"
    }
  ]
  ```

### 3. Fetch User Progress
Returns the progression percentage and a list of completed module IDs for the logged-in student.

- **Endpoint:** `GET /api/course/progress`
- **Success Response (200 OK):**
  ```json
  {
    "progreso_porcentaje": 50.0,
    "modulos_completados": [1]
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
Fetches the dynamic quiz questions (excluding correct answers for security).

- **Endpoint:** `GET /api/exam/questions`
- **Success Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "pregunta": "¿Cuál es la temperatura mínima recomendada para la cocción de carne de ave?",
      "opciones": {
        "A": "60 °C",
        "B": "74 °C",
        "C": "85 °C",
        "D": "50 °C"
      }
    }
  ]
  ```

### 6. Submit Exam
Submits the user's answers, calculates the score (out of 100), records the attempt, and saves the passing status (pass mark: >= 80).

- **Endpoint:** `POST /api/exam/submit`
- **Request Body:**
  ```json
  {
    "respuestas": {
      "1": "B",
      "2": "A"
    }
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "puntaje": 90.0,
    "aprobado": true,
    "intentos": 1,
    "message": "Examen evaluado exitosamente. ¡Felicidades, has aprobado!"
  }
  ```

---

## 🎓 Certification

Requires `Authorization: Bearer <token>`.

### 7. Download Certificate
Downloads the generated PDF certificate for approved users.

- **Endpoint:** `GET /api/certificate/download`
- **Success Response (200 OK):**
  - Content-Type: `application/pdf`
  - Binary Stream (PDF)
- **Error Response (400 Bad Request / 403 Forbidden):**
  ```json
  {
    "error": "Debe aprobar el examen final antes de generar un certificado"
  }
  ```

### 8. Verify Certificate (Public Route)
Allows anyone to verify the authenticity of a certificate using its verification code.

- **Endpoint:** `GET /api/certificate/verify/:codigo`
- **Success Response (200 OK):**
  ```json
  {
    "valido": true,
    "usuario": "Juan Pérez",
    "cedula": "123456789",
    "fecha_emision": "2026-05-20"
  }
  ```
- **Error Response (404 Not Found):**
  ```json
  {
    "valido": false,
    "error": "Código de verificación no válido"
  }
  ```
