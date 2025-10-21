import { useState, useEffect } from 'react'

export default function CartPage() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  }

  // Fetch cart data
  const fetchCart = async () => {
    try {
      const user = getCurrentUser()
      if (!user) {
        setError('Please log in to view your cart')
        setLoading(false)
        return
      }

      // Handle nested user object structure
      const actualUser = user.user || user
      const userId = actualUser._id || actualUser.id
      
      if (!userId) {
        setError('User ID not found. Please log in again.')
        setLoading(false)
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/${userId}`)
      const data = await response.json()
      
      if (response.ok) {
        setCart(data.cart)
      } else {
        setError(data.error || 'Failed to fetch cart')
      }
    } catch (err) {
      setError('Failed to fetch cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  // Update item quantity
  const updateQuantity = async (productId, newQuantity) => {
    try {
      const user = getCurrentUser()
      const actualUser = user.user || user
      const userId = actualUser._id || actualUser.id

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          productId: productId,
          quantity: newQuantity
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setCart(data.cart)
        setMessage('Cart updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ ${data.error}`)
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('❌ Failed to update cart')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Remove item from cart
  const removeItem = async (productId) => {
    try {
      const user = getCurrentUser()
      const actualUser = user.user || user
      const userId = actualUser._id || actualUser.id

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          productId: productId
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setCart(data.cart)
        setMessage('Item removed from cart!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ ${data.error}`)
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('❌ Failed to remove item')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    try {
      const user = getCurrentUser()
      const actualUser = user.user || user
      const userId = actualUser._id || actualUser.id

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setCart(data.cart)
        setMessage('Cart cleared successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(`❌ ${data.error}`)
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('❌ Failed to clear cart')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div>Loading your cart...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>
        <div>Error: {error}</div>
        <button 
          onClick={fetchCart}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #dc2626', background: 'white', color: '#dc2626', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    )
  }

  const cartItems = cart?.items || []
  const totalAmount = cart?.totalAmount || 0

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ marginTop: 0, marginBottom: '1rem', color: '#0f172a' }}>Shopping Cart</h1>
          
          {message && (
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              background: message.includes('✅') ? '#f0fdf4' : message.includes('❌') ? '#fef2f2' : '#fefce8',
              border: message.includes('✅') ? '1px solid #bbf7d0' : message.includes('❌') ? '1px solid #fecaca' : '1px solid #fde68a',
              color: message.includes('✅') ? '#166534' : message.includes('❌') ? '#dc2626' : '#d97706',
              fontSize: '1rem',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#64748b', marginBottom: '1rem' }}>Your cart is empty</h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Add some products to get started!</p>
            <button 
              onClick={() => window.location.href = '/products'}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            {/* Cart Items */}
            <div>
              <div style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ margin: 0, color: '#0f172a' }}>Cart Items ({cartItems.length})</h2>
                  <button 
                    onClick={clearCart}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: '1px solid #dc2626',
                      background: 'white',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Clear Cart
                  </button>
                </div>

                {cartItems.map((item) => {
                  const product = item.product
                  const displayPrice = item.discountedPrice && item.discountedPrice < item.price 
                    ? item.discountedPrice 
                    : item.price
                  const itemTotal = displayPrice * item.quantity

                  return (
                    <div key={item.product._id} style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      alignItems: 'center'
                    }}>
                      {/* Product Image */}
                      {product.photo && (
                        <img 
                          src={product.photo} 
                          alt={product.name}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '6px'
                          }}
                        />
                      )}

                      {/* Product Details */}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#0f172a' }}>
                          {product.name}
                        </h3>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#64748b' }}>
                          {product.description}
                        </p>
                        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                          Product ID: {product.productId}
                        </div>
                      </div>

                      {/* Price and Quantity */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: '600', color: '#059669' }}>
                            ${displayPrice}
                          </span>
                          {item.discountedPrice && item.discountedPrice < item.price && (
                            <span style={{ 
                              fontSize: '0.9rem', 
                              color: '#64748b', 
                              textDecoration: 'line-through',
                              marginLeft: '0.5rem'
                            }}>
                              ${item.price}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <button 
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '4px',
                              border: '1px solid #d1d5db',
                              background: item.quantity <= 1 ? '#f9fafb' : 'white',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '500' }}>
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '4px',
                              border: '1px solid #d1d5db',
                              background: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            +
                          </button>
                        </div>

                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0f172a' }}>
                          ${itemTotal.toFixed(2)}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button 
                        onClick={() => removeItem(product._id)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #dc2626',
                          background: 'white',
                          color: '#dc2626',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: '1rem'
              }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Order Summary</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Items ({cartItems.length})</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '600', color: '#0f172a' }}>
                    <span>Total</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#059669',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                  onClick={() => alert('Checkout functionality will be implemented soon!')}
                >
                  Proceed to Checkout
                </button>

                <button 
                  onClick={() => window.location.href = '/products'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #3b82f6',
                    background: 'white',
                    color: '#3b82f6',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
