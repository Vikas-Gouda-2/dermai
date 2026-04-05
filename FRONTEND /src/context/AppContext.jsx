import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { auth } from '../firebase.config'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'
import axios from 'axios'

const AppContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [idToken, setIdToken] = useState(null)
  
  const [analysisResult, setAnalysisResult] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [scanHistory, setScanHistory] = useState([])
  const [reportHistory, setReportHistory] = useState([])
  
  // Create axios instance with authorization
  const apiClient = useCallback(() => {
    const instance = axios.create({
      baseURL: `${API_URL}/api`,
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')
    })
    
    if (idToken) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${idToken}`
    }
    
    return instance
  }, [idToken])

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          const token = await firebaseUser.getIdToken()
          setIdToken(token)
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            avatar: firebaseUser.photoURL || firebaseUser.email[0].toUpperCase(),
            createdAt: firebaseUser.metadata.creationTime
          })
          
          // Fetch user profile and scan history from backend
          try {
            const profileRes = await apiClient().get('/users/profile')
            const historyRes = await apiClient().get('/users/scan-history?limit=20')
            
            if (historyRes.data?.scans) {
              setScanHistory(historyRes.data.scans)
            }
          } catch (err) {
            console.warn('Failed to fetch user data:', err)
          }
        } else {
          // User is signed out
          setUser(null)
          setIdToken(null)
          setScanHistory([])
          setReportHistory([])
        }
      } catch (err) {
        console.error('Auth state change error:', err)
        setAuthError(err.message)
      } finally {
        setAuthLoading(false)
      }
    })

    return unsubscribe
  }, [apiClient])

  const signup = useCallback(async (email, password, name) => {
    setAuthError(null)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user profile in backend
      await apiClient().post('/users/register', {
        email,
        name: name || email.split('@')[0]
      })
      
      return result.user
    } catch (err) {
      const message = err.code === 'auth/email-already-in-use'
        ? 'Email already registered'
        : err.code === 'auth/weak-password'
        ? 'Password too weak (min 6 chars)'
        : err.message
      setAuthError(message)
      throw err
    }
  }, [apiClient])

  const login = useCallback(async (email, password) => {
    setAuthError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const message = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : err.message
      setAuthError(message)
      throw err
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setAuthError(null)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    setAuthError(null)
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setIdToken(null)
      setAnalysisResult(null)
      setScanHistory([])
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }, [])

  const saveAnalysis = useCallback((result) => {
    setAnalysisResult(result)
    
    // Add to scan history optimistically
    const newScan = {
      id: `scan_${Date.now()}`,
      timestamp: new Date().toISOString(),
      overall_score: result.overall_score,
      skin_type: result.skin_type,
      top_concerns: result.top_concerns
    }
    
    setScanHistory(prev => [newScan, ...prev])
  }, [])

  const generateReport = useCallback(async (scanId, recommendations = []) => {
    try {
      const response = await apiClient().post('/reports/generate', {
        scan_id: scanId,
        analysis_result: analysisResult,
        recommendations,
        user_name: user?.name || 'User'
      })
      
      return response.data
    } catch (err) {
      console.error('Report generation failed:', err)
      throw err
    }
  }, [analysisResult, user, apiClient])

  const downloadReport = useCallback(async (recommendations = []) => {
    try {
      const response = await apiClient().post('/reports/download', {
        scan_id: `scan_${Date.now()}`,
        analysis_result: analysisResult,
        recommendations,
        user_name: user?.name || 'User'
      }, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `DermAI_Report_${new Date().toISOString().split('T')[0]}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
    } catch (err) {
      console.error('Report download failed:', err)
      throw err
    }
  }, [analysisResult, user, apiClient])

  const fetchScanHistory = useCallback(async (limit = 20) => {
    try {
      const response = await apiClient().get(`/users/scan-history?limit=${limit}`)
      if (response.data?.scans) {
        setScanHistory(response.data.scans)
      }
    } catch (err) {
      console.error('Failed to fetch scan history:', err)
    }
  }, [apiClient])

  const value = {
    // Auth state
    user,
    authLoading,
    authError,
    idToken,
    
    // Auth methods
    signup,
    login,
    loginWithGoogle,
    logout,
    
    // Analysis & reports
    analysisResult,
    setAnalysisResult: saveAnalysis,
    recommendations,
    setRecommendations,
    generateReport,
    downloadReport,
    
    // History
    scanHistory,
    reportHistory,
    fetchScanHistory,
    
    // API client
    apiClient
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
