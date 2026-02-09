'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

type UserProfile = {
    nombre: string
    email: string
    telefono?: string
    direccion?: string
    preferencias?: string[]
}

const USER_URL = process.env.NEXT_PUBLIC_USER_URL

export default function PerfilPage() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [mensaje, setMensaje] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const res = await fetch(`${USER_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Error al cargar perfil')
            setUser(data)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMensaje('❌ ' + err.message);
            } else {
                setMensaje('❌ Error desconocido');
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!user) return
        const { name, value } = e.target
        setUser({ ...user, [name]: value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMensaje('')

        try {
            const token = localStorage.getItem('token')
            if (!token || !user) return

            const { nombre, email, telefono, direccion } = user
            const dataToSend = { nombre, email, telefono, direccion }

            const res = await fetch(`${USER_URL}/me/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(dataToSend),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Error al actualizar perfil')

            setMensaje('✅ Perfil actualizado correctamente')
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMensaje('❌ ' + err.message);
            } else {
                setMensaje('❌ Error desconocido');
            }
        }
    }

    useEffect(() => {
        if (mensaje) {
            const timer = setTimeout(() => setMensaje(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [mensaje])

    return (
        <DashboardLayout>
            {mensaje && (
                <div
                    className={`fixed top-20 right-6 z-50 bg-white border-l-4 px-4 py-3 shadow-lg rounded-md transition-all duration-300
                    ${mensaje.startsWith('✅') ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}
                >
                    {mensaje}
                </div>
            )}

            <div className="max-w-5xl mx-auto p-6 text-[#0D3B66]">
                <h1 className="text-2xl font-bold mb-2 text-center">Mi Perfil</h1>

                {loading ? (
                    <p className="text-center text-[#0D3B66]">Cargando...</p>
                ) : user ? (
                    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow text-sm">
                        <div>
                            <label className="block mb-1 font-medium">Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                value={user.nombre}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Teléfono</label>
                            <input
                                type="text"
                                name="telefono"
                                value={user.telefono || ''}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Dirección</label>
                            <input
                                type="text"
                                name="direccion"
                                value={user.direccion || ''}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#F4A261] hover:bg-orange-500 transition text-white font-semibold py-2 rounded disabled:opacity-50 cursor-pointer"
                        >
                            Guardar Cambios
                        </button>
                    </form>
                ) : (
                    <p className="text-center text-red-600">No se pudo cargar el perfil</p>
                )}
            </div>
        </DashboardLayout>
    )
}
