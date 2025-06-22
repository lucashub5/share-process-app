import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User, LogOut } from 'lucide-react';
import Image from 'next/image';
import { signOut, useSession } from "next-auth/react";

export default function UserDropdown() {
  const { data: session } = useSession();

  const userImage = session?.user?.image;
  const userName = session?.user?.name;

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleLogout = useCallback(() => {
    setIsOpen(false);
    signOut();
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón */}
      <button
        onClick={toggleDropdown}
        className="flex items-center font-bold hover:bg-gray-100 hover:bg-opacity-50 transition-colors rounded-full focus:outline-none"
        aria-label="Menú de usuario"
        aria-expanded={isOpen}
        type="button"
      >
        <div>
          {userImage ? (
            <Image
              src={userImage}
              alt={`Avatar de ${userName || 'usuario'}`}
              width={25}
              height={25}
              className="rounded-full object-cover"
            />
          ) : (
            <User className="h-6 w-6 text-neutral-700" />
          )}
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none"
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}