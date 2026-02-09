'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { HOTELES } from '@/data/hoteles'
import Image from 'next/image'

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL

export default function CreateReservationPage() {
    const [fecha, setFecha] = useState('')
    const [servicio, setServicio] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [filtro, setFiltro] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMensaje('')

        try {
            const res = await fetch(BOOKING_URL!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    query: 'mutation ($fecha: String!, $servicio: String!) { createBooking(fecha: $fecha, servicio: $servicio) { id servicio estado fecha } }',
                    variables: { fecha, servicio }
                })
            })

            const data = await res.json()
            if (!res.ok || data.errors) {
                throw new Error(data.errors?.[0]?.message || data.message || 'Error al crear reserva')
            }

            setMensaje('✅ ¡Reserva realizada con éxito!')
            setFecha('')
            setServicio('')
        } catch (error: unknown) {
            if (error instanceof Error) {
                setMensaje(`❌ ${error.message}`)
            } else {
                setMensaje('❌ Ha ocurrido un error inesperado')
            }
        }
    }

    const hotelesFiltrados = HOTELES.filter(hotel =>
        hotel.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        hotel.ciudad.toLowerCase().includes(filtro.toLowerCase())
    )

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
                <h1 className="text-2xl font-bold mb-6 text-center">Crear Nueva Reserva</h1>

                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o ciudad..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="flex-1 mb-4 md:mb-0 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
                    />

                    <input
                        type="datetime-local"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#0D3B66]"
                        required
                    />

                    <button
                        type="submit"
                        disabled={!servicio || !fecha}
                        className="bg-[#F4A261] hover:bg-orange-500 text-white font-semibold py-2 px-6 rounded transition disabled:opacity-50 mt-4 md:mt-0"
                        onClick={handleSubmit}
                    >
                        Reservar
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {hotelesFiltrados.map((hotel) => (
                        <div
                            key={hotel.nombre}
                            onClick={() => setServicio(hotel.nombre)}
                            className={`cursor-pointer border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300 
                            ${servicio === hotel.nombre ? 'bg-[#FFF4E6] ring-2 ring-[#F4A261]' : 'bg-white'}`}
                        >
                            <Image
                                src={hotel.imagen}
                                alt={hotel.nombre}
                                width={400}
                                height={200}
                                className="h-40 w-full object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-1">{hotel.nombre}</h3>
                                <p className="text-sm text-gray-600">{hotel.ciudad}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
