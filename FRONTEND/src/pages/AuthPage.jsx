import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Globe, Loader } from 'lucide-react'
import { useApp } from '../context/AppContext'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } }
}

export default function AuthPage() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, signup, loginWithGoogle, user, authLoading } = useApp()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/scan')
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (mode === 'signup' && !name) {
      setError('Please enter your name.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await signup(email, password, name)
      } else {
        await login(email, password)
      }
      // Firebase will handle redirect via auth state change
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      // Firebase will handle redirect via auth state change
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  const handleGuestAccess = () => {
    // Guest access - navigate to scan without authentication
    // Guest results won't be saved
    navigate('/scan')
  }

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--color-bg-dark)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden'
    }}>
      {/* Background elements */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 0% 0%, rgba(79,111,209,0.2) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, rgba(0,180,216,0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <Link to="/" style={{
        position: 'absolute', top: 24, left: 24, color: 'rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500
      }}>
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <motion.div
        initial="hidden" animate="visible" variants={fadeUp}
        style={{
          width: '100%', maxWidth: 440,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 28, padding: 48,
          backdropFilter: 'blur(20px)',
          position: 'relative', zIndex: 1
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', fontFamily: 'var(--font-heading)' }}>
              Derm<span className="gradient-text">AI</span>
            </h1>
          </Link>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginTop: 4 }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          borderRadius: 12, padding: 4, marginBottom: 28
        }}>
          {['signin', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError('') }}
              id={`auth-tab-${m}`}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                background: mode === m ? 'var(--color-primary)' : 'transparent',
                color: mode === m ? 'white' : 'rgba(255,255,255,0.45)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s ease', fontFamily: 'var(--font-heading)'
              }}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Google OAuth */}
        <button onClick={handleGoogle} disabled={loading} id="auth-google-btn"
          style={{
            width: '100%', padding: '13px 0', borderRadius: 12,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 24, fontSize: 14, fontWeight: 600,
            fontFamily: 'var(--font-heading)', transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
          onMouseLeave={e => !loading && (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        >
          {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Globe size={18} color="#EA4335" />}
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                <input
                  id="auth-name" type="text" value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Priya Sharma"
                  disabled={loading}
                  className="input input-dark"
                  style={{ paddingLeft: 42, opacity: loading ? 0.7 : 1 }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input
                id="auth-email" type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="input input-dark"
                style={{ paddingLeft: 42, opacity: loading ? 0.7 : 1 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input
                id="auth-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="input input-dark"
                style={{ paddingLeft: 42, paddingRight: 42, opacity: loading ? 0.7 : 1 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} disabled={loading}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', color: 'rgba(255,255,255,0.3)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: 10, background: 'rgba(239,71,111,0.12)',
              border: '1px solid rgba(239,71,111,0.25)', color: '#EF476F',
              fontSize: 13, marginBottom: 20
            }}>{error}</div>
          )}

          <button type="submit" id="auth-submit-btn" className="btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', fontSize: 15, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Processing...
              </>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }} disabled={loading}
            style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13 }}>
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          Or{' '}
          <button onClick={handleGuestAccess} disabled={loading}
            id="auth-guest-btn"
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 12, textDecoration: 'underline' }}>
            continue as guest
          </button>
        </p>
      </motion.div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
