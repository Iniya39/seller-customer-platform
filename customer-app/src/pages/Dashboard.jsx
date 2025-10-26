import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import UserProfileIcon from '../components/UserProfileIcon'
import ProfileModal from '../components/ProfileModal'
import { useCart } from '../hooks/useCart'
import { getCurrentUser, getUserId } from '../utils/userUtils'

export default function Dashboard() {
  const navigate = useNavigate()
  
  const userPayload = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })()

  const name = userPayload?.user?.name || userPayload?.customer?.name || 'Customer'
  const [searchTerm, setSearchTerm] = useState('')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [unreadAcceptedCount, setUnreadAcceptedCount] = useState(0)
  const [unreadCancelledCount, setUnreadCancelledCount] = useState(0)
  const { cartItemCount, fetchCartCount } = useCart()

  // Fetch unread accepted and cancelled orders count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const userId = getUserId(getCurrentUser())
        if (!userId) return

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/customer/${userId}`)
        if (response.ok) {
          const data = await response.json()
          const orders = data.orders || []
          
          // Count orders that have been accepted but not viewed by customer
          // Only count orders that have acceptance date (newly accepted)
          const acceptedCount = orders.filter(order => 
            order.status === 'accepted' && order.acceptedAt && !order.viewedByCustomer
          ).length
          
          // Count orders that have been cancelled but not viewed by customer
          // Only count orders that have cancellation date (newly cancelled)
          const cancelledCount = orders.filter(order => 
            order.status === 'cancelled' && order.cancelledAt && !order.viewedByCustomer
          ).length
          
          setUnreadAcceptedCount(acceptedCount)
          setUnreadCancelledCount(cancelledCount)
        }
      } catch (error) {
        console.error('Error fetching unread order count:', error)
      }
    }

    fetchUnreadCount()
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    
    // Refresh count when page becomes visible (user comes back to dashboard)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount()
      }
    }
    
    const handleFocus = () => {
      fetchUnreadCount()
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Navigate to products page with search term
      navigate('/products', { state: { searchTerm: searchTerm.trim() } })
    } else {
      // Navigate to products page without search term
      navigate('/products')
    }
  }

  // Load cart count on component mount
  useEffect(() => {
    fetchCartCount()
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header with Profile Icon */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 0'
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h1 style={{ margin: 0, color: '#0f172a', fontSize: '1.5rem', fontWeight: '600' }}>
              Hello, {name}
            </h1>
            <UserProfileIcon onProfileClick={() => setShowProfileModal(true)} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
          <SearchBar 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search products..."
          />
        </form>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
          <button 
            style={cardButtonStyle}
            onClick={() => navigate('/products')}
          >
            View Products
          </button>
          <button 
            style={cardButtonStyle}
            onClick={() => navigate('/cart')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span>Your Cart</span>
              {cartItemCount > 0 && (
                <span style={{
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {cartItemCount}
                </span>
              )}
            </div>
          </button>
          <button 
            style={{ ...cardButtonStyle, position: 'relative' }}
            onClick={() => {
              // Mark all accepted and cancelled orders as viewed
              fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/customer/${getUserId(getCurrentUser())}/mark-viewed`, {
                method: 'PUT'
              }).catch(console.error)
              setUnreadAcceptedCount(0)
              setUnreadCancelledCount(0)
              navigate('/orders')
            }}
          >
            View Orders
            {unreadAcceptedCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: unreadCancelledCount > 0 ? '-35px' : '-8px',
                background: '#10b981',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {unreadAcceptedCount > 9 ? '9+' : unreadAcceptedCount}
              </span>
            )}
            {unreadCancelledCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {unreadCancelledCount > 9 ? '9+' : unreadCancelledCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </div>
  )
}

const cardButtonStyle = {
  padding: '1.2rem 1rem',
  borderRadius: 12,
  border: '1px solid #cbd5e1',
  background: 'linear-gradient(135deg,#ffffff,#f8fafc)',
  color: '#0f172a',
  fontWeight: 600,
  cursor: 'pointer'
}


