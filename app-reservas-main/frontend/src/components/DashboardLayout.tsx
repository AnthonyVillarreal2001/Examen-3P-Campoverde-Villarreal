import React, { ReactNode, useState } from 'react'
import { useRouter } from 'next/router'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'

type Props = {
    children: ReactNode
}

export default function DashboardLayout({ children }: Props) {
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        localStorage.removeItem("token")
        router.push('/login')
    }

    return (
        <div className="flex h-screen bg-gray-200">
            {/* Sidebar */}
            <aside
                className={`fixed z-50 md:static top-0 left-0 h-full w-64 bg-[#0D3B66] text-white flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="text-3xl font-bold p-3.5 border-b border-[#29A9A1] text-center">
                    ReservasEC
                </div>
                <nav className="flex flex-col flex-grow p-4 space-y-3 text-base">
                    <Link
                        href="/dashboard/perfil"
                        className="bg-[#29A9A1] text-white px-4 py-2 rounded-lg hover:bg-[#23807d] transition font-medium text-center"
                    >
                        Perfil
                    </Link>
                    <Link
                        href="/dashboard"
                        className="bg-[#29A9A1] text-white px-4 py-2 rounded-lg hover:bg-[#23807d] transition font-medium text-center"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/dashboard/crear-reserva"
                        className="bg-[#29A9A1] text-white px-4 py-2 rounded-lg hover:bg-[#23807d] transition font-medium text-center"
                    >
                        Crear Reserva
                    </Link>
                    <Link
                        href="/dashboard/mis-reservas"
                        className="bg-[#29A9A1] text-white px-4 py-2 rounded-lg hover:bg-[#23807d] transition font-medium text-center"
                    >
                        Mis Reservas
                    </Link>
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex flex-col flex-grow min-h-0 w-full">
                {/* Header */}
                <header className="h-16 flex-shrink-0 bg-[#29A9A1] flex items-center justify-between px-6 text-white text-lg shadow-md">
                    <div className="flex items-center space-x-4">
                        <button
                            className="md:hidden focus:outline-none"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>

                    <button
                        className="px-4 py-2 border border-white rounded-lg hover:bg-[#23807d] transition text-sm cursor-pointer"
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </button>
                </header>

                {/* Content */}
                <main className="flex-grow p-6 bg-[#E9ECEF] overflow-auto min-h-0">
                    {children}
                </main>
            </div>
        </div>
    )
}
