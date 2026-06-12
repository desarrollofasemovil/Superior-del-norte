/**
 * emailService.js — AlimSafe LMS
 *
 * Capa de servicio para envío de emails transaccionales.
 *
 * Modo de operación:
 *  - Si SMTP_USER y SMTP_PASS están vacíos en .env → usa Ethereal Email (pruebas).
 *    El link de previsualización se imprime en consola. No se envían emails reales.
 *  - Si SMTP_USER y SMTP_PASS están configurados → usa el transporte SMTP definido
 *    en las variables de entorno (Gmail, SendGrid, Mailtrap, etc.).
 *
 * Funciones exportadas:
 *  - sendWelcomeEmail(studentData)           → Disparado al crear un estudiante
 *  - sendCertificateEmail(studentData, pdfBuffer, courseTitle) → Disparado al aprobar
 */

'use strict';

const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Crea y devuelve un transporte Nodemailer.
 * Si no hay credenciales SMTP configuradas, genera automáticamente
 * una cuenta de prueba en Ethereal Email.
 * @returns {Promise<nodemailer.Transporter>}
 */
async function getTransporter() {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  // Si hay credenciales SMTP configuradas, usar el transporte real
  if (smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }

  // Modo de desarrollo: crear cuenta efímera en Ethereal
  console.log('[emailService] SMTP_USER no configurado. Generando cuenta Ethereal para pruebas...');
  const testAccount = await nodemailer.createTestAccount();
  console.log(`[emailService] Cuenta Ethereal generada: ${testAccount.user}`);

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

/**
 * Genera el PDF del certificado en un Buffer en memoria
 * (en lugar de streamearlo directamente a HTTP, como hace pdfService.js)
 * para poder adjuntarlo a un email.
 * @param {Object} data - Datos del certificado
 * @returns {Promise<Buffer>}
 */
function generateCertificatePDFBuffer(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'letter',
      layout: 'landscape',
      margins: { top: 40, bottom: 40, left: 40, right: 40 }
    });

    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // 1. Bordes exteriores
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
       .lineWidth(4)
       .stroke('#0F2C59');

    doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56)
       .lineWidth(1.5)
       .stroke('#F0A500');

    // 2. Esquinas decorativas
    doc.rect(24, 24, 20, 20).lineWidth(1).stroke('#F0A500');
    doc.rect(doc.page.width - 44, 24, 20, 20).lineWidth(1).stroke('#F0A500');
    doc.rect(24, doc.page.height - 44, 20, 20).lineWidth(1).stroke('#F0A500');
    doc.rect(doc.page.width - 44, doc.page.height - 44, 20, 20).lineWidth(1).stroke('#F0A500');

    // 3. Logo oficial
    const logoPath = path.join(__dirname, '..', 'logoNormal.jpeg');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 50, 42, { width: 100 });
    }

    // 4. Encabezado
    doc.y = 150;
    doc.fontSize(28).font('Times-Bold').fillColor('#0F2C59')
       .text('CERTIFICADO DE APROBACIÓN', { align: 'center' });

    doc.moveDown(0.1);
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#F0A500')
       .text(`REGISTRO N°: ${data.numero_certificado}`, { align: 'center', characterSpacing: 1 });

    doc.moveDown(0.1);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#0F2C59')
       .text((data.curso_titulo || 'CURSO DE MANIPULACIÓN HIGIÉNICA DE ALIMENTOS').toUpperCase(), { align: 'center', characterSpacing: 1.5 });

    doc.moveDown(0.8);
    doc.fontSize(13).font('Helvetica').fillColor('#475569')
       .text('Se otorga el presente documento de certificación y participación a:', { align: 'center' });

    // 5. Nombre del estudiante
    doc.moveDown(0.6);
    doc.fontSize(28).font('Helvetica-Bold').fillColor('#4E9F3D')
       .text(data.nombre_completo.toUpperCase(), { align: 'center' });

    // 6. Cédula
    doc.moveDown(0.3);
    doc.fontSize(13).font('Helvetica').fillColor('#1E293B')
       .text(`Cédula de Identidad N°: ${data.cedula}`, { align: 'center' });

    // 7. Descripción del curso
    doc.moveDown(0.8);
    doc.fontSize(11).font('Helvetica').fillColor('#475569')
       .text('Por haber cumplido con todos los requisitos académicos del curso y aprobado satisfactoriamente', { align: 'center' });
    doc.text('la evaluación de conocimientos sobre normas higiénico-sanitarias vigentes.', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica-Oblique').fillColor('#64748B')
       .text('Intensidad Horaria: 3 Horas Lectivas', { align: 'center' });

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#4E9F3D')
       .text(`Calificación Obtenida: ${data.calificacion_obtenida}%`, { align: 'center' });

    // 8. Firmas y metadatos
    doc.moveDown(1.0);
    const yStart = doc.y;

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#475569')
       .text('Fecha de Emisión:', 100, yStart, { width: 250, align: 'center' });
    doc.fontSize(10).font('Helvetica').fillColor('#1E293B')
       .text(data.fecha_emision, 100, yStart + 18, { width: 250, align: 'center' });

    const rightColX = doc.page.width - 350;
    doc.moveTo(rightColX, yStart + 12).lineTo(rightColX + 250, yStart + 12).lineWidth(1).stroke('#94A3B8');
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#475569')
       .text('Comité de Calidad y Sanidad', rightColX, yStart + 18, { width: 250, align: 'center' });
    doc.fontSize(9).font('Helvetica-Oblique').fillColor('#64748B')
       .text('AlimentosLMS Certificador', rightColX, yStart + 32, { width: 250, align: 'center' });

    // 9. Footer con código de verificación
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    doc.fontSize(9).font('Courier').fillColor('#64748B')
       .text(`CÓDIGO DE VERIFICACIÓN: ${data.codigo_verificacion}`, 40, doc.page.height - 65, { align: 'center' });
    doc.text(`Verifique en: ${frontendUrl}/#verify=${data.codigo_verificacion}`, 40, doc.page.height - 50, { align: 'center' });

    doc.end();
  });
}

/**
 * Envía un email de bienvenida al estudiante recién creado.
 * Incluye sus credenciales de acceso (cédula y contraseña provisional).
 * Nota: Se llama con fire-and-forget (sin await) desde el controlador.
 *
 * @param {Object} studentData
 * @param {string} studentData.cedula
 * @param {string} studentData.nombre_completo
 * @param {string} studentData.password   - Contraseña en texto plano (antes de hashear)
 * @param {string[]} studentData.cursos   - IDs de cursos matriculados
 */
async function sendWelcomeEmail(studentData) {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || 'AlimSafe LMS <noreply@alimsafe.co>';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const mailOptions = {
      from: fromAddress,
      to: `"${studentData.nombre_completo}" <${studentData.cedula}@alimsafe-student.co>`,
      subject: '¡Bienvenido a AlimSafe LMS! Tus credenciales de acceso',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:30px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#0F2C59 0%,#1a4a8a 100%);padding:40px 40px 30px;text-align:center;">
                    <h1 style="color:#F0A500;margin:0;font-size:28px;font-weight:800;letter-spacing:1px;">AlimSafe LMS</h1>
                    <p style="color:#a8c4e0;margin:8px 0 0;font-size:14px;">Plataforma de Certificación en Manipulación de Alimentos</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h2 style="color:#0F2C59;margin:0 0 16px;font-size:22px;">¡Bienvenido, ${studentData.nombre_completo}! 👋</h2>
                    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
                      Tu cuenta de estudiante ha sido creada exitosamente en la plataforma <strong>AlimSafe LMS</strong>.
                      A continuación encontrarás tus credenciales de acceso. Guárdalas en un lugar seguro.
                    </p>
                    <!-- Credentials Box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:10px;margin-bottom:28px;">
                      <tr>
                        <td style="padding:24px;">
                          <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Cédula de acceso</p>
                          <p style="margin:0 0 18px;color:#0F2C59;font-size:22px;font-weight:700;font-family:monospace;">${studentData.cedula}</p>
                          <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Contraseña provisional</p>
                          <p style="margin:0;color:#0F2C59;font-size:22px;font-weight:700;font-family:monospace;">${studentData.password}</p>
                        </td>
                      </tr>
                    </table>
                    <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 28px;">
                      ⚠️ Por razones de seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
                    </p>
                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${frontendUrl}" style="display:inline-block;background:linear-gradient(135deg,#4E9F3D,#3d8030);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                            Acceder a la Plataforma →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="color:#94a3b8;font-size:12px;margin:0;">
                      Este email fue generado automáticamente por AlimSafe LMS.<br>
                      Si no esperabas este mensaje, por favor ignóralo.
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] ✅ Email de bienvenida enviado para cédula ${studentData.cedula}`);

    // En modo Ethereal, imprime el URL de previsualización
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[emailService] 📧 PREVIEW (Ethereal): ${previewUrl}`);
    }
  } catch (err) {
    console.error(`[emailService] ❌ Error enviando email de bienvenida para ${studentData.cedula}:`, err.message);
  }
}

/**
 * Envía un email de felicitaciones al estudiante que aprobó el examen,
 * adjuntando el certificado PDF oficial.
 * Nota: Se llama con fire-and-forget (sin await) desde el controlador.
 *
 * @param {Object} studentData
 * @param {string} studentData.cedula
 * @param {string} studentData.nombre_completo
 * @param {Object} certData - Datos del certificado para generar el PDF
 * @param {string} courseTitle - Título del curso
 */
async function sendCertificateEmail(studentData, certData, courseTitle) {
  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || 'AlimSafe LMS <noreply@alimsafe.co>';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Generar el PDF del certificado en memoria para adjuntarlo
    const pdfBuffer = await generateCertificatePDFBuffer(certData);

    const mailOptions = {
      from: fromAddress,
      to: `"${studentData.nombre_completo}" <${studentData.cedula}@alimsafe-student.co>`,
      subject: `🎓 ¡Felicitaciones! Tu certificado de "${courseTitle}" está listo`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:30px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#4E9F3D 0%,#2d7a1f 100%);padding:40px 40px 30px;text-align:center;">
                    <div style="font-size:48px;margin-bottom:12px;">🎓</div>
                    <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:800;">¡Certificado Emitido!</h1>
                    <p style="color:#b7e8a8;margin:8px 0 0;font-size:14px;">Has completado exitosamente el curso</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h2 style="color:#0F2C59;margin:0 0 16px;font-size:20px;">¡Felicitaciones, ${studentData.nombre_completo}!</h2>
                    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
                      Has aprobado exitosamente la evaluación del curso 
                      <strong style="color:#0F2C59;">"${courseTitle}"</strong> 
                      con una calificación de <strong style="color:#4E9F3D;">${certData.calificacion_obtenida}%</strong>.
                    </p>
                    <p style="color:#475569;line-height:1.7;margin:0 0 24px;">
                      Tu certificado oficial está adjunto en este correo en formato PDF. También puedes descargarlo
                      directamente desde la plataforma o verificar su autenticidad en cualquier momento.
                    </p>
                    <!-- Certificate Info -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px solid #86efac;border-radius:10px;margin-bottom:28px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <table width="100%">
                            <tr>
                              <td style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;padding-bottom:4px;">N° Certificado</td>
                              <td style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;padding-bottom:4px;">Código de Verificación</td>
                            </tr>
                            <tr>
                              <td style="color:#166534;font-size:18px;font-weight:700;font-family:monospace;">${certData.numero_certificado}</td>
                              <td style="color:#166534;font-size:18px;font-weight:700;font-family:monospace;">${certData.codigo_verificacion}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    <!-- CTA Buttons -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom:12px;">
                          <a href="${frontendUrl}/#verify=${certData.codigo_verificacion}" style="display:inline-block;background:linear-gradient(135deg,#0F2C59,#1a4a8a);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;">
                            Verificar Certificado →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="color:#94a3b8;font-size:12px;margin:0;">
                      Certificado emitido por AlimSafe LMS | N° ${certData.numero_certificado}<br>
                      Fecha de emisión: ${certData.fecha_emision}
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Certificado_${courseTitle.replace(/\s+/g, '_')}_${studentData.cedula}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[emailService] ✅ Email de certificado enviado para cédula ${studentData.cedula}`);

    // En modo Ethereal, imprime el URL de previsualización
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[emailService] 📧 PREVIEW (Ethereal): ${previewUrl}`);
    }
  } catch (err) {
    console.error(`[emailService] ❌ Error enviando email de certificado para ${studentData.cedula}:`, err.message);
  }
}

module.exports = {
  sendWelcomeEmail,
  sendCertificateEmail
};
