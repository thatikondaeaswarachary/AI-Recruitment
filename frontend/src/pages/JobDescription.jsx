import { useState, useEffect } from 'react'
import { Plus, Briefcase, Tag } from 'lucide-react'
import axios from 'axios'

export default function JobDescription() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [savedJobs, setSavedJobs] = useState([])

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await axios.get('/api/jobs')
      setSavedJobs(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description) return
    
    const manualSkills = skills.split(',').map(s => s.trim()).filter(s => s)
    
    try {
      const res = await axios.post('/api/jobs', {
        title,
        description,
        required_skills: manualSkills
      })
      setSavedJobs([res.data, ...savedJobs])
      setTitle('')
      setDescription('')
      setSkills('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Job Description</h1>
          <p className="text-gray-500 mt-2">Create a new job posting. AI will extract key requirements for matching.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
              placeholder="e.g. Senior Full Stack Developer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow resize-none"
              placeholder="Paste the full job description here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manual Skills (Comma separated)</label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow"
              placeholder="e.g. React, Node.js, AWS"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Analyze & Save Job
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Briefcase className="mr-2 text-brand-600" /> Active Jobs
        </h2>
        
        <div className="space-y-4">
          {savedJobs.map(job => (
            <div key={job.id} className="glass-card rounded-xl p-5 hover:border-brand-300 transition-colors cursor-pointer border border-transparent">
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {job.required_skills && job.required_skills.map(s => (
                  <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md flex items-center">
                    <Tag size={12} className="mr-1" /> {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
