const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Generates a professional certificate PDF stream
 * @param {WritableStream} stream - Target writable stream (e.g. Express Response)
 * @param {Object} data - Contains: { nombre_completo, cedula, fecha_emision, codigo_verificacion }
 */
function generateCertificatePDF(stream, data) {
  const doc = new PDFDocument({
    size: 'letter',
    layout: 'landscape',
    margins: { top: 40, bottom: 40, left: 40, right: 40 }
  });

  doc.pipe(stream);

  // 1. Draw outer gold/emerald borders
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
     .lineWidth(4)
     .stroke('#0F2C59'); // Principal Blue

  doc.rect(28, 28, doc.page.width - 56, doc.page.height - 56)
     .lineWidth(1.5)
     .stroke('#F0A500'); // Yellow accent

  // 2. Add decorative corners
  // Top-Left
  doc.rect(24, 24, 20, 20).lineWidth(1).stroke('#F0A500');
  // Top-Right
  doc.rect(doc.page.width - 44, 24, 20, 20).lineWidth(1).stroke('#F0A500');
  // Bottom-Left
  doc.rect(24, doc.page.height - 44, 20, 20).lineWidth(1).stroke('#F0A500');
  // Bottom-Right
  doc.rect(doc.page.width - 44, doc.page.height - 44, 20, 20).lineWidth(1).stroke('#F0A500');

  // 3. Official Logo
  const logoPath = path.join(__dirname, '..', 'logoNormal.jpeg');
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, doc.page.width / 2 - 50, 42, { width: 100 });
  }

  // 4. Header Text
  doc.y = 150; // set absolute Y coordinate below the logo
  doc.fontSize(28)
     .font('Times-Bold')
     .fillColor('#0F2C59')
     .text('CERTIFICADO DE APROBACIÓN', { align: 'center' });

  doc.moveDown(0.1);
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#F0A500')
     .text(`REGISTRO N°: ${data.numero_certificado}`, { align: 'center', characterSpacing: 1 });

  doc.moveDown(0.1);
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#0F2C59')
     .text((data.curso_titulo || 'CURSO DE MANIPULACIÓN HIGIÉNICA DE ALIMENTOS').toUpperCase(), { align: 'center', characterSpacing: 1.5 });

  doc.moveDown(0.8);
  doc.fontSize(13)
     .font('Helvetica')
     .fillColor('#475569')
     .text('Se otorga el presente documento de certificación y participación a:', { align: 'center' });

  // 4. Student Name
  doc.moveDown(0.6);
  doc.fontSize(28)
     .font('Helvetica-Bold')
     .fillColor('#4E9F3D') // Success Green
     .text(data.nombre_completo.toUpperCase(), { align: 'center' });

  // 5. Student ID
  doc.moveDown(0.3);
  doc.fontSize(13)
     .font('Helvetica')
     .fillColor('#1E293B')
     .text(`Cédula de Identidad N°: ${data.cedula}`, { align: 'center' });

  // 6. Course Details
  doc.moveDown(0.8);
  doc.fontSize(11)
     .font('Helvetica')
     .fillColor('#475569')
     .text('Por haber cumplido con todos los requisitos académicos del curso y aprobado satisfactoriamente', { align: 'center' });
  doc.text('la evaluación de conocimientos sobre normas higiénico-sanitarias vigentes.', { align: 'center' });

  // 7. Hours intensity & Grade
  doc.moveDown(0.5);
  doc.fontSize(10)
     .font('Helvetica-Oblique')
     .fillColor('#64748B')
     .text('Intensidad Horaria: 3 Horas Lectivas', { align: 'center' });
  
  doc.fontSize(11)
     .font('Helvetica-Bold')
     .fillColor('#4E9F3D')
     .text(`Calificación Obtenida: ${data.calificacion_obtenida}%`, { align: 'center' });

  // 8. Signatures & Metadata layout
  doc.moveDown(1.0);
  const yStart = doc.y;

  // Left Column: Issue Date
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#475569')
     .text('Fecha de Emisión:', 100, yStart, { width: 250, align: 'center' });
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#1E293B')
     .text(data.fecha_emision, 100, yStart + 18, { width: 250, align: 'center' });

  // Right Column: Signature line
  const rightColX = doc.page.width - 350;
  doc.moveTo(rightColX, yStart + 12)
     .lineTo(rightColX + 250, yStart + 12)
     .lineWidth(1)
     .stroke('#94A3B8');

  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#475569')
     .text('Comité de Calidad y Sanidad', rightColX, yStart + 18, { width: 250, align: 'center' });
  doc.fontSize(9)
     .font('Helvetica-Oblique')
     .fillColor('#64748B')
     .text('AlimentosLMS Certificador', rightColX, yStart + 32, { width: 250, align: 'center' });

  // 9. Footer Verification Metadata
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  doc.fontSize(9)
     .font('Courier')
     .fillColor('#64748B')
     .text(`CÓDIGO DE VERIFICACIÓN: ${data.codigo_verificacion}`, 40, doc.page.height - 65, { align: 'center' });
  doc.text(`Verifique la validez de este certificado en: ${frontendUrl}/#verify=${data.codigo_verificacion}`, 40, doc.page.height - 50, { align: 'center' });

  doc.end();
}

module.exports = {
  generateCertificatePDF
};
