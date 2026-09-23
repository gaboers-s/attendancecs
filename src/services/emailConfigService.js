export const EMAILJS_STORAGE_KEY = 'attendance_emailjs_config_v1'

export const defaultEmailConfig = {
  id: '',
  label: 'Primary account',
  serviceId: '',
  templateId: '',
  publicKey: '',
  departmentName: 'STI Attendance',
  senderName: 'STI Attendance',
  enabled: true,
  profiles: [],
  activeProfileId: '',
}

function normalizeProfile(config = {}, fallbackLabel = 'Primary account') {
  const profileId = config.id || config.activeProfileId || `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const label = config.label || config.departmentName || config.senderName || fallbackLabel

  return {
    id: profileId,
    label,
    serviceId: config.serviceId || '',
    templateId: config.templateId || '',
    publicKey: config.publicKey || '',
    departmentName: config.departmentName || config.senderName || 'STI Attendance',
    senderName: config.senderName || config.departmentName || 'STI Attendance',
    enabled: Boolean(config.enabled),
  }
}

export function readEmailConfig() {
  try {
    const raw = localStorage.getItem(EMAILJS_STORAGE_KEY)
    if (!raw) {
      return { ...defaultEmailConfig }
    }

    const parsed = JSON.parse(raw)

    if (Array.isArray(parsed?.profiles)) {
      const profiles = parsed.profiles.map((profile) => normalizeProfile(profile, 'Primary account'))
      const activeProfileId = parsed.activeProfileId || profiles[0]?.id || ''
      const activeProfile = profiles.find((profile) => profile.id === activeProfileId) || profiles[0] || { ...defaultEmailConfig }
      return {
        ...defaultEmailConfig,
        ...activeProfile,
        profiles,
        activeProfileId: activeProfile.id || '',
      }
    }

    const singleProfile = normalizeProfile(parsed || {}, 'Primary account')
    return {
      ...defaultEmailConfig,
      ...singleProfile,
      profiles: [singleProfile],
      activeProfileId: singleProfile.id,
    }
  } catch {
    return { ...defaultEmailConfig }
  }
}

export function saveEmailConfig(config) {
  const current = readEmailConfig()
  const existingProfiles = Array.isArray(current.profiles) && current.profiles.length ? current.profiles : [normalizeProfile(current, 'Primary account')]

  const nextProfile = normalizeProfile({
    ...config,
    id: config?.id || config?.activeProfileId || current.activeProfileId || existingProfiles[0]?.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label: config?.label || config?.departmentName || config?.senderName || 'Primary account',
  })

  const nextProfiles = existingProfiles.some((profile) => profile.id === nextProfile.id)
    ? existingProfiles.map((profile) => (profile.id === nextProfile.id ? nextProfile : profile))
    : [...existingProfiles, nextProfile]

  const activeProfileId = config?.activeProfileId || nextProfile.id
  const payload = {
    activeProfileId,
    profiles: nextProfiles.map((profile) => ({
      ...profile,
      enabled: profile.id === activeProfileId,
    })),
  }

  localStorage.setItem(EMAILJS_STORAGE_KEY, JSON.stringify(payload))

  const active = payload.profiles.find((profile) => profile.id === activeProfileId) || nextProfile
  return {
    ...defaultEmailConfig,
    ...active,
    profileId: active.id,
    id: active.id,
    profiles: payload.profiles,
    activeProfileId: active.id,
  }
}

export function setActiveEmailProfile(profileId) {
  const current = readEmailConfig()
  const profiles = (current.profiles || []).map((profile) => ({
    ...profile,
    enabled: profile.id === profileId,
  }))

  const payload = {
    activeProfileId: profileId,
    profiles,
  }

  localStorage.setItem(EMAILJS_STORAGE_KEY, JSON.stringify(payload))

  const active = profiles.find((profile) => profile.id === profileId) || profiles[0] || { ...defaultEmailConfig }
  return {
    ...defaultEmailConfig,
    ...active,
    profiles,
    activeProfileId: active.id || '',
  }
}

export function deleteEmailConfig(profileId) {
  const current = readEmailConfig()
  const profiles = (current.profiles || []).filter((profile) => profile.id !== profileId)
  const activeProfile = profiles[0] || { ...defaultEmailConfig }
  const payload = {
    activeProfileId: activeProfile.id || '',
    profiles,
  }

  localStorage.setItem(EMAILJS_STORAGE_KEY, JSON.stringify(payload))
  return {
    ...defaultEmailConfig,
    ...activeProfile,
    profiles,
    activeProfileId: activeProfile.id || '',
  }
}

export function resetEmailConfig() {
  const resetConfig = { ...defaultEmailConfig }
  localStorage.removeItem(EMAILJS_STORAGE_KEY)
  return resetConfig
}

export function buildStudentEmail(student) {
  const directEmail = student?.email?.trim()
  if (directEmail) return directEmail

  const lastName = (student?.last_name || '').trim().replace(/\s+/g, '').toLowerCase()
  const rawStudentId = String(student?.student_code || student?.student_id || '').trim()
  const studentCode = rawStudentId.toLowerCase()

  const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rawStudentId)

  if (!lastName || !studentCode || looksLikeUuid) return ''
  return `${lastName}.${studentCode}@alabang.sti.edu.ph`
}

export function buildTimeoutEmailPayload(student, event) {
  const config = readEmailConfig()
  const fullName = [student?.first_name, student?.middle_initial, student?.last_name].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
  const eventInfo = event || {}
  const eventDate = eventInfo?.starts_at || eventInfo?.event_date || new Date().toISOString()
  const eventVenue = eventInfo?.location || eventInfo?.venue || 'Club venue'

  return {
    to_name: fullName || student?.student_code || 'Student',
    to_email: buildStudentEmail(student),
    event_name: eventInfo?.title || 'Club Event',
    event_date: new Intl.DateTimeFormat('en-PH', {
      timeZone: 'Asia/Manila',
      dateStyle: 'medium',
    }).format(new Date(eventDate)),
    event_venue: eventVenue,
    course: student?.course || '',
    year_level: student?.year_level || '',
    section: student?.section || '',
    department_name: config.departmentName || config.senderName || 'STI Attendance',
    sender_name: config.senderName || config.departmentName || 'STI Attendance',
  }
}
