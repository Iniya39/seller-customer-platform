import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../utils/userUtils'

export default function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if it's first time (no user data)
      const user = getCurrentUser()
      
      if (!user) {
        // First time - show access store page
        navigate('/auth', { replace: true })
        return
      }

      // Check if 7 days have passed since last login
      const lastLoginTime = localStorage.getItem('lastLoginTime')
      if (!lastLoginTime) {
        // No last login time recorded - show access store page
        navigate('/auth', { replace: true })
        return
      }

      const lastLogin = new Date(lastLoginTime).getTime()
      const now = new Date().getTime()
      const daysSinceLogin = (now - lastLogin) / (1000 * 60 * 60 * 24)

      if (daysSinceLogin >= 7) {
        // 7 days have passed - show access store page
        navigate('/auth', { replace: true })
      } else {
        // User is logged in and less than 7 days - show dashboard
        navigate('/dashboard', { replace: true })
      }
    }, 2000) // 2 seconds

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: 'bold',
        color: '#000000',
        margin: 0,
        fontFamily: 'Arial, sans-serif'
      }}>
        DaiLynk
      </h1>
    </div>
  )
}

