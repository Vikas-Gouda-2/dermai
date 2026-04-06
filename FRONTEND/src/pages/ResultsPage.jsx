import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronRight, Download, BarChart3, Droplets, ChevronLeft, ShoppingBag } from 'lucide-react'
import { useEffect } from 'react'

const SEVERITY_COLORS = {
  'None': 'var(--color-success)',
  'Minimal': 'var(--color-accent)',
  'Moderate': 'var(--color-warning)',
  'Significant': '#FF6B35',
  'Severe': 'var(--color-alert)',
}

const SEVERITY_BG = {
  'None': 'rgba(6,214,160,0.08)',
  'Minimal': 'rgba(0,180,216,0.08)',
  'Moderate': 'rgba(255,179,71,0.08)',
  'Significant': 'rgba(255,107,53,0.08)',
  'Severe': 'rgba(239,71,111,0.08)',
}

const ZONE_COLORS = {
  'Forehead': '#4F6FD1',
  'T-Zone': '#7B6CF5',
  'Left Cheek': '#00B4D8',
  'Right Cheek': '#06D6A0',
  'Chin': '#FFB347',
  'Under-Eye': '#EF476F',
  'Nose': '#FF6B35',
}

function ScoreRing({ score, size = 80 }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 10) * circumference
  const color = score >= 7 ? 'var(--color-success)' : score >= 5 ? 'var(--color-warning)' : 'var(--color-alert)'

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
        <motion.circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ fontSize: size === 80 ? 18 : 28, fontWeight: 800, color, fontFamily: 'var(--font-heading)' }}>{score}</span>
        {size > 80 && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>/10</span>}
      </div>
    </div>
  )
}

function ConditionCard({ condition, index }) {
  const color = SEVERITY_COLORS[condition.severity] || 'var(--color-accent)'
  const bg = SEVERITY_BG[condition.severity] || 'rgba(0,180,216,0.08)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      style={{
        padding: '16px 20px', borderRadius: 16,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 16
      }}
    >
      {/* Score ring */}
      <ScoreRing score={condition.score} size={56} />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-heading)', color: 'white', truncate: true }}>
            {condition.label}
          </h4>
          <span className="badge" style={{ background: bg, color, fontSize: 10, padding: '3px 10px' }}>
            {condition.severity}
          </span>
        </div>
        {/* Score bar */}
        <div className="progress-bar" style={{ height: 5 }}>
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(condition.score / 10) * 100}%` }}
            transition={{ delay: index * 0.06 + 0.4, duration: 0.8 }}
            style={{ background: color }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function ResultsPage() {
  const { analysisResult } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!analysisResult) navigate('/scan')
  }, [analysisResult])

  if (!analysisResult) return null

  const { overall_score, skin_type, conditions, zone_issues, top_concerns, positive_aspects, analysis_confidence } = analysisResult

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-dark)', color: 'white' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
      }}>
        <Link to="/scan" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14 }}>
          <ChevronLeft size={16} />
          Rescan
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Your Skin Analysis</h1>
        <Link to="/dashboard" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
          <BarChart3 size={14} />
          History
        </Link>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            borderRadius: 28, padding: 36, marginBottom: 28,
            background: 'linear-gradient(135deg, rgba(79,111,209,0.15) 0%, rgba(0,180,216,0.08) 100%)',
            border: '1px solid rgba(79,111,209,0.3)',
            display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap'
          }}
        >
          <ScoreRing score={overall_score} size={120} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <h2 style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-heading)' }}>
                Skin Health Score
              </h2>
              <span style={{
                padding: '4px 12px', borderRadius: 50, fontSize: 13, fontWeight: 700,
                background: 'rgba(6,214,160,0.15)', color: 'var(--color-success)',
                fontFamily: 'var(--font-heading)'
              }}>
                {(analysis_confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, marginBottom: 16 }}>
              Skin Type: <strong style={{ color: 'white' }}>{skin_type}</strong>
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Top Concerns</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {top_concerns.map(c => (
                    <span key={c} style={{
                      padding: '3px 10px', borderRadius: 50, fontSize: 11,
                      background: 'rgba(239,71,111,0.12)', color: 'var(--color-alert)',
                      fontWeight: 600, fontFamily: 'var(--font-heading)'
                    }}>
                      {conditions.find(x => x.key === c)?.label.split('/')[0].trim() || c}
                    </span>
                  ))}
                </div>
              </div>
              {positive_aspects.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Positives</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {positive_aspects.map(c => (
                      <span key={c} style={{
                        padding: '3px 10px', borderRadius: 50, fontSize: 11,
                        background: 'rgba(6,214,160,0.12)', color: 'var(--color-success)',
                        fontWeight: 600, fontFamily: 'var(--font-heading)'
                      }}>
                        ✓ {conditions.find(x => x.key === c)?.label.split('/')[0].trim() || c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Zone Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ marginBottom: 28, padding: 28, borderRadius: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Droplets size={18} color="var(--color-accent)" />
            Zone-by-Zone Analysis
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {Object.entries(zone_issues).map(([zone, issues], i) => (
              <motion.div
                key={zone}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  padding: '14px 16px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${ZONE_COLORS[zone]}30`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: ZONE_COLORS[zone] }} />
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)', color: ZONE_COLORS[zone] }}>{zone}</span>
                </div>
                {issues.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {issues.map(issue => (
                      <span key={issue} style={{
                        padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 600,
                        background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                        fontFamily: 'var(--font-heading)'
                      }}>
                        {issue.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: 'var(--color-success)' }}>✓ Clear</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Conditions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginBottom: 28 }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart3 size={18} color="var(--color-primary)" />
            Condition Scores
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
            {conditions.map((condition, i) => (
              <ConditionCard key={condition.key} condition={condition} index={i} />
            ))}
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
        >
          <Link to="/recommendations" id="results-to-recommendations-btn" className="btn-primary" style={{ flex: 1, justifyContent: 'center', minWidth: 200 }}>
            <ShoppingBag size={18} />
            View Product Recommendations
            <ChevronRight size={16} />
          </Link>
          <Link to="/report" id="results-to-report-btn" className="btn-secondary"
            style={{ padding: '14px 24px', color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.15)', minWidth: 160, justifyContent: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: '9999px', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, border: '2px solid', transition: 'all 0.25s ease' }}>
            <Download size={16} />
            Full Report
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
