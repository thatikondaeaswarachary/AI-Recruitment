import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, UserCircle } from 'lucide-react'
import axios from 'axios'

export default function UploadResume() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    
    setLoading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const res = await axios.post('/api/resumes/upload', formData)
      setResult(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to upload and parse resume. Ensure backend is running.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Upload Candidate Resume</h1>
        <p className="text-gray-500 mt-2">Let our AI extract structured profiles from PDF/DOCX files automatically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors cursor-pointer relative group">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                accept=".pdf,.docx"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-brand-500 transition-colors" />
              <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                <span className="relative rounded-md font-semibold text-brand-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-600 focus-within:ring-offset-2 hover:text-brand-500">
                  {file ? file.name : "Upload a file"}
                </span>
                {!file && <p className="pl-1">or drag and drop</p>}
              </div>
              <p className="text-xs leading-5 text-gray-500 mt-2">PDF or DOCX up to 10MB</p>
            </div>
            
            {error && (
              <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Parsing with AI...
                </span>
              ) : 'Parse Resume'}
            </button>
          </form>
        </div>

        {result && (
          <div className="glass-card rounded-2xl p-8 animate-slide-up bg-white/80">
            <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-100">
              <UserCircle size={48} className="text-brand-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">{result.name}</h2>
                <p className="text-gray-500 text-sm">{result.email}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
                  <CheckCircle size={16} className="mr-2 text-green-500" /> Extracted Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map(s => (
                    <span key={s} className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium border border-brand-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-2">
                  <FileText size={16} className="mr-2 text-brand-500" /> Experience
                </h3>
                <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                  {result.work_experience.map((exp, i) => (
                    <li key={i}>{exp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
