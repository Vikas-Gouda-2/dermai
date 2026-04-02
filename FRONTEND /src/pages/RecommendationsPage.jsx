import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChevronLeft, ShoppingBag, Star, Leaf, Zap, Crown, ExternalLink, Filter } from 'lucide-react'
import axios from 'axios'

const TIER_CONFIG = {
  budget: { label: 'Budget', icon: Leaf, color: 'var(--color-success)', bg: 'rgba(6,214,160,0.1)', border: 'rgba(6,214,160,0.25)' },
  mid: { label: 'Mid-Range', icon: Zap, color: 'var(--color-accent)', bg: 'rgba(0,180,216,0.1)', border: 'rgba(0,180,216,0.25)' },
  premium: { label: 'Premium', icon: Crown, color: '#FFD700', bg: 'rgba(255,215,0,0.08)', border: 'rgba(255,215,0,0.25)' },
}

const CATEGORY_LABELS = {
  facewash: '🧴 Face Wash',
  moisturiser: '💧 Moisturiser',
  serum: '✨ Serum',
  sunscreen: '☀️ Sunscreen',
  spot_treatment: '🎯 Spot Treatment',
  eye_cream: '👁️ Eye Cream',
  clay_mask: '🌱 Clay Mask',
}

// Fallback product data when API fails
const FALLBACK_PRODUCTS = [
  {
    id: 'fw_001', category: 'facewash',
    name: 'CeraVe Foaming Facial Cleanser', brand: 'CeraVe', tier: 'budget',
    price_range: '$14–$18', key_ingredients: ['Niacinamide', 'Ceramides', 'Hyaluronic Acid'],
    conditions: ['oily_skin', 'acne', 'blackheads'], why_recommended: 'Removes excess oil without stripping the skin barrier. Non-comedogenic.',
    relevance_score: 3, matching_conditions: ['oily_skin', 'acne', 'blackheads']
  },
  {
    id: 'se_001', category: 'serum',
    name: 'The Ordinary Niacinamide 10% + Zinc 1%', brand: 'The Ordinary', tier: 'budget',
    price_range: '$6–$10', key_ingredients: ['Niacinamide 10%', 'Zinc PCA 1%'],
    conditions: ['oily_skin', 'open_pores', 'acne', 'uneven_tone'],
    why_recommended: 'Controls sebum, reduces pore appearance, and evens skin tone.',
    relevance_score: 4, matching_conditions: ['oily_skin', 'open_pores', 'acne']
  },
  {
    id: 'se_002', category: 'serum',
    name: 'TruSkin Vitamin C Serum', brand: 'TruSkin', tier: 'mid',
    price_range: '$20–$30', key_ingredients: ['Vitamin C', 'Hyaluronic Acid', 'Vitamin E'],
    conditions: ['dark_spots', 'uneven_tone', 'fine_lines'],
    why_recommended: 'Brightens dark spots and evens skin tone.',
    relevance_score: 3, matching_conditions: ['dark_spots', 'uneven_tone']
  },
  {
    id: 'spf_001', category: 'sunscreen',
    name: 'EltaMD UV Clear SPF 46', brand: 'EltaMD', tier: 'mid',
    price_range: '$38–$45', key_ingredients: ['Zinc Oxide', 'Niacinamide', 'Lactic Acid'],
    conditions: ['acne', 'dark_spots', 'uneven_tone'],
    why_recommended: 'Oil-free, non-comedogenic. Calms skin while protecting from UV.',
    relevance_score: 2, matching_conditions: ['acne', 'dark_spots']
  },
  {
    id: 'mo_002', category: 'moisturiser',
    name: 'CeraVe PM Facial Moisturizing Lotion', brand: 'CeraVe', tier: 'budget',
    price_range: '$16–$20', key_ingredients: ['Niacinamide', 'Ceramides', 'Hyaluronic Acid'],
    conditions: ['dry_patches', 'uneven_tone', 'open_pores'],
    why_recommended: 'Niacinamide minimizes pores while ceramides restore the skin barrier.',
    relevance_score: 2, matching_conditions: ['open_pores', 'uneven_tone']
  },
  {
    id: 'st_001', category: 'spot_treatment',
    name: 'Mario Badescu Drying Lotion', brand: 'Mario Badescu', tier: 'mid',
    price_range: '$20–$25', key_ingredients: ['Salicylic Acid', 'Sulfur', 'Calamine'],
    conditions: ['acne', 'blackheads'],
    why_recommended: 'Overnight spot treatment that shrinks pimples visibly by morning.',
    relevance_score: 2, matching_conditions: ['acne', 'blackheads']
  },
  {
    id: 'se_005', category: 'serum',
    name: "Paula's Choice 2% BHA", brand: "Paula's Choice", tier: 'mid',
    price_range: '$30–$35', key_ingredients: ['Salicylic Acid 2%', 'Green Tea Extract'],
    conditions: ['blackheads', 'open_pores', 'acne'],
    why_recommended: 'Unclogs pores from within and smooths rough skin texture.',
    relevance_score: 3, matching_conditions: ['blackheads', 'open_pores']
  },
  {
    id: 'ec_002', category: 'eye_cream',
    name: 'Olay Eyes Brightening Cream', brand: 'Olay', tier: 'budget',
    price_range: '$20–$26', key_ingredients: ['Caffeine', 'Niacinamide', 'Vitamin C'],
    conditions: ['dark_circles'],
    why_recommended: 'Caffeine depuffs while Niacinamide brightens dark under-eye areas.',
    relevance_score: 1, matching_conditions: ['dark_circles']
  },
]

function ProductCard({ product, index }) {
  const tier = TIER_CONFIG[product.tier] || TIER_CONFIG.budget
  const TierIcon = tier.icon
  const catLabel = CATEGORY_LABELS[product.category] || product.category

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.01 }}
      style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20, padding: 24, cursor: 'default', transition: 'background 0.2s ease'
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {catLabel}
          </p>
          <h4 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1.3, marginBottom: 2 }}>{product.name}</h4>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>{product.brand}</p>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0
        }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
            borderRadius: 50, fontSize: 11, fontWeight: 700,
            background: tier.bg, color: tier.color, border: `1px solid ${tier.border}`,
            fontFamily: 'var(--font-heading)'
          }}>
            <TierIcon size={11} />
            {tier.label}
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)' }}>
            {product.price_range}
          </span>
        </div>
      </div>

      {/* Why recommended */}
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 14 }}>
        {product.why_recommended}
      </p>

      {/* Ingredients */}
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontFamily: 'var(--font-heading)' }}>KEY INGREDIENTS</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {product.key_ingredients.slice(0, 3).map(ing => (
            <span key={ing} style={{
              padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 500,
              background: 'rgba(79,111,209,0.12)', color: 'var(--color-primary-light)',
              fontFamily: 'var(--font-heading)'
            }}>{ing}</span>
          ))}
        </div>
      </div>

      {/* Addresses */}
      {product.matching_conditions?.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Targets:</span>
          {product.matching_conditions.slice(0, 2).map(c => (
            <span key={c} style={{
              padding: '2px 8px', borderRadius: 50, fontSize: 10, fontWeight: 600,
              background: 'rgba(239,71,111,0.1)', color: 'var(--color-alert)',
              fontFamily: 'var(--font-heading)'
            }}>{c.replace(/_/g, ' ')}</span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default function RecommendationsPage() {
  const { analysisResult, setRecommendations: setContextRecs } = useApp()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [tierFilter, setTierFilter] = useState('all')

  useEffect(() => {
    if (!analysisResult) { navigate('/scan'); return }
    fetchRecommendations()
  }, [analysisResult])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const topConditions = analysisResult.conditions
        .filter(c => c.score >= 3)
        .map(c => c.key)
        .join(',')

      const response = await axios.get(`/api/recommendations?conditions=${topConditions}&limit=20`)
      setProducts(response.data.products)
      setContextRecs(response.data.products)
    } catch (err) {
      setProducts(FALLBACK_PRODUCTS)
    } finally {
      setLoading(false)
    }
  }

  const filtered = tierFilter === 'all' ? products : products.filter(p => p.tier === tierFilter)

  // Group by category
  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-dark)', color: 'white' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'
      }}>
        <Link to="/results" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 14 }}>
          <ChevronLeft size={16} />
          Results
        </Link>
        <h1 style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
          <ShoppingBag size={20} style={{ display: 'inline', marginRight: 8 }} />
          Your Recommendations
        </h1>
        <Link to="/report" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          Full Report →
        </Link>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {/* Tier filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
            <Filter size={14} /> Filter:
          </span>
          {['all', 'budget', 'mid', 'premium'].map(t => (
            <button
              key={t}
              id={`filter-${t}`}
              onClick={() => setTierFilter(t)}
              style={{
                padding: '8px 18px', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: tierFilter === t ? 'var(--color-primary)' : 'rgba(255,255,255,0.06)',
                color: tierFilter === t ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-heading)',
                transition: 'all 0.2s ease', textTransform: 'capitalize'
              }}
            >
              {t === 'all' ? '✦ All' : t === 'budget' ? '🌿 Budget' : t === 'mid' ? '⚡ Mid-Range' : '👑 Premium'}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(79,111,209,0.3)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading your personalised recommendations...</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, catProducts]) => (
            <div key={category} style={{ marginBottom: 40 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: 16, color: 'rgba(255,255,255,0.7)' }}>
                {CATEGORY_LABELS[category] || category}
                <span style={{ marginLeft: 8, fontSize: 12, background: 'rgba(79,111,209,0.15)', color: 'var(--color-primary)', padding: '2px 10px', borderRadius: 50, fontWeight: 600 }}>
                  {catProducts.length}
                </span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {catProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </div>
          ))
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
            <p>No {tierFilter} products found. Try a different filter.</p>
          </div>
        )}

        <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
          <Link to="/report" id="recs-to-report-btn" className="btn-primary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
            View Full Report & Download PDF
          </Link>
        </div>
      </div>
    </div>
  )
}
