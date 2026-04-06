import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Download, ChevronLeft, Sun, Droplets, Moon, Coffee } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useEffect, useState } from 'react'

const SEVEN_DAY_ROUTINE = {
  morning: [
    { step: 1, product: 'Gentle Cleanser', tip: 'Use lukewarm water, massage for 60 seconds', time: '~1 min' },
    { step: 2, product: 'Toner / BHA (if acne-prone)', tip: 'Pat gently — do not rub', time: '~1 min' },
    { step: 3, product: 'Vitamin C Serum', tip: 'Apply to dry skin, wait 2 minutes', time: '~3 min' },
    { step: 4, product: 'Moisturiser', tip: 'Lock in serums immediately after', time: '~1 min' },
    { step: 5, product: 'SPF 50+ Sunscreen', tip: 'Mandatory every day — even indoors', time: '~1 min' },
  ],
  evening: [
    { step: 1, product: 'Double Cleanse (Oil → Foam)', tip: 'Remove sunscreen and makeup thoroughly', time: '~3 min' },
    { step: 2, product: 'Exfoliant (AHA/BHA, 2–3x/week)', tip: 'Skip on nights you use retinol', time: '~2 min' },
    { step: 3, product: 'Niacinamide Serum', tip: 'Targets pores and sebum control', time: '~2 min' },
    { step: 4, product: 'Retinol (start 0.25%, 2x/week)', tip: 'Apply last — start slow to avoid irritation', time: '~1 min' },
    { step: 5, product: 'Rich Night Moisturiser', tip: 'Seals in all layers for overnight repair', time: '~1 min' },
  ]
}

const WEEKLY_EXTRA = [
  { day: 'Tuesday', task: 'Clay mask (10 min) — deep-clean pores' },
  { day: 'Thursday', task: 'Sheet mask (Hyaluronic acid) — hydrate' },
  { day: 'Saturday', task: 'AHA peel (if skin is acclimated)' },
  { day: 'Sunday', task: 'Gua sha facial massage + face oil' },
]

export default function ReportPage() {
  const { analysisResult, user, recommendations } = useApp()
  const navigate = useNavigate()
  const reportRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!analysisResult) navigate('/scan')
  }, [analysisResult])

  if (!analysisResult) return null

  const { overall_score, skin_type, conditions, top_concerns } = analysisResult
  const topConditions = conditions.filter(c => c.score >= 4).slice(0, 5)

  const downloadPDF = async () => {
    setDownloading(true)
    try {
      const element = reportRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0A0F1E',
        logging: false,
        useCORS: true,
      })

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height / canvas.width) * imgWidth

      let position = 0
      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)

      // Handle multi-page
      let heightLeft = imgHeight - pageHeight
      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft)
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`DermAI_Skin_Report_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      alert('PDF generation failed. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-dark)', color: 'white' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
      }}>
        <Link to="/recommendations" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14 }}>
          <ChevronLeft size={16} />
          Recommendations
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Skin Health Report</h1>
        <button
          onClick={downloadPDF}
          id="download-pdf-btn"
          disabled={downloading}
          className="btn-primary"
          style={{ padding: '10px 22px', fontSize: 14, opacity: downloading ? 0.7 : 1 }}
        >
          {downloading ? (
            <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
          ) : <Download size={15} />}
          {downloading ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      {/* Report Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
        <div ref={reportRef} style={{ background: 'var(--color-bg-dark)', borderRadius: 24, overflow: 'hidden' }}>
          {/* Report Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f1c3d 0%, #1a2856 100%)',
            padding: 40, borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 32, fontWeight: 900, marginBottom: 6 }}>
                  Derm<span className="gradient-text">AI</span> Skin Report
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
                  Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {user && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Patient: {user.name}</p>}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1, fontFamily: 'var(--font-heading)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {overall_score}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-heading)' }}>/ 10 Health Score</div>
                <div style={{ marginTop: 8, padding: '4px 14px', borderRadius: 50, background: 'rgba(79,111,209,0.2)', display: 'inline-block' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-accent)' }}>{skin_type} Skin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Condition Summary */}
          <div style={{ padding: '32px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-heading)', color: 'rgba(255,255,255,0.9)' }}>
              📊 Condition Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topConditions.map(c => (
                <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, minWidth: 200, fontFamily: 'var(--font-heading)', color: 'rgba(255,255,255,0.8)' }}>{c.label}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{
                      width: `${(c.score / 10) * 100}%`, height: '100%', borderRadius: 4,
                      background: c.score >= 7 ? 'var(--color-alert)' : c.score >= 5 ? 'var(--color-warning)' : 'var(--color-accent)'
                    }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, minWidth: 32, fontFamily: 'var(--font-heading)', textAlign: 'right' }}>
                    {c.score}
                  </span>
                  <span style={{
                    padding: '2px 10px', borderRadius: 50, fontSize: 10, fontWeight: 700,
                    background: c.score >= 7 ? 'rgba(239,71,111,0.12)' : c.score >= 5 ? 'rgba(255,179,71,0.12)' : 'rgba(0,180,216,0.12)',
                    color: c.score >= 7 ? 'var(--color-alert)' : c.score >= 5 ? 'var(--color-warning)' : 'var(--color-accent)',
                    fontFamily: 'var(--font-heading)', minWidth: 80, textAlign: 'center'
                  }}>{c.severity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Routine */}
          <div style={{ padding: '32px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, fontFamily: 'var(--font-heading)' }}>
              🗓️ Your 7-Day Starter Routine
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
              {/* Morning */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,179,71,0.08)', border: '1px solid rgba(255,179,71,0.2)' }}>
                  <Sun size={16} color="var(--color-warning)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-warning)', fontFamily: 'var(--font-heading)' }}>Morning Routine</span>
                </div>
                {SEVEN_DAY_ROUTINE.morning.map((step) => (
                  <div key={step.step} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,179,71,0.15)',
                      border: '1px solid rgba(255,179,71,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: 'var(--color-warning)', flexShrink: 0
                    }}>{step.step}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: 2 }}>{step.product}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{step.tip}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Evening */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 14px', borderRadius: 12, background: 'rgba(79,111,209,0.08)', border: '1px solid rgba(79,111,209,0.2)' }}>
                  <Moon size={16} color="var(--color-primary-light)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary-light)', fontFamily: 'var(--font-heading)' }}>Evening Routine</span>
                </div>
                {SEVEN_DAY_ROUTINE.evening.map((step) => (
                  <div key={step.step} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', background: 'rgba(79,111,209,0.15)',
                      border: '1px solid rgba(79,111,209,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: 'var(--color-primary-light)', flexShrink: 0
                    }}>{step.step}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: 2 }}>{step.product}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{step.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly extras */}
            <div style={{ padding: 20, borderRadius: 16, background: 'rgba(6,214,160,0.05)', border: '1px solid rgba(6,214,160,0.15)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-success)', marginBottom: 12, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Coffee size={14} />
                Weekly Extras
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {WEEKLY_EXTRA.map(w => (
                  <div key={w.day} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-success)', minWidth: 80 }}>{w.day}:</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{w.task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{ padding: '20px 40px', background: 'rgba(255,255,255,0.02)' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>
              <strong style={{ color: 'rgba(255,255,255,0.4)' }}>Disclaimer:</strong> This report is generated by AI for informational purposes only and is not a substitute for professional medical or dermatological advice. Consult a licensed dermatologist for medical diagnosis and treatment. DermAI — Hackathon 2026 Edition.
            </p>
          </div>
        </div>

        {/* Action buttons below report */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          <button onClick={downloadPDF} id="report-download-btn-2" className="btn-primary" disabled={downloading}
            style={{ flex: 1, justifyContent: 'center', minWidth: 200, opacity: downloading ? 0.7 : 1 }}>
            <Download size={18} />
            {downloading ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
          <Link to="/dashboard" style={{ minWidth: 160, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', borderRadius: '9999px', border: '2px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, transition: 'all 0.25s ease' }}>
            View History
          </Link>
          <Link to="/scan" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 24px', borderRadius: '9999px', border: '2px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, transition: 'all 0.25s ease' }}>
            New Scan
          </Link>
        </div>
      </div>
    </div>
  )
}
