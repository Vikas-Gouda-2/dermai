import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Camera, RefreshCw, Zap, AlertCircle, ChevronLeft, Info } from 'lucide-react'
import { useApp } from '../context/AppContext'
import axios from 'axios'

const ZONES = [
  { id: 'forehead', label: 'Forehead', top: '12%', left: '50%' },
  { id: 'left-cheek', label: 'L. Cheek', top: '52%', left: '22%' },
  { id: 'right-cheek', label: 'R. Cheek', top: '52%', left: '78%' },
  { id: 'nose', label: 'Nose', top: '52%', left: '50%' },
  { id: 'chin', label: 'Chin', top: '82%', left: '50%' },
  { id: 'under-eye-l', label: 'Under-Eye', top: '38%', left: '28%' },
  { id: 't-zone', label: 'T-Zone', top: '35%', left: '50%' },
]

export default function ScanPage() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const navigate = useNavigate()
  const { setAnalysisResult } = useApp()

  const [cameraState, setCameraState] = useState('idle') // idle | loading | active | error | captured
  const [permission, setPermission] = useState(null) // null | granted | denied
  const [activeZone, setActiveZone] = useState(0)
  const [faceDetected, setFaceDetected] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [analysing, setAnalysing] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  // Cycle through zones for visual effect
  useEffect(() => {
    if (cameraState !== 'active') return
    const interval = setInterval(() => {
      setActiveZone(z => (z + 1) % ZONES.length)
    }, 800)
    return () => clearInterval(interval)
  }, [cameraState])

  // Simulate face detection after camera starts
  useEffect(() => {
    if (cameraState !== 'active') return
    const timer = setTimeout(() => setFaceDetected(true), 2000)
    return () => clearTimeout(timer)
  }, [cameraState])

  const startCamera = useCallback(async () => {
    setCameraState('loading')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: 'user'
        }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setPermission('granted')
      setCameraState('active')
    } catch (err) {
      setPermission('denied')
      setCameraState('error')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const captureAndAnalyse = useCallback(async () => {
    if (!videoRef.current || !faceDetected) return

    // Capture frame
    const canvas = canvasRef.current
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.92)
    setCapturedImage(imageData)
    setCameraState('captured')
    stopCamera()

    setAnalysing(true)

    // Animate progress
    const progressInterval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 90) { clearInterval(progressInterval); return 90 }
        return p + Math.random() * 12
      })
    }, 300)

    navigate('/analysing', { state: { imageData } })
  }, [faceDetected, stopCamera, navigate])

  const retake = useCallback(() => {
    setCapturedImage(null)
    setScanProgress(0)
    setFaceDetected(false)
    startCamera()
  }, [startCamera])

  return (
    <div style={{ minHeight: '100vh', background: '#060B16', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14 }}>
          <ChevronLeft size={18} />
          Back
        </Link>
        <h1 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>Skin Scan</h1>
        <div style={{ width: 60 }} />
      </div>

      {/* Main Camera Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px 24px' }}>

        {/* Camera Frame */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 480, aspectRatio: '3/4', marginBottom: 24 }}>

          {/* Camera permission denied */}
          {cameraState === 'error' && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{
                position: 'absolute', inset: 0, borderRadius: 28,
                background: 'rgba(239,71,111,0.08)', border: '2px solid rgba(239,71,111,0.3)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 16, padding: 32
              }}
            >
              <AlertCircle size={48} color="var(--color-alert)" />
              <h3 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center' }}>Camera Access Required</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.6 }}>
                Please allow camera access in your browser settings, then try again.
              </p>
              <button onClick={startCamera} className="btn-primary" style={{ marginTop: 8 }}>
                <RefreshCw size={16} />
                Try Again
              </button>
            </motion.div>
          )}

          {/* Loading camera */}
          {cameraState === 'loading' && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 28,
              background: 'rgba(79,111,209,0.08)', border: '2px solid rgba(79,111,209,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16
            }}>
              <div style={{ width: 40, height: 40, border: '3px solid rgba(79,111,209,0.3)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Starting camera...</p>
            </div>
          )}

          {/* Live camera feed */}
          <video
            ref={videoRef}
            autoPlay muted playsInline
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              borderRadius: 28,
              display: cameraState === 'active' ? 'block' : 'none',
              transform: 'scaleX(-1)', // mirror
            }}
          />

          {/* Hidden canvas for capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Overlay: Face frame + zones (shown when active) */}
          {cameraState === 'active' && (
            <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', pointerEvents: 'none' }}>
              {/* Corner brackets */}
              {[
                { top: 24, left: 24, transform: 'none' },
                { top: 24, right: 24, transform: 'rotate(90deg)' },
                { bottom: 24, left: 24, transform: 'rotate(-90deg)' },
                { bottom: 24, right: 24, transform: 'rotate(180deg)' }
              ].map((pos, i) => (
                <svg key={i} width="30" height="30" viewBox="0 0 30 30" style={{ position: 'absolute', ...pos }}>
                  <path d="M 3 27 L 3 3 L 27 3" stroke="var(--color-accent)" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              ))}

              {/* Scan line */}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
                animation: 'scan-line 2.5s ease-in-out infinite',
                boxShadow: '0 0 15px var(--color-accent), 0 0 40px rgba(0,180,216,0.3)'
              }} />

              {/* Face oval guide */}
              <div style={{
                position: 'absolute', top: '10%', left: '15%', right: '15%', bottom: '8%',
                border: `2px solid ${faceDetected ? 'var(--color-success)' : 'rgba(79,111,209,0.6)'}`,
                borderRadius: '50%',
                transition: 'border-color 0.5s ease',
                boxShadow: faceDetected ? '0 0 30px rgba(6,214,160,0.2)' : '0 0 20px rgba(79,111,209,0.1)'
              }} />

              {/* Zone indicators */}
              {ZONES.map((zone, i) => (
                <div key={zone.id}
                  style={{
                    position: 'absolute', top: zone.top, left: zone.left,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div style={{
                    width: i === activeZone ? 12 : 7,
                    height: i === activeZone ? 12 : 7,
                    borderRadius: '50%',
                    background: i === activeZone ? 'var(--color-accent)' : 'rgba(255,255,255,0.4)',
                    boxShadow: i === activeZone ? '0 0 16px var(--color-accent), 0 0 30px rgba(0,180,216,0.4)' : 'none',
                    transition: 'all 0.3s ease',
                    animation: i === activeZone ? 'zone-pulse 0.8s ease-in-out infinite' : 'none'
                  }} />
                  {i === activeZone && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(0,180,216,0.9)', borderRadius: 6, padding: '2px 8px',
                        fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'var(--font-heading)'
                      }}
                    >{zone.label}</motion.div>
                  )}
                </div>
              ))}

              {/* Face detected indicator */}
              <AnimatePresence>
                {faceDetected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      position: 'absolute', top: 16, right: 16,
                      background: 'rgba(6,214,160,0.15)', border: '1px solid rgba(6,214,160,0.4)',
                      borderRadius: 10, padding: '6px 12px',
                      display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-success)', fontFamily: 'var(--font-heading)' }}>FACE DETECTED</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div style={{ textAlign: 'center', marginBottom: 24, maxWidth: 400 }}>
          {cameraState === 'active' && !faceDetected && (
            <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Info size={14} />
              Position your face within the oval guide
            </motion.p>
          )}
          {cameraState === 'active' && faceDetected && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ color: 'var(--color-success)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              ✓ Face aligned — Ready to scan!
            </motion.p>
          )}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
            Ensure good lighting · Remove glasses if possible · Look straight ahead
          </p>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={captureAndAnalyse}
            id="scan-capture-btn"
            disabled={!faceDetected || analysing}
            className="btn-primary"
            style={{
              fontSize: 16, padding: '16px 40px',
              opacity: faceDetected ? 1 : 0.4,
              cursor: faceDetected ? 'pointer' : 'not-allowed'
            }}
          >
            <Zap size={18} />
            Analyse My Skin
          </button>
        </div>

        {/* Tip */}
        <div style={{
          marginTop: 20, padding: '10px 18px', borderRadius: 12,
          background: 'rgba(79,111,209,0.08)', border: '1px solid rgba(79,111,209,0.15)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <Info size={13} color="var(--color-primary)" />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
            Your image is processed securely and never stored without consent
          </p>
        </div>
      </div>
    </div>
  )
}
