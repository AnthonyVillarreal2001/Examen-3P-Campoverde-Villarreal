import { useState } from "react";
import { loginUser } from "@/utils/api";
import { useRouter } from "next/router";
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await loginUser({ email, password });

        if (res.token) {
            localStorage.setItem("token", res.token);
            alert("Sesión iniciada correctamente");
            router.push("/dashboard");
        } else {
            alert(res.message || "Error al iniciar sesión");
        }
    };

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
            <form
                onSubmit={handleSubmit}
                className="bg-white/90 backdrop-blur-md shadow-xl rounded-xl p-8 w-full max-w-md border border-[#0D3B66]/10 text-[#0D3B66]"
            >
                <h2 className="text-3xl font-bold text-center mb-6">Iniciar Sesión</h2>

                <div className="space-y-4">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        className="w-full px-4 py-2 border border-[#0D3B66]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#29A9A1]"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Contraseña"
                        className="w-full px-4 py-2 border border-[#0D3B66]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#29A9A1]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="mt-6 w-full bg-[#F4A261] text-white py-2 rounded-lg hover:bg-[#e38b4d] transition font-semibold"
                >
                    Iniciar Sesión
                </button>
                <p className="text-center mt-5 text-[#0D3B66]">
                    ¿Aún no tienes un usuario?{" "}
                    <Link
                        href="/register"
                        className="text-[#29A9A1] font-semibold hover:underline hover:text-[#1e7d79] transition"
                    >
                        Regístrate aquí
                    </Link>
                </p>
                <p className="text-center mt-4 text-sm text-[#0D3B66]">
                    <Link
                        href="/"
                        className="underline hover:text-[#F4A261] transition"
                    >
                        ← Volver al inicio
                    </Link>
                </p>
            </form>
        </div>
    );

}
