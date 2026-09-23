import { useEffect, useMemo, useState } from 'react'
import { Plus, Upload } from 'lucide-react'
import { Toaster } from 'react-hot-toast'
import MainLayout from '@/components/layout/MainLayout'
import StudentTable from '@/components/students/StudentTable'
import StudentForm from '@/components/students/StudentForm'
import ImportModal from '@/components/students/ImportModal'
import { getStudents } from '@/services/studentService'
import { getEvents } from '@/services/eventService'
import { useAuth } from '@/context/AuthContext'

const PAGE_SIZE = 10

export default function StudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [formStudent, setFormStudent] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)

  async function loadStudents(eventId = selectedEventId) {
    setIsLoading(true)
    const result = await getStudents(eventId || null)
    setIsLoading(false)
    if (result.error) {
      console.error('Failed to load students:', result.error)
      setStudents([])
    } else {
      setStudents(result.data)
    }
  }

  async function loadEvents() {
    const result = await getEvents()
    if (result.error) {
      console.error('Failed to load events:', result.error)
      setEvents([])
      return
    }

    const nextEvents = result.data || []
    setEvents(nextEvents)
    if (!selectedEventId && nextEvents.length > 0) {
      setSelectedEventId(nextEvents[0].id)
    }
  }

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadStudents(selectedEventId || null)
    }
  }, [user, selectedEventId])

  const courseOptions = useMemo(() => {
    return Array.from(new Set(students.map((student) => student.course).filter(Boolean))).sort((a, b) => a.localeCompare(b))
  }, [students])

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || null,
    [events, selectedEventId],
  )

  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase()

    return students.filter((student) => {
      const matchesCourse = courseFilter === 'all' || student.course === courseFilter
      const matchesSearch = !normalizedQuery || [
        student.student_id,
        student.first_name,
        student.last_name,
        student.middle_initial,
        student.course,
        student.section,
        `${student.first_name} ${student.middle_initial || ''} ${student.last_name}`.trim(),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)

      return matchesCourse && matchesSearch
    })
  }, [students, courseFilter, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, courseFilter, selectedEventId])

  const paginatedStudents = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages)
    const start = (safePage - 1) * PAGE_SIZE
    return filteredStudents.slice(start, start + PAGE_SIZE)
  }, [filteredStudents, currentPage, totalPages])

  const openAddForm = () => {
    setFormStudent(null)
    setIsFormOpen(true)
  }

  const openEditForm = (student) => {
    setFormStudent(student)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setFormStudent(null)
  }

  const closeImport = () => {
    setIsImportOpen(false)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setSearchTerm(searchInput)
    setCurrentPage(1)
  }

  return (
    <MainLayout>
      <Toaster position="top-right" />
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              Student Management
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Attendance Students
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {selectedEvent ? `Managing students for: ${selectedEvent.title}` : 'Choose an event to assign students to.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              Event
              <select
                value={selectedEventId}
                onChange={(event) => setSelectedEventId(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
              >
                {!selectedEventId && <option value="">Choose an event</option>}
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Upload size={17} />
              Import CSV
            </button>
            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Student
            </button>
          </div>
        </div>

        <StudentTable
          students={paginatedStudents}
          allStudentsCount={filteredStudents.length}
          totalStudents={students.length}
          isLoading={isLoading}
          onEdit={openEditForm}
          onRefresh={loadStudents}
          selectedEvent={selectedEvent}
          eventOptions={events}
          onEventChange={setSelectedEventId}
          courseFilter={courseFilter}
          onCourseFilterChange={setCourseFilter}
          courseOptions={courseOptions}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={handleSearchSubmit}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </main>

      {isFormOpen && (
        <StudentForm
          student={formStudent}
          onClose={closeForm}
          onSaved={() => loadStudents(selectedEventId || null)}
        />
      )}

      {isImportOpen && (
        <ImportModal
          onClose={closeImport}
          onImported={() => loadStudents(selectedEventId || null)}
          eventId={selectedEventId || null}
        />
      )}
    </MainLayout>
  )
}
