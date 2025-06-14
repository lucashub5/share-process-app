'use client';

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = () => {
    const confirmLogout = window.confirm("¿Estás seguro que querés cerrar sesión?");
    if (confirmLogout) {
      signOut();
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-left text-gray-700 hover:text-red-600 transition-colors flex items-center gap-1"
      aria-label="Cerrar sesión"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}