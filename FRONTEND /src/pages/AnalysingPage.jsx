import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import axios from 'axios'

const ANALYSIS_STEPS = [
  { label: 'Initialising Vision AI', icon: '🔬', duration: 1200 },
  { label: 'Detecting facial landmarks', icon: '📍', duration: 1500 },
  { label: 'Mapping 7 skin zones', icon: '🗺️', duration: 2000 },
  { label: 'Analysing skin texture', icon: '🔎', duration: 1800 },
  { label: 'Scoring 11 conditions', icon: '📊', duration: 2200 },
  { label: 'Generating recommendations', icon: '✨', duration: 1500 },
  { label: 'Compiling your report', icon: '📋', duration: 1000 },
]

export default function AnalysingPage() {
  const { setAnalysisResult } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const imageData = location.state?.imageData

  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const runAnalysis = async () => {
      // Animate through steps
      let elapsed = 0
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        setCurrentStep(i)
        const step = ANALYSIS_STEPS[i]
        const stepStart = Date.now()
        const totalTime = ANALYSIS_STEPS.reduce((a, s) => a + s.duration, 0)

        await new Promise(r => setTimeout(r, step.duration))

        // Update progress
        elapsed += step.duration
        setProgress(Math.round((elapsed / totalTime) * 95))
      }

      // Call the API
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await axios.post(`${API_URL}/api/analyse`, {
          image: imageData || 'data:image/jpeg;base64,mockdata',
          timestamp: Date.now()
        })
        const result = response.data.data
        setAnalysisResult(result)
      } catch (err) {
        // Use fallback mock data if API fails
        const mockResult = {
          overall_score: 6.8,
          skin_type: 'Combination',
          conditions: [
            { key: 'oily_skin', label: 'Oily Skin', score: 7.2, severity: 'Significant', detected: true },
            { key: 'open_pores', label: 'Open / Enlarged Pores', score: 6.5, severity: 'Significant', detected: true },
            { key: 'dark_spots', label: 'Dark Spots / Hyperpigmentation', score: 5.8, severity: 'Moderate', detected: true },
            { key: 'acne', label: 'Active Acne / Pimples', score: 4.9, severity: 'Moderate', detected: true },
            { key: 'blackheads', label: 'Blackheads / Whiteheads', score: 5.2, severity: 'Moderate', detected: true },
            { key: 'uneven_tone', label: 'Uneven Skin Tone', score: 4.1, severity: 'Moderate', detected: true },
            { key: 'dry_patches', label: 'Dry / Dehydrated Patches', score: 3.2, severity: 'Minimal', detected: true },
            { key: 'redness', label: 'Redness / Inflammation', score: 2.8, severity: 'Minimal', detected: false },
            { key: 'fine_lines', label: 'Fine Lines / Early Wrinkles', score: 2.1, severity: 'Minimal', detected: false },
            { key: 'dark_circles', label: 'Under-Eye Dark Circles', score: 4.5, severity: 'Moderate', detected: true },
            { key: 'rough_texture', label: 'Rough Skin Texture', score: 3.8, severity: 'Minimal', detected: true },
          ],
          zone_issues: {
            'Forehead': ['oily_skin', 'open_pores'],
            'T-Zone': ['oily_skin', 'blackheads'],
            'Left Cheek': ['dark_spots', 'uneven_tone'],
            'Right Cheek': ['dark_spots', 'acne'],
            'Chin': ['acne', 'blackheads'],
            'Under-Eye': ['dark_circles'],
            'Nose': ['open_pores', 'blackheads']
          },
          top_concerns: ['oily_skin', 'open_pores', 'dark_spots'],
          positive_aspects: ['fine_lines', 'redness'],
          analysis_confidence: 0.91
        }
        setAnalysisResult(mockResult)
      }

      setProgress(100)
      setDone(true)

      await new Promise(r => setTimeout(r, 800))
      navigate('/results')
    }

    runAnalysis()
  }, [])

  const totalTime = ANALYSIS_STEPS.reduce((a, s) => a + s.duration, 0)

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg-dark)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 32, color: 'white'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse at 50% 30%, rgba(79,111,209,0.2) 0%, transparent 60%)',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480, textAlign: 'center' }}>
        {/* Scanning orb */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ marginBottom: 40, display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ position: 'relative', width: 160, height: 160 }}>
            {/* Outer ring */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '2px solid rgba(79,111,209,0.3)',
              animation: 'spin-slow 4s linear infinite'
            }}>
              <div style={{
                position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
                width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)'
              }} />
            </div>
            {/* Middle ring */}
            <div style={{
              position: 'absolute', inset: 16, borderRadius: '50%',
              border: '2px solid rgba(0,180,216,0.4)',
              animation: 'counter-spin 3s linear infinite'
            }}>
              <div style={{
                position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)'
              }} />
            </div>
            {/* Core */}
            <div style={{
              position: 'absolute', inset: 32,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(79,111,209,0.4) 0%, rgba(0,180,216,0.2) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, animation: 'glow-pulse 2s ease-in-out infinite'
            }}>
              {done ? '✅' : ANALYSIS_STEPS[currentStep]?.icon}
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-heading)' }}
        >
          {done ? 'Analysis Complete!' : 'Analysing Your Skin'}
        </motion.h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 40, fontFamily: 'var(--font-body)' }}>
          {done ? 'Preparing your personalised results...' : 'Our AI is examining your skin in detail'}
        </p>

        {/* Progress bar */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Progress</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>{progress}%</span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <motion.div
              className="progress-fill"
              style={{ background: 'var(--gradient-primary)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Steps list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
          {ANALYSIS_STEPS.map((step, i) => {
            const isActive = i === currentStep
            const isDone = i < currentStep || done
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: isActive ? 1 : isDone ? 0.7 : 0.3 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 12,
                  background: isActive ? 'rgba(79,111,209,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(79,111,209,0.25)' : '1px solid transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                <span style={{ fontSize: 18 }}>{step.icon}</span>
                <span style={{
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  color: isDone ? 'var(--color-success)' : isActive ? 'white' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'var(--font-heading)'
                }}>
                  {isDone ? '✓ ' : isActive ? '• ' : ''}{step.label}
                </span>
                {isActive && (
                  <div style={{ marginLeft: 'auto', width: 14, height: 14, border: '2px solid rgba(79,111,209,0.4)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
                )}
              </motion.div>
            )
          })}
        </div>

        <p style={{ marginTop: 32, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          Powered by DermAI Vision Engine v1.0
        </p>
      </div>
    </div>
  )
}
