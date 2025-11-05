import { useNavigate, useLocation } from 'react-router-dom'
import ProductsList from '../components/ProductsList'

export default function ProductsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get search term from location state if passed from Dashboard
  const searchTerm = location.state?.searchTerm || ''

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              <h1 style={{ marginTop: 0, marginBottom: 0, color: '#0f172a' }}>Products</h1>
            </div>
          </div>
        </div>

        <ProductsList searchTerm={searchTerm} />
      </div>
    </div>
  )
}
