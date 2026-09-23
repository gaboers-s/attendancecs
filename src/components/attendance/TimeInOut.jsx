import emailjs from '@emailjs/browser'
import { Clock3, LogIn, LogOut } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { timeInStudent, timeOutStudent } from '@/services/attendanceService'
import { buildStudentEmail, buildTimeoutEmailPayload, readEmailConfig } from '@/services/emailConfigService'

export default function TimeInOut({ student, eventId, event, onChanged }) {
	const isTimedIn = Boolean(student.time_in)
	const isTimedOut = Boolean(student.time_out)

	const sendTimeoutEmail = async () => {
		const config = readEmailConfig()
		if (!config.enabled || !config.serviceId || !config.templateId || !config.publicKey) {
			return false
		}

		const studentEmail = buildStudentEmail(student)
		if (!studentEmail) {
			console.warn('Timeout email skipped: no student email could be derived for', student)
			return false
		}

		try {
			const eventDetails = event || {
				title: 'Club Event',
				location: 'Club Venue',
				event_date: new Date().toISOString(),
				starts_at: new Date().toISOString(),
			}
			const payload = buildTimeoutEmailPayload(student, eventDetails)
			payload.to_email = studentEmail
			await emailjs.send(config.serviceId, config.templateId, payload, { publicKey: config.publicKey })
			return true
		} catch (error) {
			console.error('EmailJS timeout email failed:', error)
			return false
		}
	}

	const updateAttendance = async (action) => {
		const result = action === 'in'
			? await timeInStudent(student.student_id, eventId)
			: await timeOutStudent(student.student_id, eventId)
		if (result.error) {
			toast.error(result.error)
			return
		}
		if (action === 'out') {
			const emailSent = await sendTimeoutEmail()
			if (emailSent) {
				toast.success('Student timed out and appreciation email sent.')
			} else {
				const config = readEmailConfig()
				if (config.enabled && config.serviceId && config.templateId && config.publicKey) {
					toast.error('Student timed out, but the appreciation email could not be sent.')
				} else {
					toast('Student timed out. EmailJS is not configured, so no email was sent.', { icon: '⚠️' })
				}
			}
			onChanged()
			return
		}
		toast.success('Student timed in')
		onChanged()
	}

	return (
		<div className="flex items-center gap-2">
			<button type="button" disabled={isTimedIn} onClick={() => updateAttendance('in')} title="Time in student" className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
				<LogIn size={14} /> Time in
			</button>
			<button type="button" disabled={!isTimedIn || isTimedOut} onClick={() => updateAttendance('out')} title="Time out student" className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
				<LogOut size={14} /> Time out
			</button>
			<Clock3 size={15} className="text-slate-400" aria-label="Server timestamp" />
		</div>
	)
}
