import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Award, Download, Share2, ArrowLeft, CheckCircle } from "lucide-react";
import { courses, students, generateCertificate } from "../data/mockData";

export default function CertificatePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<any>(null);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    const studentName = localStorage.getItem("studentName");
    
    if (!studentId || !studentName) {
      navigate("/login");
      return;
    }

    const student = students.find(s => s.id === studentId);
    const course = courses.find(c => c.id === courseId);

    if (student && course) {
      const cert = generateCertificate(studentName, student.cedula, course.title);
      setCertificate(cert);
    }
  }, [courseId, navigate]);

  if (!certificate) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--isn-bg-light)' }}>
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" 
                 style={{ background: 'var(--isn-blue)' }}>
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif tracking-tight" style={{ color: 'var(--isn-blue)', fontSize: '1.25rem', fontWeight: 600 }}>
                Certificado Oficial
              </h1>
              <p className="text-sm opacity-70">Instituto Superior del Norte</p>
            </div>
          </div>
          
          <Button onClick={() => navigate("/dashboard")} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Actions */}
        <div className="flex justify-center gap-4 mb-8">
          <Button className="gap-2 text-white" style={{ background: 'var(--isn-blue)' }}>
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Compartir
          </Button>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-xl shadow-2xl p-12 border-8" 
             style={{ borderColor: 'var(--isn-blue)' }}>
          {/* Inner Gold Border */}
          <div className="border-4 rounded-lg p-12" style={{ borderColor: 'var(--isn-gold)' }}>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-white"
                   style={{ background: 'var(--isn-blue)' }}>
                <Award className="w-12 h-12" />
              </div>
              
              <h1 className="font-serif mb-3" 
                  style={{ 
                    fontSize: '3rem', 
                    color: 'var(--isn-blue)',
                    fontWeight: 700,
                    letterSpacing: '0.02em'
                  }}>
                Instituto Superior del Norte
              </h1>
              
              <div className="w-32 h-1 mx-auto mb-6" style={{ background: 'var(--isn-gold)' }}></div>
              
              <h2 className="font-serif text-3xl mb-2" style={{ color: 'var(--isn-charcoal)' }}>
                Certificado de Aprobación
              </h2>
              
              <p className="text-lg opacity-70">
                Otorga el presente documento a:
              </p>
            </div>

            {/* Student Name */}
            <div className="text-center mb-8">
              <div className="inline-block border-b-4 pb-2 px-8" style={{ borderColor: 'var(--isn-gold)' }}>
                <p className="font-serif text-4xl" style={{ color: 'var(--isn-blue)' }}>
                  {certificate.studentName}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="text-center mb-8 space-y-2" style={{ color: 'var(--isn-charcoal)' }}>
              <p className="text-lg">
                Por haber completado satisfactoriamente el curso de
              </p>
              <p className="font-serif text-2xl" style={{ color: 'var(--isn-blue)' }}>
                <strong>{certificate.courseName}</strong>
              </p>
              <p className="text-lg">
                Con una intensidad académica de <strong>{certificate.hours}</strong>
              </p>
            </div>

            {/* Metadata */}
            <div className="grid md:grid-cols-3 gap-6 mb-8 text-center">
              <div className="p-4 rounded-lg" style={{ background: 'var(--isn-bg-light)' }}>
                <p className="text-sm opacity-70 mb-1">Cédula de Identidad</p>
                <p className="font-mono" style={{ color: 'var(--isn-blue)', fontWeight: 600 }}>
                  N° {certificate.cedula}
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ background: 'var(--isn-bg-light)' }}>
                <p className="text-sm opacity-70 mb-1">Fecha de Emisión</p>
                <p className="font-mono" style={{ color: 'var(--isn-blue)', fontWeight: 600 }}>
                  {certificate.completionDate}
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ background: 'var(--isn-bg-light)' }}>
                <p className="text-sm opacity-70 mb-1">Código de Verificación</p>
                <p className="font-mono" style={{ color: 'var(--isn-gold)', fontWeight: 700 }}>
                  {certificate.verificationCode}
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid md:grid-cols-2 gap-12 mb-8 pt-8 border-t-2">
              <div className="text-center">
                <div className="border-t-2 border-black pt-2 mb-2 mx-8">
                  <p className="font-serif" style={{ color: 'var(--isn-blue)' }}>
                    Dr. Alberto Mendoza
                  </p>
                </div>
                <p className="text-sm opacity-70">Director Académico</p>
              </div>
              
              <div className="text-center">
                <div className="border-t-2 border-black pt-2 mb-2 mx-8">
                  <p className="font-serif" style={{ color: 'var(--isn-blue)' }}>
                    Lic. María Rodríguez
                  </p>
                </div>
                <p className="text-sm opacity-70">Coordinadora de Certificaciones</p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t">
              <div className="flex items-center justify-center gap-2 mb-2" style={{ color: 'var(--isn-success)' }}>
                <CheckCircle className="w-5 h-5" />
                <p className="text-sm">
                  Documento con validez oficial - Verificable en línea
                </p>
              </div>
              <p className="text-xs opacity-50">
                www.institutosuperior.edu / verificacion@institutosuperior.edu
              </p>
            </div>
          </div>
        </div>

        {/* Verification Info */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-white rounded-lg p-6 shadow-md border-2"
               style={{ borderColor: 'var(--isn-gold)' }}>
            <Award className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--isn-gold)' }} />
            <h3 className="font-serif mb-2" style={{ color: 'var(--isn-blue)' }}>
              Verificación de Autenticidad
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--isn-charcoal)' }}>
              Este certificado puede ser verificado usando el código:
            </p>
            <div className="inline-block px-6 py-3 rounded-lg border-2"
                 style={{ 
                   background: 'var(--isn-bg-light)',
                   borderColor: 'var(--isn-gold)'
                 }}>
              <p className="font-mono text-xl" style={{ color: 'var(--isn-gold)', fontWeight: 700 }}>
                {certificate.verificationCode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
