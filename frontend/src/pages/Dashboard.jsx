import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Briefcase, CheckCircle, Clock } from 'lucide-react'

const mockData = [
  { name: 'Software Eng', applicants: 45, matched: 12 },
  { name: 'Data Scientist', applicants: 30, matched: 8 },
  { name: 'Product Mgr', applicants: 25, matched: 5 },
  { name: 'UX Designer', applicants: 15, matched: 4 },
]

export default function Dashboard() {
  const stats = [
    { title: 'Total Candidates', value: '1,248', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Open Roles', value: '12', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Avg Match Rate', value: '64%', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Time to Hire', value: '18 Days', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Recruitment Overview</h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your job postings today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Pipeline by Role</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="applicants" name="Total Applicants" fill="#E0F2FE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="matched" name="Highly Matched" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
