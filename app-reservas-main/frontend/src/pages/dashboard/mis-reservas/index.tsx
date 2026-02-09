'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { HOTELES } from '@/data/hoteles'
import Image from 'next/image'

type Reserva = {
    id: string
    fecha: string
    servicio: string
    estado: 'activo' | 'cancelada'
}

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL

export default function MyReservationsPage() {
    const [reservas, setReservas] = useState<Reserva[]>([])
    const [, setLoading] = useState(true)
    const [mensaje, setMensaje] = useState('')
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false)
    const [reservaAEliminar, setReservaAEliminar] = useState<string | null>(null)

    const fetchReservas = async () => {
        try {
            const res = await fetch(BOOKING_URL!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ query: '{ bookings { id servicio fecha estado } }' })
            })

            const data = await res.json()

            if (!res.ok || data.errors) {
                throw new Error(data.errors?.[0]?.message || data.message || 'Error al obtener reservas')
            }

            setReservas(data.data.bookings)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setMensaje(`❌ ${err.message}`)
            } else {
                setMensaje('❌ Ocurrió un error inesperado')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReservas()
    }, [])

    useEffect(() => {
        if (mensaje) {
            const timer = setTimeout(() => setMensaje(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [mensaje])

    const confirmarCancelacion = (id: string) => {
        setReservaAEliminar(id)
        setMostrarConfirmacion(true)
    }

    const reservasActivas = reservas.filter(r => r.estado === 'activo')
    const reservasCanceladas = reservas.filter(r => r.estado === 'cancelada')

    const obtenerImagen = (servicio: string) => {
        const hotel = HOTELES.find(h => servicio.toLowerCase().includes(h.nombre.toLowerCase()))
        return hotel?.imagen || '/hotels/default.jpg'
    }

    return (
        <DashboardLayout>
            {mostrarConfirmacion && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50" style={{ backdropFilter: 'blur(8px)' }}>
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
                        <h2 className="text-lg font-semibold text-[#0D3B66] mb-4">¿Cancelar reserva?</h2>
                        <p className="text-sm text-gray-700 mb-6">Esta acción no se puede deshacer.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch(BOOKING_URL!, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                                            },
                                            body: JSON.stringify({
                                                query: 'mutation ($id: ID!) { cancelBooking(id: $id) { id estado canceladaEn } }',
                                                variables: { id: reservaAEliminar }
                                            })
                                        })
                                        const data = await res.json()
                                        if (!res.ok || data.errors) {
                                            throw new Error(data.errors?.[0]?.message || 'Error al cancelar la reserva')
                                        }
                                        await fetchReservas()
                                    } catch (err: unknown) {
                                        if (err instanceof Error) {
                                            setMensaje('❌ ' + err.message);
                                        } else {
                                            setMensaje('❌ Error desconocido');
                                        }
                                    } finally {
                                        setMostrarConfirmacion(false)
                                        setReservaAEliminar(null)
                                    }
                                }}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition cursor-pointer"
                            >
                                Sí, cancelar
                            </button>
                            <button
                                onClick={() => {
                                    setMostrarConfirmacion(false)
                                    setReservaAEliminar(null)
                                }}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition cursor-pointer"
                            >
                                No, volver
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {mensaje && (
                <div
                    className={`fixed top-24 right-6 z-50 bg-white border-l-4 px-4 py-3 shadow-lg rounded-md transition-all duration-300
                    ${mensaje.startsWith('✅') ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}`}
                >
                    {mensaje}
                </div>
            )}

            <h1 className="text-2xl font-bold mb-6 text-[#0D3B66]">Mis Reservas</h1>

            {/* Activas */}
            <section className="space-y-4 mb-12">
                <h2 className="text-xl font-semibold text-[#0D3B66]">Reservas activas</h2>
                {reservasActivas.length === 0 ? (
                    <p className="text-[#0D3B66]">No tienes reservas activas.</p>
                ) : (
                    reservasActivas.map((reserva) => {
                        const fechaLocal = new Date(reserva.fecha).toLocaleString('es-EC', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })

                        return (
                            <div key={reserva.id} className="flex flex-col md:flex-row bg-white rounded shadow overflow-hidden text-[#0D3B66]">
                                <Image
                                    src={obtenerImagen(reserva.servicio)}
                                    alt={reserva.servicio}
                                    width={320}
                                    height={192}
                                    className="w-full md:w-32 h-48 md:h-32 object-cover"
                                />
                                <div className="flex flex-col md:flex-row justify-between w-full p-4 gap-4">
                                    <div className="flex flex-col justify-center w-full p-2">
                                        <p><strong>Servicio:</strong> {reserva.servicio}</p>
                                        <p><strong>Fecha:</strong> {fechaLocal}</p>
                                        <p><strong>Estado:</strong> <span className="text-green-600 capitalize">{reserva.estado}</span></p>
                                    </div>
                                    <div className="md:ml-auto flex items-center px-4">
                                        <button
                                            onClick={() => confirmarCancelacion(reserva.id)}
                                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full md:w-auto cursor-pointer"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </section>

            {/* Canceladas */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold text-[#0D3B66]">Historial de reservas canceladas</h2>
                {reservasCanceladas.length === 0 ? (
                    <p className="text-[#0D3B66]">No tienes reservas canceladas.</p>
                ) : (
                    reservasCanceladas
                        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                        .map((reserva) => {
                            const fechaLocal = new Date(reserva.fecha).toLocaleString('es-EC', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })

                            return (
                                <div key={reserva.id} className="flex flex-col md:flex-row bg-white rounded shadow overflow-hidden text-[#0D3B66]">
                                    <Image
                                        src={obtenerImagen(reserva.servicio)}
                                        alt={reserva.servicio}
                                        width={320}
                                        height={192}
                                        className="w-full md:w-32 h-48 md:h-32 object-cover"
                                    />
                                    <div className="flex flex-col md:flex-row justify-between w-full p-4 gap-4">
                                        <div className="flex flex-col justify-center w-full p-2">
                                            <p><strong>Servicio:</strong> {reserva.servicio}</p>
                                            <p><strong>Fecha:</strong> {fechaLocal}</p>
                                            <p><strong>Estado:</strong> <span className="text-red-500 capitalize">{reserva.estado}</span></p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                )}
            </section>
        </DashboardLayout>
    )
}
