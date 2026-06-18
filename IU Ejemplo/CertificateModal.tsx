import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Award, Download, CheckCircle2 } from "lucide-react";

interface CertificateModalProps {
  onClose: () => void;
}

export function CertificateModal({ onClose }: CertificateModalProps) {
  const userName = sessionStorage.getItem("userName") || "Usuario";
  const currentDate = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert("El certificado se descargará en formato PDF");
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 bg-transparent border-0">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-[#4E9F3D] to-[#3d8030] p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-[#4E9F3D]" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              ¡Felicitaciones!
            </h2>
            <p className="text-white/90">
              Has completado exitosamente el curso de Manipulación de Alimentos
            </p>
          </div>

          {/* Certificate */}
          <div className="p-8">
            <div className="border-8 border-[#0F2C59] rounded-lg p-8 bg-gradient-to-br from-white to-gray-50 relative">
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-[#F0A500]"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-[#F0A500]"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-[#F0A500]"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-[#F0A500]"></div>

              <div className="text-center space-y-6 py-8">
                {/* Logo */}
                <div className="flex justify-center items-center gap-3 mb-6">
                  <Award className="w-12 h-12 text-[#0F2C59]" />
                  <div>
                    <h1 className="text-4xl font-bold text-[#0F2C59]">Instituto Superior del Norte</h1>
                    <div className="h-1 w-24 bg-[#4E9F3D] mx-auto rounded-full mt-1"></div>
                  </div>
                </div>

                {/* Certificate Title */}
                <div>
                  <p className="text-gray-600 uppercase tracking-wider text-sm mb-2">
                    Certificado de Aprobación
                  </p>
                  <h2 className="text-3xl font-bold text-[#0F2C59] mb-6">
                    Manipulación de Alimentos
                  </h2>
                </div>

                {/* Recipient */}
                <div className="space-y-2">
                  <p className="text-gray-600">Se certifica que</p>
                  <p className="text-4xl font-bold text-[#0F2C59] py-2 border-b-2 border-[#4E9F3D] inline-block px-8">
                    {userName}
                  </p>
                </div>

                {/* Description */}
                <div className="max-w-2xl mx-auto space-y-3">
                  <p className="text-gray-700 leading-relaxed">
                    ha completado satisfactoriamente el curso de <strong>Manipulación 
                    de Alimentos</strong> y ha demostrado conocimiento en las buenas 
                    prácticas de higiene, seguridad alimentaria y normativas sanitarias 
                    vigentes.
                  </p>
                </div>

                {/* Score Badge */}
                <div className="flex justify-center gap-8 pt-4">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-[#4E9F3D]/10 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-[#4E9F3D]">95%</span>
                    </div>
                    <p className="text-sm text-gray-600">Calificación</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-[#008DDA]/10 flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-[#008DDA]">8h</span>
                    </div>
                    <p className="text-sm text-gray-600">Duración</p>
                  </div>
                </div>

                {/* Date and ID */}
                <div className="flex justify-between items-end pt-8 border-t border-gray-200">
                  <div className="text-left">
                    <p className="text-sm text-gray-600">Fecha de emisión</p>
                    <p className="font-semibold text-[#0F2C59]">{currentDate}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-[#0F2C59] to-[#008DDA] rounded-full flex items-center justify-center">
                      <Award className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Certificado N°</p>
                    <p className="font-semibold text-[#0F2C59]">AS-2026-0542</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-8 py-6 flex justify-center gap-4">
            <Button
              onClick={handleDownload}
              className="bg-[#4E9F3D] hover:bg-[#3d8030] text-white px-8 h-12"
            >
              <Download className="w-5 h-5 mr-2" />
              Descargar PDF
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 px-8 h-12"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
