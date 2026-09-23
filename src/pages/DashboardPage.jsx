import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Copy, LogIn, RefreshCw, Settings, ShieldCheck, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast, Toaster } from 'react-hot-toast'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/context/AuthContext'
import { getEvents } from '@/services/eventService'
import { getDashboardOverview } from '@/services/dashboardService'
import { readEmailConfig } from '@/services/emailConfigService'

function StatCard({ icon: Icon, label, value, detail, accent }) {
  return <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p></div><div className={`rounded-lg p-2.5 ${accent}`}><Icon size={19} /></div></div><p className="mt-4 flex items-center gap-1 text-xs text-slate-500"><ArrowUpRight size={13} className="text-emerald-600" />{detail}</p></article>
}

function PageHeading({ eyebrow, title, description }) {
  return <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">{description}</p></div>
}

function manilaDateKey(value = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(new Date(value))
}

function manilaDateTime(value) {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function DashboardPage() {
  const { user, issueLoginOtp, getLoginLogs } = useAuth()
  const [issuedOtp, setIssuedOtp] = useState(null)
  const [logs, setLogs] = useState([])
  const [events, setEvents] = useState([])
  const [overview, setOverview] = useState({
    totalStudents: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendance: 0,
    completedCheckouts: 0,
    attendanceRate: 0,
    loginsToday: 0,
    recentLogins: [],
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [isLoadingOverview, setIsLoadingOverview] = useState(false)
  const [emailProfiles, setEmailProfiles] = useState([])
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const isSuperAdmin = user?.role === 'super_admin'

  useEffect(() => {
    const config = readEmailConfig()
    const profiles = Array.isArray(config.profiles) && config.profiles.length > 0
      ? config.profiles
      : (config.serviceId || config.templateId || config.publicKey ? [{ ...config, id: config.id || config.activeProfileId || 'primary', label: config.label || 'Primary account' }] : [])
    setEmailProfiles(profiles)
  }, [user])

  async function refreshLogs() {
    setIsRefreshing(true)
    const result = await getLoginLogs()
    setIsRefreshing(false)
    if (result.error) toast.error(result.error)
    else setLogs(result.data)
  }

  async function loadOverview() {
    setIsLoadingOverview(true)
    const result = await getDashboardOverview()
    setIsLoadingOverview(false)
    if (result.error) {
      console.error(result.error)
      setOverview((current) => ({ ...current, recentLogins: [] }))
      return
    }
    setOverview(result)
    setLogs(result.recentLogins || [])
  }

  async function loadEvents() {
    setIsLoadingEvents(true)
    const result = await getEvents()
    setIsLoadingEvents(false)
    if (result.error) {
      console.error('Failed to load events:', result.error)
      setEvents([])
    } else {
      setEvents(result.data)
    }
  }

  useEffect(() => {
    if (user) {
      loadEvents()
      loadOverview()
      if (isSuperAdmin) refreshLogs()
    }
  }, [user, isSuperAdmin])

  async function handleIssueOtp(event) {
    event.preventDefault()
    const result = await issueLoginOtp()
    if (!result.success) {
      toast.error(result.error)
      return
    }
    setIssuedOtp({ otp: result.otp, expiresAt: result.expiresAt })
    toast.success('New member OTP generated')
  }

  async function copyOtp() {
    await navigator.clipboard.writeText(issuedOtp.otp)
    toast.success('OTP copied')
  }

  const upcomingEvents = events
    .filter((event) => {
      const dateValue = new Date(event.event_date || event.starts_at || Date.now())
      return dateValue >= new Date()
    })
    .slice(0, 3)

  return <MainLayout><Toaster position="top-right" /><main className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
    {isAdmin ? <>
      <PageHeading eyebrow="Admin overview" title={`Good morning, ${user?.username}`} description="Track student participation, events, attendance, and portal activity from one place." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Registered students" value={isLoadingOverview ? '…' : overview.totalStudents} detail={`${overview.totalStudents} active records`} accent="bg-blue-50 text-blue-600" />
        <StatCard icon={CheckCircle2} label="Attendance rate" value={isLoadingOverview ? '…' : `${Math.round(overview.attendanceRate)}%`} detail={`${overview.completedCheckouts} of ${overview.totalAttendance || 0} check-ins closed`} accent="bg-emerald-50 text-emerald-600" />
        <StatCard icon={CalendarDays} label="Upcoming events" value={events.length ? upcomingEvents.length : 0} detail={upcomingEvents.length > 0 ? `${upcomingEvents.length} scheduled` : 'None scheduled'} accent="bg-amber-50 text-amber-600" />
        <StatCard icon={Activity} label="Student logins today" value={isLoadingOverview ? '…' : overview.loginsToday} detail="Live from access logs" accent="bg-violet-50 text-violet-600" />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">EmailJS admin settings</p>
            <p className="mt-1 text-sm text-slate-500">Use a local browser configuration so each device can keep its own EmailJS account or service.</p>
          </div>
          <Link to="/settings" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            <Settings size={16} /> Open settings
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {emailProfiles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 md:col-span-2 xl:col-span-3">
              No EmailJS account saved yet for this device.
            </div>
          ) : (
            emailProfiles.map((profile) => (
              <div key={profile.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{profile.label || 'EmailJS account'}</p>
                  {profile.id === readEmailConfig().activeProfileId && (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Active</span>
                  )}
                </div>
                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <p><span className="font-medium text-slate-700">Service:</span> {profile.serviceId || 'Not set'}</p>
                  <p><span className="font-medium text-slate-700">Template:</span> {profile.templateId || 'Not set'}</p>
                  <p><span className="font-medium text-slate-700">Department:</span> {profile.departmentName || profile.senderName || 'STI Attendance'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {isSuperAdmin && <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 p-6"><div><h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950"><LogIn size={19} className="text-blue-600" /> Recent student logins</h2><p className="mt-1 text-sm text-slate-500">Student access activity from the latest sessions.</p></div><button type="button" title="Refresh login logs" onClick={() => { refreshLogs(); loadOverview() }} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><RefreshCw size={17} className={isRefreshing || isLoadingOverview ? 'animate-spin' : ''} /></button></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3">Username</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Time (PHT)</th></tr></thead><tbody className="divide-y divide-slate-100">{logs.length === 0 ? <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-500">No login activity yet.</td></tr> : logs.slice(0, 8).map((log) => <tr key={log.id}><td className="px-6 py-4 font-medium text-slate-900">{log.username}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${log.succeeded ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{log.succeeded ? 'Successful' : 'Failed'}</span></td><td className="px-6 py-4 text-slate-500">{manilaDateTime(log.created_at)}</td></tr>)}</tbody></table></div></section>}
        <div className={isSuperAdmin ? '' : 'xl:col-start-2'}>
          {isSuperAdmin && <form onSubmit={handleIssueOtp} className="rounded-xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300"><ShieldCheck size={20} /></div><h2 className="mt-5 text-xl font-semibold">Student access code</h2><p className="mt-2 text-sm leading-6 text-slate-400">Generate one secure code for event participants. It remains valid for 10 minutes.</p><button type="submit" className="mt-6 w-full rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400">Generate 10-minute OTP</button>{issuedOtp && <div className="mt-5 border-t border-white/10 pt-5"><p className="text-xs uppercase tracking-[0.15em] text-slate-500">Current student code</p><div className="mt-2 flex items-center justify-between"><strong className="text-3xl tracking-[0.25em] text-white">{issuedOtp.otp}</strong><button type="button" title="Copy OTP" onClick={copyOtp} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><Copy size={18} /></button></div><p className="mt-3 flex items-center gap-2 text-xs text-slate-400"><Clock3 size={14} /> Expires {new Date(issuedOtp.expiresAt).toLocaleTimeString()}</p></div>}</form>}
        </div>
      </div>
    </> : <>
      <PageHeading eyebrow="Participant dashboard" title={`Welcome, ${user?.username}`} description="See upcoming club events and the activities available to student participants." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={CalendarDays} label="Upcoming events" value={upcomingEvents.length} detail={upcomingEvents.length > 0 ? `${upcomingEvents.length} this week` : 'None scheduled'} accent="bg-blue-50 text-blue-600" /><StatCard icon={Users} label="Open participant slots" value="84" detail="Across upcoming events" accent="bg-emerald-50 text-emerald-600" /><StatCard icon={CheckCircle2} label="Events attended" value="6" detail="This school year" accent="bg-amber-50 text-amber-600" /><StatCard icon={Activity} label="Certificates ready" value="2" detail="Available to download" accent="bg-violet-50 text-violet-600" /></div>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 p-6"><h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950"><CalendarDays size={19} className="text-blue-600" /> Upcoming events</h2><button type="button" title="Refresh events" onClick={loadEvents} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><RefreshCw size={17} className={isLoadingEvents ? 'animate-spin' : ''} /></button></div><div>{isLoadingEvents ? <div className="flex items-center justify-center py-8 text-sm text-slate-500"><RefreshCw size={16} className="mr-2 animate-spin" />Loading events...</div> : upcomingEvents.length === 0 ? <div className="px-6 py-8 text-center text-sm text-slate-500">No upcoming events scheduled yet.</div> : <div className="divide-y divide-slate-100">{upcomingEvents.map((event) => <article key={event.id} className="p-6 hover:bg-slate-50 transition"><h3 className="font-semibold text-slate-950">{event.title}</h3><p className="mt-2 text-sm text-slate-600">{event.description}</p><div className="mt-4 flex items-center justify-between"><div><p className="text-xs text-slate-500 uppercase tracking-wide">📍 {event.location}</p><p className="mt-1 text-sm font-medium text-slate-700">📅 {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p></div><button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Learn more →</button></div></article>)}</div>}</div></section>
    </>}
  </main></MainLayout>
}
