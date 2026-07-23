import { useState, useEffect } from 'react'
import { Search, ChevronDown, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

export default function MatchResults() {
  const [expanded, setExpanded] = useState(null)
  const [matches, setMatches] = useState([])

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await axios.get('/api/matches')
      setMatches(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Compatibility Matches</h1>
        <p className="text-gray-500 mt-2">Ranked candidate lists based on job requirements and skill analysis.</p>
      </div>

      <div className="glass-card rounded-2xl p-4 flex items-center mb-8">
        <Search className="text-gray-400 ml-2" size={20} />
        <input 
          type="text" 
          placeholder="Search by candidate name or job title..."
          className="w-full bg-transparent border-none focus:ring-0 px-4 text-gray-700 outline-none"
        />
      </div>

      <div className="space-y-4">
        {matches.map((match) => (
          <div key={match.id} className="glass-card rounded-2xl overflow-hidden transition-all duration-300">
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50/50 flex items-center justify-between"
              onClick={() => setExpanded(expanded === match.id ? null : match.id)}
            >
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200" />
                    <circle 
                      cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                      strokeDasharray="175.93"
                      strokeDashoffset={175.93 - (175.93 * (match.score * 100)) / 100}
                      className={match.score >= 0.9 ? 'text-green-500' : match.score >= 0.7 ? 'text-brand-500' : 'text-orange-500'}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-700">{Math.round(match.score * 100)}%</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{match.candidate?.name}</h3>
                  <p className="text-gray-500 text-sm">Applied for: {match.job?.title}</p>
                </div>
              </div>
              
              <ChevronDown className={`text-gray-400 transition-transform ${expanded === match.id ? 'rotate-180' : ''}`} />
            </div>

            {expanded === match.id && (
              <div className="p-6 border-t border-gray-100 bg-white/50 animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center mb-4">
                    <AlertTriangle size={18} className="mr-2 text-orange-500" /> Skill Gaps Identified
                  </h4>
                  {match.skill_gaps && match.skill_gaps.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {match.skill_gaps.map(gap => (
                        <span key={gap} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm border border-orange-200">
                          {gap}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle2 size={16} className="mr-2" /> No significant gaps detected.
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center mb-4">
                    <MessageSquare size={18} className="mr-2 text-brand-500" /> AI Generated Interview Questions
                  </h4>
                  <ul className="space-y-3">
                    {match.interview_questions && match.interview_questions.map((q, i) => (
                      <li key={i} className="text-sm text-gray-700 bg-brand-50 p-3 rounded-lg border border-brand-100">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
