import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import UploadResume from './pages/UploadResume'
import JobDescription from './pages/JobDescription'
import MatchResults from './pages/MatchResults'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white text-gray-800">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadResume />} />
          <Route path="/jobs" element={<JobDescription />} />
          <Route path="/matches" element={<MatchResults />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
