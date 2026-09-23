import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { batchCreateStudents } from '@/services/studentService'

export default function ImportModal({ onClose, onImported, eventId = null }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [importErrors, setImportErrors] = useState([])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    const students = []
    const errors = []

    const normalizeCell = (value) => (value || '').replace(/^"|"$/g, '').trim()

    lines.forEach((line, index) => {
      if (index === 0) return // Skip header

      const parts = line.split(',').map(normalizeCell)
      if (parts.length < 7) {
        errors.push(`Row ${index + 1}: Invalid format`)
        return
      }

      const [student_id, first_name, last_name, middle_initial, course, year_level, section] = parts

      if (!student_id || !first_name || !last_name || !course || !year_level || !section) {
        errors.push(`Row ${index + 1}: Missing required fields`)
        return
      }

      students.push({
        student_id: normalizeCell(student_id),
        first_name: normalizeCell(first_name),
        last_name: normalizeCell(last_name),
        middle_initial: normalizeCell(middle_initial) || '',
        course: normalizeCell(course),
        year_level: parseInt(normalizeCell(year_level), 10),
        section: normalizeCell(section),
      })
    })

    return { students, errors }
  }

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (e) => {
      const { students, errors } = parseCSV(e.target.result)
      
      if (errors.length > 0) {
        toast.error(`Found ${errors.length} errors in CSV`)
        console.error('CSV Errors:', errors)
      }

      setPreview(students)
    }
    reader.readAsText(selectedFile)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  const handleImport = async () => {
    if (preview.length === 0) {
      toast.error('No students to import')
      return
    }

    setIsLoading(true)
    setImportErrors([])
    const result = await batchCreateStudents(preview, eventId)
    setIsLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    const { total, created, errors } = result.data
    if (errors && errors.length > 0) {
      setImportErrors(errors)
      toast.error(`Imported ${created}/${total} students. ${errors.length} errors occurred.`)
      console.error('Import errors:', errors)
    } else {
      toast.success(`Successfully imported ${created} students`)
      onImported()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Import Students from CSV</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!file ? (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300'
                }`}
              >
                <Upload size={40} className="mx-auto mb-3 text-slate-400" />
                <p className="text-slate-700 font-medium mb-1">Drag and drop your CSV file here</p>
                <p className="text-sm text-slate-500 mb-4">or click to select</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  className="hidden"
                  id="csv-input"
                />
                <label htmlFor="csv-input" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                  Select File
                </label>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">CSV Format Required:</h3>
                <code className="text-sm text-slate-700 block mb-3">
                  student_id, first_name, last_name, middle_initial, course, year_level, section
                </code>
                <p className="text-sm text-slate-600 mb-3">Example:</p>
                <code className="text-xs text-slate-700 block bg-white border border-slate-200 p-3 rounded font-mono">
                  STU001, John, Doe, M, Computer Science, 1, A
                  <br />
                  STU002, Jane, Smith, A, Computer Science, 1, A
                  <br />
                  STU003, Bob, Johnson, R, Information Technology, 2, B
                </code>
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>{file.name}</strong> - {preview.length} students found
                </p>
              </div>

              {preview.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-slate-700">Student ID</th>
                          <th className="px-4 py-2 text-left font-medium text-slate-700">Name</th>
                          <th className="px-4 py-2 text-left font-medium text-slate-700">Course</th>
                          <th className="px-4 py-2 text-left font-medium text-slate-700">Year/Section</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {preview.slice(0, 5).map((student, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="px-4 py-2 font-mono text-slate-900">{student.student_id}</td>
                            <td className="px-4 py-2 text-slate-900">
                              {student.first_name} {student.middle_initial} {student.last_name}
                            </td>
                            <td className="px-4 py-2 text-slate-600">{student.course}</td>
                            <td className="px-4 py-2 text-slate-600">{student.year_level}/{student.section}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {preview.length > 5 && (
                    <div className="bg-slate-50 px-4 py-2 text-sm text-slate-600 text-center border-t border-slate-200">
                      ... and {preview.length - 5} more
                    </div>
                  )}
                </div>
              )}

              {importErrors.length > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-semibold">Import errors</p>
                  <ul className="mt-2 max-h-40 list-disc overflow-y-auto pl-5">
                    {importErrors.slice(0, 10).map((error, index) => (
                      <li key={index}>{typeof error === 'string' ? error : JSON.stringify(error)}</li>
                    ))}
                  </ul>
                  {importErrors.length > 10 && <p className="mt-2 text-xs">Showing the first 10 errors.</p>}
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setPreview([])
              }}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              {file ? 'Change File' : 'Cancel'}
            </button>
            {file && (
              <button
                type="button"
                onClick={handleImport}
                disabled={isLoading || preview.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Importing...' : `Import ${preview.length} Students`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
