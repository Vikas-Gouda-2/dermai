import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Scan, TrendingUp, LogOut, Calendar, ChevronRight, Award, BarChart3 } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'

const CONDITION_LABELS_SHORT = {
  dark_spots: 'Dark Spots',
  open_pores: 'Pores',
  oily_skin: 'Oily',
  dry_patches: 'Dryness',
  acne: 'Acne',
  blackheads: 'Blackheads',
  redness: 'Redness',
  uneven_tone: 'Tone',
  fine_lines: 'Fine Lines',
  dark_circles: 'Dark Circles',
  rough_texture: 'Texture',
}

function ScanHistoryCard({ scan, index }) {
  const scoreColor = scan.overallScore >= 7.5 ? 'var(--color-success)' : scan.overallScore >= 5 ? 'var(--color-warning)' : 'var(--color-alert)'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        padding: '18px 22px', borderRadius: 18, display: 'flex', alignItems: 'center', gap: 20,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        cursor: 'default'
      }}
    >
      {/* Score badge */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
        border: `3px solid ${scoreColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${scoreColor}10`
      }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: scoreColor, fontFamily: 'var(--font-heading)' }}>{scan.overallScore}</span>
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{scan.skinType} Skin</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Calendar size={11} />
            {scan.date}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {scan.topConcerns.slice(0, 3).map(c => (
            <span key={c} style={{
              padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 600,
              background: 'rgba(79,111,209,0.12)', color: 'var(--color-primary-light)',
              fontFamily: 'var(--font-heading)'
            }}>
              {CONDITION_LABELS_SHORT[c] || c}
            </span>
          ))}
        </div>
      </div>

      <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user, logout, analysisResult, scanHistory } = useApp()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Build trend data from scan history
  const trendData = [...scanHistory].reverse().map((scan, i) => ({
    date: scan.date.slice(5), // MM-DD
    score: scan.overallScore,
    name: `Scan ${i + 1}`
  }))

  // Current radar data from latest analysis
  const radarData = analysisResult
    ? analysisResult.conditions.slice(0, 8).map(c => ({
        condition: CONDITION_LABELS_SHORT[c.key] || c.key,
        score: c.score,
        fullMark: 10
      }))
    : []

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-dark)', color: 'white' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
            Derm<span className="gradient-text">AI</span>
          </h1>
        </Link>
        <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/scan" className="btn-primary" style={{ padding: '10px 22px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Scan size={15} />
            New Scan
          </Link>
          {user && (
            <button onClick={handleLogout} id="logout-btn" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: 50, color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
              <LogOut size={14} />
              Sign Out
            </button>
          )}
        </nav>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <h2 style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: 4 }}>
            {user ? `Welcome back, ${user.name} 👋` : 'Your Skin Dashboard'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15 }}>
            Track your skin health progress over time
          </p>
        </motion.div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Scans', value: scanHistory.length, icon: Scan, color: 'var(--color-primary)' },
            { label: 'Latest Score', value: scanHistory[0]?.overallScore || '—', icon: Award, color: 'var(--color-success)' },
            { label: 'Skin Type', value: scanHistory[0]?.skinType || '—', icon: TrendingUp, color: 'var(--color-accent)' },
            { label: 'Top Concern', value: scanHistory[0] ? CONDITION_LABELS_SHORT[scanHistory[0].topConcerns[0]] || '—' : '—', icon: BarChart3, color: 'var(--color-warning)' },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  padding: '22px 20px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Icon size={18} color={stat.color} />
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-heading)', color: stat.color, marginBottom: 4 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{stat.label}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
          {/* Trend line chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ padding: 28, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 20 }}>
              <TrendingUp size={16} style={{ display: 'inline', marginRight: 8 }} color="var(--color-success)" />
              Skin Score Over Time
            </h3>
            {trendData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <YAxis domain={[0, 10]} stroke="rgba(255,255,255,0.3)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: '#1a2240', border: '1px solid rgba(79,111,209,0.3)', borderRadius: 12, color: 'white' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="url(#scoreGradient)" strokeWidth={3} dot={{ fill: '#4F6FD1', strokeWidth: 2, r: 5 }} activeDot={{ r: 7, fill: 'var(--color-accent)' }} />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4F6FD1" />
                      <stop offset="100%" stopColor="#00B4D8" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
                Complete more scans to see your trend
              </div>
            )}
          </motion.div>

          {/* Radar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ padding: 28, borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 20 }}>
              Condition Radar
            </h3>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="condition" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.5)' }} />
                  <Radar name="Score" dataKey="score" stroke="#4F6FD1" fill="#4F6FD1" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 14, textAlign: 'center' }}>
                Scan your skin to see condition radar
              </div>
            )}
          </motion.div>
        </div>

        {/* Scan History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
              <Calendar size={16} style={{ display: 'inline', marginRight: 8 }} />
              Scan History
            </h3>
            {analysisResult && (
              <Link to="/results" style={{ fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
                View latest →
              </Link>
            )}
          </div>

          {scanHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scanHistory.map((scan, i) => (
                <ScanHistoryCard key={scan.id} scan={scan} index={i} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'rgba(255,255,255,0.3)' }}>
              <Scan size={40} style={{ margin: '0 auto 12px' }} color="rgba(255,255,255,0.1)" />
              <p>No scans yet. <Link to="/scan" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>Start your first scan</Link></p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
