import { NavLink } from 'react-router-dom'
import { Award, CalendarDays, ClipboardCheck, LayoutDashboard, LogOut, Settings, Shield, UserRound, Users, X } from 'lucide-react'

const memberModules = [
	{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
	{ label: 'Events', path: '/events', icon: CalendarDays },
	{ label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
	{ label: 'Certificates', path: '/certificates', icon: Award },
]

const adminModules = [
	...memberModules,
	{ label: 'Students', path: '/students', icon: Users },
	{ label: 'Audit logs', path: '/audit-logs', icon: Shield },
	{ label: 'Settings', path: '/settings', icon: Settings },
]

const dashboardAdminModules = [
	{ label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
	{ label: 'Students', path: '/students', icon: Users },
	{ label: 'Events', path: '/events', icon: CalendarDays },
	{ label: 'Attendance', path: '/attendance', icon: ClipboardCheck },
	{ label: 'Settings', path: '/settings', icon: Settings },
	{ label: 'Audit logs', path: '/audit-logs', icon: Shield },
]

export default function Sidebar({ user, isOpen, onClose, onLogout }) {
	const modules = user?.role === 'super_admin' ? dashboardAdminModules : memberModules

	return (
		<>
			{isOpen && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" />}
			<aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 transition-transform lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
				<div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
					<div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white"><ClipboardCheck size={20} /></div><div><p className="font-semibold tracking-tight text-white">STI Attendance</p><p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Club portal</p></div></div>
					<button type="button" onClick={onClose} aria-label="Close navigation" className="rounded p-1 text-slate-400 hover:bg-white/10 lg:hidden"><X size={19} /></button>
				</div>
				<nav className="flex-1 space-y-1 px-4 py-6">{modules.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${isActive ? 'bg-blue-500/15 font-medium text-blue-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={18} />{label}</NavLink>)}</nav>
				<div className="border-t border-white/10 p-4"><div className="mb-3 flex items-center gap-3 rounded-lg bg-white/5 px-3 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-slate-200"><UserRound size={17} /></div><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{user?.username}</p><p className="text-xs text-slate-500">{user?.role === 'super_admin' ? 'Super admin' : 'Member'}</p></div></div><button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"><LogOut size={17} />Sign out</button></div>
			</aside>
		</>
	)
}
