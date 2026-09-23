import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'
import { useAuth } from '@/context/AuthContext'

export default function MainLayout({ children }) {
	const { user, logout } = useAuth()
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)

	return <div className="flex min-h-screen bg-slate-100"><Sidebar user={user} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={logout} /><div className="min-w-0 flex-1"><div className="flex h-16 items-center border-b border-slate-200 bg-white px-4 lg:hidden"><button type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><Menu size={21} /></button><span className="ml-3 text-sm font-semibold text-slate-900">STI Attendance</span></div>{children}</div></div>
}
