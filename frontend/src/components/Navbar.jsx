import { Link, useLocation } from 'react-router-dom'
import { Briefcase, FileText, Users, LayoutDashboard, BrainCircuit } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Candidates', icon: Users },
    { path: '/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/matches', label: 'Matches', icon: FileText },
  ]

  return (
    <nav className="glass-card sticky top-0 z-50 mb-8 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-600 p-2 rounded-lg text-white">
              <BrainCircuit size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-900 tracking-tight">AI Recruitment</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {label}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold border border-brand-200 shadow-sm">
              R
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
