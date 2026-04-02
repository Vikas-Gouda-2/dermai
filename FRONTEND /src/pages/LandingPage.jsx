import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Scan, Sparkles, FileText, ShieldCheck, ChevronRight, Star, Zap, BarChart3 } from 'lucide-react'
import { useApp } from '../context/AppContext'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

const FEATURES = [
  {
    icon: Scan,
    title: 'Real-Time 1080p Scan',
    desc: 'High-resolution webcam capture with AI face detection and 7 anatomical zone mapping.',
    color: 'var(--color-primary)',
  },
  {
    icon: Sparkles,
    title: 'AI Skin Analysis',
    desc: 'Detects 11 skin conditions with severity scores — from acne to dark circles to fine lines.',
    color: 'var(--color-accent)',
  },
  {
    icon: ShieldCheck,
    title: 'Personalised Routine',
    desc: '40+ real skincare products recommended based on your unique condition scores and skin type.',
    color: 'var(--color-success)',
  },
  {
    icon: FileText,
    title: 'Downloadable Report',
    desc: 'Full PDF skin health report with zone analysis, 7-day routine, and product guide.',
    color: 'var(--color-warning)',
  },
]

const STATS = [
  { value: '11', label: 'Conditions Detected' },
  { value: '7', label: 'Facial Zones Mapped' },
  { value: '40+', label: 'Products Curated' },
  { value: '<10s', label: 'Analysis Time' },
]

const CONDITIONS = [
  'Dark Spots', 'Open Pores', 'Acne', 'Oily Skin',
  'Dry Patches', 'Blackheads', 'Redness', 'Fine Lines',
  'Uneven Tone', 'Dark Circles', 'Rough Texture'
]

export default function LandingPage() {
  const { user } = useApp()
  const navigate = useNavigate()

  const handleScan = () => {
    navigate(user ? '/scan' : '/auth')
  }

  return (
    <div className="page" style={{ background: 'var(--color-bg-dark)', color: 'white', overflow: 'hidden' }}>
      {/* Navbar */}
      <nav className="navbar glass">
        <Link to="/" className="navbar-logo">
          Derm<span className="gradient-text">AI</span>
          <span className="logo-dot" />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
              <Link to="/scan" className="btn-primary" style={{ padding: '10px 22px', fontSize: 14 }}>
                New Scan
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn-ghost">Sign In</Link>
              <Link to="/auth" className="btn-primary" style={{ padding: '10px 22px', fontSize: 14 }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: 100 }}>
        {/* Background glow effects */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(79,111,209,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(0,180,216,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        {/* Animated grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(79,111,209,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(79,111,209,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            {/* Left: Text */}
            <div>
              <motion.div
                initial="hidden" animate="visible" variants={fadeUp} custom={0}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 'var(--radius-full)', background: 'rgba(79,111,209,0.15)', border: '1px solid rgba(79,111,209,0.3)', marginBottom: 28 }}
              >
                <Zap size={14} color="var(--color-accent)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>
                  AI-Powered Skin Intelligence
                </span>
              </motion.div>

              <motion.h1
                initial="hidden" animate="visible" variants={fadeUp} custom={1}
                style={{ fontSize: 'clamp(40px, 5vw, 68px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 24 }}
              >
                Know Your Skin.<br />
                <span className="gradient-text">Transform It.</span>
              </motion.h1>

              <motion.p
                initial="hidden" animate="visible" variants={fadeUp} custom={2}
                style={{ fontSize: 18, lineHeight: 1.7, color: 'rgba(255,255,255,0.65)', maxWidth: 480, marginBottom: 40, fontFamily: 'var(--font-body)' }}
              >
                DermAI analyses your face in real-time using advanced computer vision. 
                Get a personalised skin report, expert product recommendations, and a 7-day routine — in under 10 seconds.
              </motion.p>

              <motion.div
                initial="hidden" animate="visible" variants={fadeUp} custom={3}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
              >
                <button onClick={handleScan} className="btn-primary" id="hero-scan-btn" style={{ fontSize: 16, padding: '16px 36px' }}>
                  <Scan size={18} />
                  Scan My Skin Free
                  <ChevronRight size={16} />
                </button>
                <Link to="/dashboard" className="btn-ghost" style={{ padding: '16px 28px', fontSize: 15 }}>
                  View Demo
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial="hidden" animate="visible" variants={fadeUp} custom={4}
                style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 20 }}
              >
                <div style={{ display: 'flex', gap: -8 }}>
                  {['A','B','C','D'].map((l, i) => (
                    <div key={l} style={{
                      width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--color-bg-dark)',
                      background: `hsl(${i*60+200},60%,50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, marginLeft: i > 0 ? -8 : 0
                    }}>{l}</div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={13} fill="var(--color-warning)" color="var(--color-warning)" />)}
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Trusted by 10,000+ users</p>
                </div>
              </motion.div>
            </div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
            >
              {/* Glow behind */}
              <div style={{
                position: 'absolute', width: 400, height: 400,
                background: 'radial-gradient(circle, rgba(79,111,209,0.3) 0%, transparent 70%)',
                borderRadius: '50%', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: 'glow-pulse 3s ease-in-out infinite'
              }} />

              {/* Face scan visualization */}
              <div className="float-animation" style={{ position: 'relative', width: 320, height: 400 }}>
                {/* Outer scanning ring */}
                <div className="scan-ring-outer" style={{
                  position: 'absolute', inset: -20,
                  borderRadius: '50%',
                  border: '2px solid rgba(79,111,209,0.4)',
                  boxShadow: '0 0 40px rgba(79,111,209,0.2)'
                }} />

                {/* Inner face frame */}
                <div style={{
                  width: '100%', height: '100%',
                  borderRadius: '55% 55% 50% 50% / 60% 60% 40% 40%',
                  border: '2px solid rgba(79,111,209,0.6)',
                  background: 'rgba(79,111,209,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 0 60px rgba(79,111,209,0.2), inset 0 0 40px rgba(79,111,209,0.05)'
                }}>
                  {/* Scan line animation */}
                  <div style={{
                    position: 'absolute', left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
                    animation: 'scan-line 2.5s ease-in-out infinite',
                    boxShadow: '0 0 10px var(--color-accent)'
                  }} />

                  {/* Zone dots */}
                  {[
                    { top: '15%', left: '50%', label: 'Forehead' },
                    { top: '35%', left: '28%', label: 'L.Cheek' },
                    { top: '35%', left: '72%', label: 'R.Cheek' },
                    { top: '48%', left: '50%', label: 'Nose' },
                    { top: '68%', left: '50%', label: 'Chin' },
                    { top: '27%', left: '35%', label: 'Under-Eye' },
                  ].map((zone, i) => (
                    <div key={zone.label} style={{
                      position: 'absolute',
                      top: zone.top, left: zone.left,
                      transform: 'translate(-50%, -50%)',
                      animation: `zone-pulse ${1.5 + i * 0.3}s ease-in-out infinite`,
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: i % 3 === 0 ? 'var(--color-accent)' : i % 3 === 1 ? 'var(--color-success)' : 'var(--color-primary)',
                        boxShadow: `0 0 12px ${i % 3 === 0 ? 'var(--color-accent)' : i % 3 === 1 ? 'var(--color-success)' : 'var(--color-primary)'}`
                      }} />
                    </div>
                  ))}

                  {/* Corner brackets */}
                  {[[-10,-10,'rotate(0deg)'],[-10,'calc(100% - 22px)','rotate(90deg)'],['calc(100% - 22px)',-10,'rotate(-90deg)'],['calc(100% - 22px)','calc(100% - 22px)','rotate(180deg)']].map(([t,l,rot], i) => (
                    <svg key={i} width="22" height="22" viewBox="0 0 22 22" style={{ position: 'absolute', top: t, left: l, transform: rot }}>
                      <path d="M 2 20 L 2 2 L 20 2" stroke="var(--color-accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </svg>
                  ))}
                </div>

                {/* Floating condition badges */}
                {[
                  { label: '✓ Oily Skin', score: '6.2', color: 'var(--color-warning)', top: '10%', right: '-100px' },
                  { label: '✓ Dark Spots', score: '4.8', color: 'var(--color-alert)', top: '40%', right: '-110px' },
                  { label: '✓ Open Pores', score: '5.5', color: 'var(--color-accent)', bottom: '25%', right: '-115px' },
                  { label: '✓ Good Texture', score: '2.1', color: 'var(--color-success)', top: '25%', left: '-115px' },
                ].map((badge, i) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, x: badge.right ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + i * 0.3, duration: 0.5 }}
                    style={{
                      position: 'absolute', top: badge.top, bottom: badge.bottom,
                      right: badge.right, left: badge.left,
                      background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(12px)',
                      border: `1px solid ${badge.color}40`, borderRadius: 12,
                      padding: '8px 14px', whiteSpace: 'nowrap'
                    }}
                  >
                    <div style={{ fontSize: 11, color: badge.color, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{badge.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'var(--font-heading)' }}>{badge.score}<span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>/10</span></div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.value}
                initial="hidden" whileInView="visible"
                viewport={{ once: true }} variants={fadeUp} custom={i}
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: 42, fontWeight: 900, fontFamily: 'var(--font-heading)' }} className="gradient-text">{stat.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginTop: 4 }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <section style={{ padding: '100px 0' }}>
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true }} variants={fadeUp}
            style={{ textAlign: 'center', marginBottom: 60 }}
          >
            <h2 style={{ fontSize: 42, fontWeight: 800, marginBottom: 16 }}>
              Everything You Need to <span className="gradient-text">Understand Your Skin</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', maxWidth: 500, margin: '0 auto' }}>
              Professional-grade skin analysis without a dermatologist appointment
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial="hidden" whileInView="visible"
                  viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
                  whileHover={{ scale: 1.02, y: -4 }}
                  style={{
                    padding: 32, borderRadius: 24, cursor: 'default',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${feature.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20, border: `1px solid ${feature.color}30`
                  }}>
                    <Icon size={24} color={feature.color} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>{feature.title}</h3>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{feature.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Conditions Detected */}
      <section style={{ padding: '80px 0', background: 'rgba(79,111,209,0.04)', borderTop: '1px solid rgba(79,111,209,0.1)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.h2
            initial="hidden" whileInView="visible"
            viewport={{ once: true }} variants={fadeUp}
            style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}
          >
            11 Conditions. One Scan.
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="visible"
            viewport={{ once: true }} variants={fadeUp} custom={1}
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 48 }}
          >
            DermAI detects and scores every major skin concern with clinical precision
          </motion.p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {CONDITIONS.map((c, i) => (
              <motion.span
                key={c}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                style={{
                  padding: '10px 20px', borderRadius: 50,
                  background: 'rgba(79,111,209,0.1)',
                  border: '1px solid rgba(79,111,209,0.2)',
                  fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255, 0.8)'
                }}
              >{c}</motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 0', textAlign: 'center' }}>
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true }} variants={fadeUp}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px',
              borderRadius: 50, background: 'rgba(6,214,160,0.12)', border: '1px solid rgba(6,214,160,0.25)', marginBottom: 24
            }}>
              <BarChart3 size={14} color="var(--color-success)" />
              <span style={{ fontSize: 13, color: 'var(--color-success)', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Free — No credit card required</span>
            </div>
            <h2 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16, maxWidth: 600, margin: '0 auto 16px' }}>
              Start Your Skin Journey <span className="gradient-text">Today</span>
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', marginBottom: 40 }}>
              Join thousands who've discovered their skin type and built the perfect routine with DermAI
            </p>
            <button onClick={handleScan} className="btn-primary" id="cta-scan-btn" style={{ fontSize: 17, padding: '18px 48px' }}>
              <Scan size={20} />
              Analyse My Skin Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
          © 2026 DermAI · Built with ❤️ at Hackathon 2026 · AI-powered skincare for everyone
        </p>
      </footer>
    </div>
  )
}
