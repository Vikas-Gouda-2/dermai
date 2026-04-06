import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AnimatePresence } from 'framer-motion'

import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ScanPage from './pages/ScanPage'
import AnalysingPage from './pages/AnalysingPage'
import ResultsPage from './pages/ResultsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import ReportPage from './pages/ReportPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/analysing" element={<AnalysingPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
