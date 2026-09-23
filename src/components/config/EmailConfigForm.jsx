import { useEffect, useState } from 'react'
import { CheckCircle2, Info, Mail, RotateCcw, Save, Send, Trash2 } from 'lucide-react'
import emailjs from '@emailjs/browser'
import { defaultEmailConfig, deleteEmailConfig, readEmailConfig, resetEmailConfig, saveEmailConfig, setActiveEmailProfile } from '@/services/emailConfigService'

export default function EmailConfigForm() {
  const [form, setForm] = useState(defaultEmailConfig)
  const [profiles, setProfiles] = useState([])
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const loadProfiles = () => {
    const config = readEmailConfig()
    setForm({ ...defaultEmailConfig, ...config, label: config.label || 'Primary account' })
    setProfiles(Array.isArray(config.profiles) && config.profiles.length ? config.profiles : [{ ...defaultEmailConfig, ...config, label: config.label || 'Primary account', id: config.activeProfileId || config.id || 'primary' }])
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const selectProfile = (profileId) => {
    const selectedProfile = profiles.find((profile) => profile.id === profileId)
    if (!selectedProfile) return
    const active = setActiveEmailProfile(profileId)
    setForm({ ...defaultEmailConfig, ...selectedProfile, ...active, label: selectedProfile.label || 'Primary account', activeProfileId: profileId })
    setProfiles(active.profiles || [])
    setStatus({ type: 'success', message: `${selectedProfile.label || 'Selected'} account is now active.` })
  }

  const saveConfig = (event) => {
    event.preventDefault()
    setIsSaving(true)
    setStatus({ type: 'idle', message: '' })

    try {
      const saved = saveEmailConfig({
        ...form,
        id: form.id || form.activeProfileId || '',
        label: form.label || form.departmentName || 'Primary account',
      })

      setForm({ ...defaultEmailConfig, ...saved, label: saved.label || 'Primary account' })
      setProfiles(saved.profiles || [])
      setStatus({ type: 'success', message: 'EmailJS account saved to this device only.' })
    } catch {
      setStatus({ type: 'error', message: 'Unable to save settings on this browser.' })
    } finally {
      setIsSaving(false)
    }
  }

  const removeProfile = () => {
    if (!form.id && !form.activeProfileId) return
    const next = deleteEmailConfig(form.id || form.activeProfileId)
    setForm({ ...defaultEmailConfig, ...next, label: next.label || 'Primary account' })
    setProfiles(next.profiles || [])
    setStatus({ type: 'success', message: 'Selected EmailJS account was removed from this device.' })
  }

  const resetConfig = () => {
    const cleared = resetEmailConfig()
    setForm(cleared)
    setProfiles([])
    setStatus({ type: 'success', message: 'EmailJS settings reset for this device.' })
  }

  const sendTest = async () => {
    if (!form.serviceId || !form.templateId || !form.publicKey) {
      setStatus({ type: 'error', message: 'Add your service ID, template ID, and public key before testing.' })
      return
    }

    setIsTesting(true)
    setStatus({ type: 'idle', message: '' })

    try {
      await emailjs.send(
        form.serviceId,
        form.templateId,
        {
          to_name: 'Test Student',
          to_email: 'student@example.com',
          event_name: 'Attendance Test',
          event_date: new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', dateStyle: 'medium' }).format(new Date()),
          event_venue: 'Club Office',
          course: 'BSIT',
          year_level: '3',
          section: 'A',
          department_name: form.departmentName || form.senderName || 'STI Attendance',
          sender_name: form.senderName || form.departmentName || 'STI Attendance',
        },
        { publicKey: form.publicKey },
      )

      setStatus({ type: 'success', message: 'Test email sent successfully through EmailJS.' })
    } catch (error) {
      console.error('EmailJS test failed:', error)
      setStatus({
        type: 'error',
        message: error?.text || 'EmailJS rejected the request. Check that the Service ID, Template ID, Public Key, and template variables all match the active EmailJS account.',
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_360px]">
      <form onSubmit={saveConfig} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <p className="font-semibold">Admin EmailJS Accounts</p>
          <p className="mt-1 leading-6">
            Save multiple EmailJS accounts for this browser. Switch between them when you need to send large batches, and each device keeps its own independent configuration.
          </p>
        </div>

        <div className="mb-5 space-y-2">
          <label className="block text-sm font-medium text-slate-700">Account name</label>
          <input
            value={form.label || ''}
            onChange={(event) => updateField('label', event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Main STI EmailJS account"
          />
        </div>

        {profiles.length > 0 && (
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-700">Saved accounts</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => selectProfile(profile.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${form.activeProfileId === profile.id || profile.id === readEmailConfig().activeProfileId ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}
                >
                  {profile.label || 'EmailJS account'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="space-y-2 md:col-span-1">
            <span className="block text-sm font-medium text-slate-700">Public Key *</span>
            <input
              value={form.publicKey}
              onChange={(event) => updateField('publicKey', event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="YOUR_PUBLIC_KEY"
            />
          </label>

          <label className="space-y-2 md:col-span-1">
            <span className="block text-sm font-medium text-slate-700">Service ID *</span>
            <input
              value={form.serviceId}
              onChange={(event) => updateField('serviceId', event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="service_xxxxxxxxx"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Template ID *</span>
            <input
              value={form.templateId}
              onChange={(event) => updateField('templateId', event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="template_xxxxxxxxx"
            />
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Department Name (optional)</span>
            <input
              value={form.departmentName}
              onChange={(event) => updateField('departmentName', event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="STI Attendance"
            />
          </label>

        </div>

        <label className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <span className="inline-flex items-center gap-2"><Mail size={16} className="text-blue-600" />Enable this EmailJS account</span>
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(event) => updateField('enabled', event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            <Save size={16} />{isSaving ? 'Saving...' : 'Save account'}
          </button>

          <button type="button" onClick={resetConfig} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <RotateCcw size={16} />Reset
          </button>

          <button type="button" onClick={removeProfile} disabled={!form.id && !form.activeProfileId} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">
            <Trash2 size={16} />Delete selected
          </button>

          <button type="button" onClick={sendTest} disabled={isTesting} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
            <Send size={16} />{isTesting ? 'Sending...' : 'Send test email'}
          </button>
        </div>

        {status.message && (
          <div className={`mt-6 flex items-start gap-3 rounded-xl border px-3 py-3 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
            {status.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5" /> : <Info size={18} className="mt-0.5" />}
            <span>{status.message}</span>
          </div>
        )}
      </form>

      <aside className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-white">Required Template Variables</h2>
        <div className="mt-4 space-y-4 text-sm text-slate-300">
          <p>Use the exact variable names below in your EmailJS template:</p>
          <ul className="space-y-2">
            <li>• <strong className="text-white">{'{{to_name}}'}</strong></li>
            <li>• <strong className="text-white">{'{{to_email}}'}</strong></li>
            <li>• <strong className="text-white">{'{{event_name}}'}</strong></li>
            <li>• <strong className="text-white">{'{{event_date}}'}</strong></li>
            <li>• <strong className="text-white">{'{{event_venue}}'}</strong></li>
            <li>• <strong className="text-white">{'{{course}}'}</strong></li>
            <li>• <strong className="text-white">{'{{year_level}}'}</strong></li>
            <li>• <strong className="text-white">{'{{section}}'}</strong></li>
            <li>• <strong className="text-white">{'{{department_name}}'}</strong></li>
          </ul>

          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3 text-xs text-slate-300">
            <p className="font-semibold text-white">Sample appreciation message</p>
            <div className="mt-2 space-y-1 leading-6">
              <p>Hello {'{{to_name}}'},</p>
              <p>Thank you for joining {'{{event_name}}'} at {'{{event_venue}}'} on {'{{event_date}}'}.</p>
              <p>Your participation in the event is truly appreciated. We hope you enjoyed the experience and look forward to seeing you again.</p>
              <p>Warm regards,<br />{'{{department_name}}'}</p>
            </div>
          </div>

          <p className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-100">
            This timeout email does not use certificate variables. It is sent when a student times out.
          </p>
        </div>
      </aside>
    </div>
  )
}
