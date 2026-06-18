import { useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { Home, User, LogOut } from "lucide-react";

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0F2C59]">Instituto Superior del Norte</h1>
            <div className="h-6 w-1 bg-[#4E9F3D] rounded-full"></div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className={`flex items-center gap-2 ${
                location.pathname === "/dashboard"
                  ? "text-[#4E9F3D] bg-[#4E9F3D]/10"
                  : "text-gray-700 hover:text-[#4E9F3D]"
              }`}
            >
              <Home className="w-4 h-4" />
              Inicio
            </Button>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-700 hover:text-[#4E9F3D]"
            >
              <User className="w-4 h-4" />
              Mi Perfil
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-[#F0A500]"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
