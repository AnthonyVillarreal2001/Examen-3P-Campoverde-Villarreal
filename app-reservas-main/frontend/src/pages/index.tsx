'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMe } from "@/utils/api";
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  nombre: string;
  email: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const redirect = () => router.push('/dashboard');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getMe(token).then((res) => {
      if (res && !res.message) {
        setUser(res);
      }
    });
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: 'url("/bg-reservapp.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-10 max-w-md w-full border border-[#0D3B66]/10">
        <h1 className="text-3xl font-bold text-[#0D3B66] mb-6 text-center">
          Bienvenido a <span className="text-[#29A9A1]">ReservasEC</span>
        </h1>

        {user ? (
          <>
            <p className="text-[#0D3B66] text-center mb-6 text-lg">
              Hola, <span className="font-semibold">{user.nombre}</span> 👋
            </p>
            <div className="space-y-3">
              <button
                className="w-full bg-[#F4A261] text-white py-2 rounded hover:bg-[#e38b4d] transition font-semibold cursor-pointer"
                onClick={redirect}
              >
                Ir al Dashboard
              </button>
              <button
                className="w-full border border-[#0D3B66] text-[#0D3B66] py-2 rounded hover:bg-[#0D3B66] hover:text-white transition font-semibold cursor-pointer"
                onClick={() => {
                  localStorage.removeItem("token");
                  location.reload();
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-[#0D3B66] text-center mb-6">
              Tu plataforma de reservas confiable y sencilla.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/login"
                className="px-6 py-2 bg-[#29A9A1] text-white rounded hover:bg-[#23807d] transition font-semibold"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 border border-[#29A9A1] text-[#29A9A1] rounded hover:bg-[#29A9A1] hover:text-white transition font-semibold"
              >
                Registrarse
              </Link>
            </div>
          </>
        )}
      </div>
    </div>

  );
}
