'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import Link from 'next/link'
import { CalendarDays, PlusCircle, UserCircle, ClipboardList, MapPin } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'

type Reserva = {
    id: string
    fecha: string
    servicio: string
    estado?: string
}

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

// GraphQL endpoint
export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [proximas, setProximas] = useState<Reserva[]>([])

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            )
            const userData = JSON.parse(jsonPayload)

            setUser({
                nombre: userData.nombre || '',
                email: userData.email || '',
            })
        } catch (error) {
            console.error('Error decodificando token:', error)
            router.push('/login')
            return
        }

        const fetchReservas = async () => {
            try {
                const res = await fetch(BOOKING_URL!, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ query: '{ upcomingBookings { id servicio fecha estado } }' })
                });

                const data = await res.json();
                if (!res.ok || data.errors) throw new Error(data.errors?.[0]?.message || 'Error al obtener próximas reservas');

                const proximas = data.data.upcomingBookings.map((r: { id: string; servicio: string; estado?: string; fecha: string }) => ({
                    id: r.id,
                    servicio: r.servicio,
                    estado: r.estado,
                    fecha: r.fecha,
                }));

                setProximas(proximas);
            } catch (err) {
                console.error('❌ Error:', err)
            }
        }

        fetchReservas()
    }, [router])

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                {/* Perfil del usuario */}
                <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center space-x-4 text-blue-600">
                    <UserCircle className="w-12 h-12" />
                    <div>
                        <h2 className="text-xl font-bold">Hola, {user?.nombre}</h2>
                        <p className="text-gray-500">{user?.email}</p>
                    </div>
                </div>

                {/* Próximas reservas */}
                <div className="bg-white rounded-2xl shadow-xl p-6 text-green-600">
                    <div className="flex items-center space-x-3 mb-2">
                        <CalendarDays className="w-6 h-6" />
                        <h2 className="text-lg font-semibold">Próximas Reservas</h2>
                    </div>
                    {proximas.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay reservas próximas.</p>
                    ) : (
                        <ul className="text-sm text-green-600 space-y-1">
                            {proximas.slice(0, 3).map((r) => (
                                <li key={r.id}>
                                    {new Date(r.fecha).toLocaleDateString()} – {r.servicio}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Crear nueva reserva */}
                <div
                    className="bg-blue-100 hover:bg-blue-200 transition-all duration-200 cursor-pointer rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center"
                    onClick={() => router.push('/dashboard/crear-reserva')}
                >
                    <PlusCircle className="w-12 h-12 text-blue-700 mb-2" />
                    <h2 className="text-lg font-bold text-blue-800">Crear Nueva Reserva</h2>
                </div>

                {/* Ver mis reservas */}
                <div
                    className="bg-white hover:bg-gray-200 transition-all duration-200 cursor-pointer rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center"
                    onClick={() => router.push('/dashboard/mis-reservas')}
                >
                    <ClipboardList className="w-12 h-12 text-gray-700 mb-2" />
                    <h2 className="text-lg font-bold text-gray-800">Ver Mis Reservas</h2>
                </div>

                {/* Mapa con hoteles populares en Ecuador */}
                <Link
                    href="https://www.google.com/maps/search/Hoteles+en+Ecuador"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-1 md:col-span-2 bg-emerald-100 rounded-2xl shadow-xl p-6 flex items-center space-x-4 cursor-pointer hover:bg-emerald-200 transition"
                >
                    <MapPin className="w-10 h-10 text-[#0D3B66]" />
                    <div>
                        <h2 className="text-xl font-bold text-[#0D3B66]">Explora hoteles populares en Ecuador</h2>
                        <p className="text-gray-600">Haz clic para abrir en Google Maps</p>
                    </div>
                </Link>
            </div>
        </DashboardLayout>
    )
}