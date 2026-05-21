import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

export function LoginScreen() {
  const navigate = useNavigate();
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Store user info in sessionStorage for personalization
    if (cedula) {
      sessionStorage.setItem("userName", "Juan Pérez"); // Mock user name
      sessionStorage.setItem("userId", cedula);
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-6 pb-8 pt-10">
          <div className="flex justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#0F2C59] mb-1">AlimSafe</h1>
              <div className="h-1 w-16 bg-[#4E9F3D] mx-auto rounded-full"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cedula" className="text-[#0F2C59]">
                Cédula (Usuario)
              </Label>
              <Input
                id="cedula"
                type="text"
                placeholder="Ingrese su cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="h-12 bg-[#F8F9FA] border-gray-200 focus:border-[#008DDA] focus:ring-[#008DDA]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0F2C59]">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-[#F8F9FA] border-gray-200 focus:border-[#008DDA] focus:ring-[#008DDA]"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-[#4E9F3D] hover:bg-[#3d8030] text-white mt-6"
            >
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
