"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { LoaderPinwheel, Loader2 } from "lucide-react";

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [loadingStates, setLoadingStates] = useState({
    credentials: false,
    google: false,
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) => password.length >= 6;

  const handleGoogleSignIn = async () => {
    setLoadingStates({ ...loadingStates, google: true });
    await signIn("google");
    setLoadingStates({ ...loadingStates, google: false });
  };

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(form.email)) {
      setError("Correo electrónico no válido");
      return;
    }

    setLoadingStates({ ...loadingStates, credentials: true });
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoadingStates({ ...loadingStates, credentials: false });

    if (res?.error) {
      setError(res.error);
    } else {
      window.location.href = "/";
    }
  };

  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(form.email)) {
      setError("Correo electrónico no válido");
      return;
    }

    if (!validatePassword(form.password)) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoadingStates({ ...loadingStates, credentials: true });

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || "Error en el registro");
      } else {
        await signIn("credentials", {
          redirect: false,
          email: form.email,
          password: form.password,
        });
        window.location.href = "/";
      }
    } catch {
      setError("Error en la comunicación con el servidor");
    } finally {
      setLoadingStates({ ...loadingStates, credentials: false });
    }
  };

  const isLoading = loadingStates.credentials || loadingStates.google;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-md">
        <h1 className="gap-5 w-full flex flex-col items-center text-2xl font-semibold text-center text-gray-800 mb-4">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 mask mask-icon rounded-full p-0.5">
            <LoaderPinwheel className="w-full h-full text-white" strokeWidth={1.5} />
          </div>
          {isRegister ? "Registro" : "Iniciar sesión"}
        </h1>

        {!isRegister && (
          <>
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md w-full text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loadingStates.google ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión con Google"
              )}
            </button>

            <div className="flex items-center gap-2 my-4 w-full">
              <hr className="flex-grow border-gray-300" />
              <span className="text-gray-500 text-sm">o</span>
              <hr className="flex-grow border-gray-300" />
            </div>
          </>
        )}

        <form
          onSubmit={isRegister ? handleSubmitRegister : handleSubmitLogin}
          className="flex flex-col gap-3"
        >
          {isRegister && (
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              value={form.name}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
              disabled={isLoading}
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
            disabled={isLoading}
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            className="p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
            disabled={isLoading}
          />

          {isRegister && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 outline-none"
              disabled={isLoading}
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all duration-200"
          >
            {loadingStates.credentials ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              isRegister ? "Registrarse" : "Ingresar"
            )}
          </button>
        </form>

        <button
          className="text-blue-600 hover:underline text-sm mt-3 w-full text-center transition-all duration-200"
          onClick={() => {
            setError("");
            setForm({
              email: "",
              password: "",
              confirmPassword: "",
              name: "",
            });
            setIsRegister(!isRegister);
          }}
          disabled={isLoading}
        >
          {isRegister
            ? "¿Ya tenés cuenta? Iniciar sesión"
            : "¿No tenés cuenta? Registrarse"}
        </button>

        {error && <p className="text-red-600 mt-3 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}