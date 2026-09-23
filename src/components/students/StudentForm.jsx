import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createStudent, updateStudent } from '@/services/studentService'

export default function StudentForm({ student, onClose, onSaved, eventId = null }) {
  const [formData, setFormData] = useState(student || {
    student_id: '',
    first_name: '',
    last_name: '',
    middle_initial: '',
    course: '',
    year_level: 1,
    section: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year_level' ? parseInt(value) : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.student_id.trim() || !formData.first_name.trim() || !formData.last_name.trim() || !formData.course.trim() || !formData.section.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    const result = student 
      ? await updateStudent(student.id, formData)
      : await createStudent(formData, eventId)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(student ? 'Student updated successfully' : 'Student added successfully')
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            {student ? 'Edit Student' : 'Add Student'}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Student ID *
            </label>
            <input
              type="text"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              disabled={!!student}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              placeholder="e.g., 412281"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ced"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Laporteza"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Middle Initial
            </label>
            <input
              type="text"
              name="middle_initial"
              value={formData.middle_initial}
              onChange={handleChange}
              maxLength={1}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="L"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Course *
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="BSIT"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Year Level *
            </label>
            <select
              name="year_level"
              value={formData.year_level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
              <option value={4}>4th Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Section *
            </label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="512"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
