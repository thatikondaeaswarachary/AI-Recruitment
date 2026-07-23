import { useState, useEffect } from 'react'
import { 
  Search, ChevronDown, MessageSquare, AlertTriangle, CheckCircle2, 
  Sparkles, Download, Filter, BookOpen, Award, Briefcase, RefreshCw, BarChart2
} from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import axios from 'axios'

export default function MatchResults() {
  const [expanded, setExpanded] = useState(null)
  const [matches, setMatches] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    try {
      const [matchesRes, jobsRes] = await Promise.all([
        axios.get('/api/matches'),
        axios.get('/api/jobs')
      ])
      setMatches(matchesRes.data || [])
      setJobs(jobsRes.data || [])
    } catch (err) {
      console.error("Failed to load matching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecalculateAll = async () => {
    setRecalculating(true)
    try {
      await axios.post('/api/matches/calculate_all')
      await fetchInitialData()
    } catch (err) {
      console.error("Failed to recalculate matches:", err)
    } finally {
      setRecalculating(false)
    }
  }

  const handleDownloadReport = async (matchId, candidateName, jobTitle) => {
    try {
      const response = await axios.get(`/api/matches/report/${matchId}/download`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Skill_Gap_Report_${(candidateName || 'Candidate').replace(/\s+/g, '_')}_${(jobTitle || 'Job').replace(/\s+/g, '_')}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error("Failed to download skill gap report:", err)
      alert("Could not download skill-gap report. Please try again.")
    }
  }

  // Filter logic
  const filteredMatches = matches.filter(match => {
    const matchesJob = selectedJobId === 'ALL' || match.job_id === parseInt(selectedJobId)
    const matchesSearch = 
      !searchTerm || 
      match.candidate?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.candidate?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesJob && matchesSearch
  })

  // Normalize score to 0-100 float
  const getScore = (val) => {
    if (val === undefined || val === null) return 0
    return val <= 1.0 ? Math.round(val * 100) : Math.round(val)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full uppercase tracking-wider">
              Milestone 2 Feature
            </span>
            <span className="text-xs text-gray-500">• Skill-Gap Engine</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Candidate Matching & Skill-Gap Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Automated candidate ranking, multi-attribute hiring score calculations, and actionable skill-gap reports.
          </p>
        </div>

        <button 
          onClick={handleRecalculateAll}
          disabled={recalculating}
          className="flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-brand-500/20 transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw size={18} className={recalculating ? 'animate-spin' : ''} />
          <span>{recalculating ? 'Recalculating Scores...' : 'Recalculate Matches'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 flex items-center bg-white/70 rounded-xl px-3 border border-gray-200">
          <Search className="text-gray-400" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate name, job title, or email..."
            className="w-full bg-transparent border-none focus:ring-0 px-3 py-2 text-gray-700 outline-none text-sm"
          />
        </div>

        <div className="flex items-center bg-white/70 rounded-xl px-3 border border-gray-200">
          <Filter className="text-gray-400 mr-2" size={18} />
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-gray-700 text-sm outline-none py-2 cursor-pointer"
          >
            <option value="ALL">All Job Roles ({jobs.length})</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidate Rankings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center text-gray-500">
            <RefreshCw className="animate-spin mx-auto mb-3 text-brand-500" size={32} />
            <p>Loading candidate matching engine data...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center text-gray-500">
            <AlertTriangle className="mx-auto mb-3 text-amber-500" size={36} />
            <h3 className="text-lg font-bold text-gray-800">No Candidate Matches Found</h3>
            <p className="text-sm mt-1">Upload candidate resumes and job descriptions to trigger automatic AI matching.</p>
          </div>
        ) : (
          filteredMatches.map((match, idx) => {
            const overallScore = getScore(match.overall_hiring_score || match.score)
            const skillMatchPct = getScore(match.skill_match_percentage || match.score)
            const skillGapPct = getScore(match.skill_gap_percentage || (100 - skillMatchPct))
            const expScore = getScore(match.experience_score || 85)
            const eduScore = getScore(match.education_score || 90)

            const matchedSkills = match.matched_skills || []
            const missingSkills = match.missing_skills || match.skill_gaps || []
            const additionalSkills = match.additional_skills || []

            const isExpanded = expanded === match.id

            // Chart data for visual summary
            const chartData = [
              { name: 'Skill Match %', value: skillMatchPct, color: '#10b981' },
              { name: 'Experience Score', value: expScore, color: '#6366f1' },
              { name: 'Education Score', value: eduScore, color: '#8b5cf6' },
              { name: 'Skill Gap %', value: skillGapPct, color: '#f59e0b' }
            ]

            return (
              <div 
                key={match.id} 
                className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 border ${
                  isExpanded ? 'border-brand-300 ring-2 ring-brand-500/20 shadow-lg' : 'border-gray-100 hover:border-gray-300'
                }`}
              >
                {/* Main Card Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  onClick={() => setExpanded(isExpanded ? null : match.id)}
                >
                  <div className="flex items-center space-x-5">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 text-brand-800 font-bold text-sm flex items-center justify-center">
                      #{idx + 1}
                    </div>

                    {/* Overall Hiring Score Dial */}
                    <div className="relative flex-shrink-0">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-gray-200" />
                        <circle 
                          cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" fill="transparent"
                          strokeDasharray="163.36"
                          strokeDashoffset={163.36 - (163.36 * overallScore) / 100}
                          className={overallScore >= 85 ? 'text-emerald-500' : overallScore >= 70 ? 'text-brand-500' : 'text-amber-500'}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold text-gray-800 leading-none">{overallScore}%</span>
                        <span className="text-[9px] text-gray-400 mt-0.5">SCORE</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{match.candidate?.name}</h3>
                      <p className="text-gray-500 text-sm flex items-center mt-0.5">
                        <Briefcase size={14} className="mr-1 text-gray-400" />
                        Applied for: <span className="font-semibold text-gray-700 ml-1">{match.job?.title}</span>
                      </p>
                      
                      {/* Metric Badges */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md border border-emerald-200">
                          Matched: {matchedSkills.length} skills ({skillMatchPct}%)
                        </span>
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-md border border-amber-200">
                          Gap: {missingSkills.length} missing ({skillGapPct}%)
                        </span>
                        {additionalSkills.length > 0 && (
                          <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-md border border-purple-200">
                            +{additionalSkills.length} Extra Skills
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadReport(match.id, match.candidate?.name, match.job?.title)
                      }}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 shadow-sm transition-colors"
                      title="Download Skill-Gap Report (CSV)"
                    >
                      <Download size={14} className="text-brand-600" />
                      <span>Download Report</span>
                    </button>

                    <ChevronDown className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-brand-600' : ''}`} />
                  </div>
                </div>

                {/* Expanded Skill Gap Details Section */}
                {isExpanded && (
                  <div className="p-6 border-t border-gray-100 bg-slate-50/70 space-y-8 animate-fade-in">
                    
                    {/* Visual Summaries & Score Metrics Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Score Breakdown Cards */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center">
                          <Award size={16} className="mr-1.5 text-brand-600" /> Hiring Score Breakdown
                        </h4>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span className="text-gray-600">Skill Match Weight (60%)</span>
                              <span className="font-bold text-emerald-600">{skillMatchPct}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${skillMatchPct}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span className="text-gray-600">Experience Alignment (25%)</span>
                              <span className="font-bold text-indigo-600">{expScore}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${expScore}%` }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-medium mb-1">
                              <span className="text-gray-600">Education Alignment (15%)</span>
                              <span className="font-bold text-purple-600">{eduScore}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${eduScore}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Visual Skill Gap Bar Chart */}
                      <div className="md:col-span-2 bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-900 flex items-center mb-2">
                          <BarChart2 size={16} className="mr-1.5 text-brand-600" /> Visual Summary of Skill Gaps & Alignment
                        </h4>
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                              <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    {/* Skill Analysis Categorization Columns (Matched, Missing, Additional) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Matched Skills */}
                      <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                        <h4 className="font-bold text-emerald-900 text-sm flex items-center mb-3">
                          <CheckCircle2 size={16} className="mr-1.5 text-emerald-600" /> Matched Skills ({matchedSkills.length})
                        </h4>
                        {matchedSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {matchedSkills.map(skill => (
                              <span key={skill} className="px-2.5 py-1 bg-white text-emerald-800 font-medium text-xs rounded-lg border border-emerald-300 shadow-xs">
                                ✓ {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-emerald-700 italic">No exact skill matches identified.</p>
                        )}
                      </div>

                      {/* Missing Skills (Skill Gap) */}
                      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                        <h4 className="font-bold text-amber-900 text-sm flex items-center mb-3">
                          <AlertTriangle size={16} className="mr-1.5 text-amber-600" /> Missing Skills / Gaps ({missingSkills.length})
                        </h4>
                        {missingSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {missingSkills.map(skill => (
                              <span key={skill} className="px-2.5 py-1 bg-white text-amber-800 font-medium text-xs rounded-lg border border-amber-300 shadow-xs">
                                ⚠ {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-emerald-700 font-medium flex items-center">
                            <CheckCircle2 size={14} className="mr-1 text-emerald-600" /> 100% skill match! No gaps found.
                          </div>
                        )}
                      </div>

                      {/* Additional Skills */}
                      <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-200">
                        <h4 className="font-bold text-purple-900 text-sm flex items-center mb-3">
                          <Sparkles size={16} className="mr-1.5 text-purple-600" /> Additional Candidate Skills ({additionalSkills.length})
                        </h4>
                        {additionalSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {additionalSkills.map(skill => (
                              <span key={skill} className="px-2.5 py-1 bg-white text-purple-800 font-medium text-xs rounded-lg border border-purple-300 shadow-xs">
                                ★ {skill}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-purple-700 italic">No extra skills beyond requirements.</p>
                        )}
                      </div>
                    </div>

                    {/* AI Recommendations for Missing Skills */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm space-y-3">
                      <h4 className="font-bold text-gray-900 text-sm flex items-center text-brand-700">
                        <BookOpen size={16} className="mr-2 text-brand-600" /> AI Recommendations for Missing Skill Remediation
                      </h4>
                      {match.recommendations && match.recommendations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {match.recommendations.map((rec, i) => (
                            <div key={i} className="text-xs text-gray-700 bg-brand-50/50 p-3 rounded-lg border border-brand-150 flex items-start">
                              <span className="font-bold text-brand-700 mr-2">•</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">No remediation needed. Candidate meets all required skills.</p>
                      )}
                    </div>

                    {/* Tailored AI Interview Questions */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm space-y-3">
                      <h4 className="font-bold text-gray-900 text-sm flex items-center text-indigo-700">
                        <MessageSquare size={16} className="mr-2 text-indigo-600" /> Tailored AI Interview Questions
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {match.interview_questions && match.interview_questions.map((q, i) => (
                          <li key={i} className="text-xs text-gray-700 bg-indigo-50/40 p-3 rounded-lg border border-indigo-100 flex items-start">
                            <span className="font-bold text-indigo-600 mr-2">Q{i + 1}.</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
