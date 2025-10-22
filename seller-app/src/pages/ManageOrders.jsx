// src/pages/ManageOrders.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Fetch all orders (since there's only one seller)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orders`);
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setMessage('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, {
        status: newStatus,
        trackingNumber: trackingNumber
      });

      // Update local state
      setOrders(prev => prev.map(order =>
        order._id === orderId ? { ...order, status: newStatus, trackingNumber: trackingNumber } : order
      ));

      setMessage(`Order ${newStatus} successfully!`);
      setSelectedOrder(null);
      setTrackingNumber('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Failed to update order:", error);
      setMessage('Failed to update order status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Handle delivery status update
  const handleDeliveryUpdate = async (orderId, deliveryStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/${orderId}/delivery`, {
        deliveryStatus: deliveryStatus,
        trackingNumber: trackingNumber
      });

      // Update local state
      setOrders(prev => prev.map(order =>
        order._id === orderId ? { ...order, deliveryStatus: deliveryStatus, trackingNumber: trackingNumber } : order
      ));

      setMessage(`Delivery status updated to ${deliveryStatus}!`);
      setSelectedOrder(null);
      setTrackingNumber('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Failed to update delivery:", error);
      setMessage('Failed to update delivery status');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get delivery status color
  const getDeliveryStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'shipped': return '#3b82f6';
      case 'out_for_delivery': return '#8b5cf6';
      case 'delivered': return '#22c55e';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh" 
      }}>
        <p style={{ fontSize: "1.2rem" }}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      minHeight: "100vh",
      width: "100%",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "2rem"
    }}>
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        textAlign: "center"
      }}>
        <h2 style={{ marginBottom: "2rem", fontSize: "2rem" }}>Order Management</h2>
        <p style={{ marginBottom: "2rem", fontSize: "1.1rem", color: "#888" }}>
          Manage all customer orders and track delivery status
        </p>

        {message && (
          <div style={{
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            backgroundColor: message.includes('successfully') ? '#f0fdf4' : '#fef2f2',
            border: message.includes('successfully') ? '1px solid #bbf7d0' : '1px solid #fecaca',
            color: message.includes('successfully') ? '#166534' : '#dc2626',
            fontSize: "0.95rem",
            fontWeight: "500"
          }}>
            {message}
          </div>
        )}

        {orders.length === 0 ? (
          <p style={{ fontSize: "1.1rem", color: "#888" }}>No orders found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ 
              borderCollapse: "collapse", 
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              overflow: "hidden"
            }}>
              <thead>
                <tr style={{ backgroundColor: "rgba(100, 108, 255, 0.2)" }}>
                  <th style={{ padding: "1rem", borderBottom: "1px solid #ccc", fontWeight: "600" }}>Order ID</th>
                  <th style={{ padding: "1rem", borderBottom: "1px solid #ccc", fontWeight: "600" }}>Customer</th>
                  <th style={{ padding: "1rem", borderBottom: "1px solid #ccc", fontWeight: "600" }}>Items</th>
                  <th style={{ padding: "1rem", borderBottom: "1px solid #ccc", fontWeight: "600" }}>Total</th>
                  <th style={{ padding: "1rem", borderBottom: "1px solid #ccc", fontWeight: "600" }}>Status</th>
                  <th style={{ padding: "1rem", borderBottom: "1px solid #ccc", fontWeight: "600" }}>Delivery</th>
                  <th style={{ padding: "1rem", borderBottom: "1px solid #ccc", fontWeight: "600" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                    <td style={{ padding: "1rem", fontSize: "0.9rem" }}>{order.orderId}</td>
                    <td style={{ padding: "1rem" }}>
                      <div>
                        <div style={{ fontWeight: "600" }}>{order.customerDetails?.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "#888" }}>{order.customerDetails?.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontSize: "0.9rem" }}>
                        {order.items?.length} item(s)
                      </div>
                    </td>
                    <td style={{ padding: "1rem", fontWeight: "600" }}>${order.totalAmount?.toFixed(2)}</td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        backgroundColor: getStatusColor(order.status),
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: "500"
                      }}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        backgroundColor: getDeliveryStatusColor(order.deliveryStatus),
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: "500"
                      }}>
                        {order.deliveryStatus?.replace('_', ' ').charAt(0).toUpperCase() + order.deliveryStatus?.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "500",
                          cursor: "pointer",
                          backgroundColor: "#646cff",
                          color: "white",
                          border: "none",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = "#535bf2"}
                        onMouseOut={(e) => e.target.style.backgroundColor = "#646cff"}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "2rem"
        }}
        onClick={() => {
          setSelectedOrder(null);
          setTrackingNumber('');
        }}
        >
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "2rem",
            maxWidth: "800px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            position: "relative"
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => {
                setSelectedOrder(null);
                setTrackingNumber('');
              }}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              ×
            </button>

            {/* Order Details */}
            <h2 style={{ margin: "0 0 1.5rem 0", color: "#0f172a", fontSize: "1.5rem" }}>
              Order Details - {selectedOrder.orderId}
            </h2>

            {/* Order Information */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "#0f172a", fontSize: "1.2rem" }}>Order Information</h3>
              <div style={{ 
                padding: "1.5rem", 
                background: "#f8fafc", 
                borderRadius: "12px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                  gap: "2rem",
                  alignItems: "start"
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "600", minWidth: "120px", color: "#374151" }}>Order Date:</span>
                      <span style={{ color: "#6b7280" }}>
                        {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "600", minWidth: "120px", color: "#374151" }}>Order Time:</span>
                      <span style={{ color: "#6b7280" }}>
                        {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleTimeString() : 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "600", minWidth: "120px", color: "#374151" }}>Order Status:</span>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        backgroundColor: getStatusColor(selectedOrder.status),
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: "500"
                      }}>
                        {selectedOrder.status?.charAt(0).toUpperCase() + selectedOrder.status?.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "600", minWidth: "120px", color: "#374151" }}>Delivery Status:</span>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        backgroundColor: getDeliveryStatusColor(selectedOrder.deliveryStatus),
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: "500"
                      }}>
                        {selectedOrder.deliveryStatus?.replace('_', ' ').charAt(0).toUpperCase() + selectedOrder.deliveryStatus?.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "600", minWidth: "120px", color: "#374151" }}>Payment Method:</span>
                      <span style={{ color: "#6b7280" }}>
                        {selectedOrder.paymentMethod || 'Credit Card'}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "600", minWidth: "120px", color: "#374151" }}>Payment Status:</span>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "12px",
                        backgroundColor: selectedOrder.paymentStatus === 'paid' ? "#22c55e" : "#ef4444",
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: "500"
                      }}>
                        {selectedOrder.paymentStatus?.charAt(0).toUpperCase() + selectedOrder.paymentStatus?.slice(1) || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "#0f172a", fontSize: "1.2rem" }}>Customer Information</h3>
              <div style={{ 
                padding: "1.5rem", 
                background: "#f8fafc", 
                borderRadius: "12px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                  gap: "1.5rem",
                  alignItems: "start"
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "600", minWidth: "80px", color: "#374151" }}>Name:</span>
                      <span style={{ color: "#6b7280" }}>{selectedOrder.customerDetails?.name || 'N/A'}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "600", minWidth: "80px", color: "#374151" }}>Email:</span>
                      <span style={{ color: "#6b7280" }}>{selectedOrder.customerDetails?.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "600", minWidth: "80px", color: "#374151" }}>Phone:</span>
                      <span style={{ color: "#6b7280" }}>{selectedOrder.customerDetails?.phone || 'N/A'}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                      <span style={{ fontWeight: "600", minWidth: "80px", color: "#374151", marginTop: "0.125rem" }}>Address:</span>
                      <span style={{ color: "#6b7280", lineHeight: "1.4" }}>
                        {selectedOrder.customerDetails?.address ? 
                          `${selectedOrder.customerDetails.address.street || ''}, ${selectedOrder.customerDetails.address.city || ''}, ${selectedOrder.customerDetails.address.state || ''} - ${selectedOrder.customerDetails.address.pincode || ''}`.replace(/^,\s*|,\s*$/g, '') :
                          'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "#0f172a", fontSize: "1.2rem" }}>Order Items</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} style={{
                    padding: "1.5rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    background: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                  }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                      {item.product?.photo && (
                        <img 
                          src={item.product.photo} 
                          alt={item.product.name}
                          style={{ 
                            width: "80px", 
                            height: "80px", 
                            objectFit: "cover", 
                            borderRadius: "8px",
                            flexShrink: 0
                          }} 
                        />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: "600", 
                          marginBottom: "0.5rem", 
                          fontSize: "1rem",
                          color: "#111827"
                        }}>
                          {item.product?.name || 'Product Name'}
                        </div>
                        <div style={{ 
                          fontSize: "0.9rem", 
                          color: "#6b7280", 
                          marginBottom: "0.75rem",
                          lineHeight: "1.4"
                        }}>
                          {item.product?.description || 'No description available'}
                        </div>
                        <div style={{ 
                          display: "flex", 
                          justifyContent: "space-between", 
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "0.5rem"
                        }}>
                          <div style={{ fontSize: "0.9rem", color: "#374151" }}>
                            <span style={{ fontWeight: "500" }}>Quantity:</span> {item.quantity}
                          </div>
                          <div style={{ fontSize: "0.9rem", color: "#374151" }}>
                            <span style={{ fontWeight: "500" }}>Unit Price:</span> ${item.discountedPrice && item.discountedPrice < item.price ? item.discountedPrice : item.price}
                          </div>
                          <div style={{ 
                            fontSize: "1rem", 
                            fontWeight: "600", 
                            color: "#111827",
                            backgroundColor: "#f3f4f6",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "6px"
                          }}>
                            Total: ${((item.discountedPrice && item.discountedPrice < item.price ? item.discountedPrice : item.price) * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "#0f172a", fontSize: "1.2rem" }}>Order Summary</h3>
              <div style={{ 
                padding: "1.5rem", 
                background: "#f8fafc", 
                borderRadius: "12px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    padding: "0.5rem 0"
                  }}>
                    <span style={{ color: "#374151", fontSize: "0.95rem" }}>Subtotal:</span>
                    <span style={{ color: "#374151", fontWeight: "500" }}>${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    padding: "0.5rem 0"
                  }}>
                    <span style={{ color: "#374151", fontSize: "0.95rem" }}>Shipping:</span>
                    <span style={{ color: "#059669", fontWeight: "600" }}>Free</span>
                  </div>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    padding: "0.5rem 0"
                  }}>
                    <span style={{ color: "#374151", fontSize: "0.95rem" }}>Tax:</span>
                    <span style={{ color: "#374151", fontWeight: "500" }}>$0.00</span>
                  </div>
                  <hr style={{ 
                    border: "none", 
                    borderTop: "2px solid #e5e7eb", 
                    margin: "0.5rem 0" 
                  }} />
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    padding: "0.75rem 0",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginTop: "0.5rem"
                  }}>
                    <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827" }}>Total:</span>
                    <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#111827" }}>${selectedOrder.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status History */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "#0f172a", fontSize: "1.2rem" }}>Order Timeline</h3>
              <div style={{ 
                padding: "1.5rem", 
                background: "#f8fafc", 
                borderRadius: "12px",
                border: "1px solid #e2e8f0"
              }}>
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "1rem",
                  position: "relative"
                }}>
                  {/* Timeline line */}
                  <div style={{
                    position: "absolute",
                    left: "6px",
                    top: "12px",
                    bottom: "12px",
                    width: "2px",
                    backgroundColor: "#e5e7eb",
                    zIndex: 1
                  }}></div>
                  
                  {/* Order Placed */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "1rem",
                    position: "relative",
                    zIndex: 2
                  }}>
                    <div style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      flexShrink: 0,
                      border: "3px solid #ffffff",
                      boxShadow: "0 0 0 2px #e5e7eb"
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "600", color: "#111827", marginBottom: "0.25rem" }}>
                        Order Placed
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                        {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Accepted */}
                  {selectedOrder.status !== 'pending' && (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "1rem",
                      position: "relative",
                      zIndex: 2
                    }}>
                      <div style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        flexShrink: 0,
                        border: "3px solid #ffffff",
                        boxShadow: "0 0 0 2px #e5e7eb"
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", color: "#111827", marginBottom: "0.25rem" }}>
                          Order Accepted
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                          {selectedOrder.acceptedAt ? new Date(selectedOrder.acceptedAt).toLocaleString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Shipped */}
                  {(selectedOrder.status === 'shipped' || selectedOrder.deliveryStatus === 'shipped' || selectedOrder.deliveryStatus === 'out_for_delivery' || selectedOrder.deliveryStatus === 'delivered') && (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "1rem",
                      position: "relative",
                      zIndex: 2
                    }}>
                      <div style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        flexShrink: 0,
                        border: "3px solid #ffffff",
                        boxShadow: "0 0 0 2px #e5e7eb"
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", color: "#111827", marginBottom: "0.25rem" }}>
                          Order Shipped
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                          {selectedOrder.shippedAt ? new Date(selectedOrder.shippedAt).toLocaleString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Out for Delivery */}
                  {(selectedOrder.deliveryStatus === 'out_for_delivery' || selectedOrder.deliveryStatus === 'delivered') && (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "1rem",
                      position: "relative",
                      zIndex: 2
                    }}>
                      <div style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        flexShrink: 0,
                        border: "3px solid #ffffff",
                        boxShadow: "0 0 0 2px #e5e7eb"
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", color: "#111827", marginBottom: "0.25rem" }}>
                          Out for Delivery
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                          {selectedOrder.outForDeliveryAt ? new Date(selectedOrder.outForDeliveryAt).toLocaleString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Delivered */}
                  {selectedOrder.deliveryStatus === 'delivered' && (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "1rem",
                      position: "relative",
                      zIndex: 2
                    }}>
                      <div style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        flexShrink: 0,
                        border: "3px solid #ffffff",
                        boxShadow: "0 0 0 2px #e5e7eb"
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", color: "#111827", marginBottom: "0.25rem" }}>
                          Delivered
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                          {selectedOrder.deliveredAt ? new Date(selectedOrder.deliveredAt).toLocaleString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Cancelled */}
                  {selectedOrder.status === 'cancelled' && (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "1rem",
                      position: "relative",
                      zIndex: 2
                    }}>
                      <div style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: "#ef4444",
                        flexShrink: 0,
                        border: "3px solid #ffffff",
                        boxShadow: "0 0 0 2px #e5e7eb"
                      }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "600", color: "#111827", marginBottom: "0.25rem" }}>
                          Order Cancelled
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                          {selectedOrder.cancelledAt ? new Date(selectedOrder.cancelledAt).toLocaleString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "#0f172a", fontSize: "1.2rem" }}>Order Notes</h3>
              <div style={{ 
                padding: "1rem", 
                background: "#f8fafc", 
                borderRadius: "8px",
                border: "1px solid #e2e8f0"
              }}>
                <textarea
                  placeholder="Add internal notes about this order (visible only to sellers)..."
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "0.9rem",
                    resize: "vertical",
                    fontFamily: "inherit"
                  }}
                  defaultValue={selectedOrder.sellerNotes || ''}
                  onChange={(e) => {
                    // You can add functionality to save notes here
                    console.log('Order notes updated:', e.target.value);
                  }}
                />
                <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.5rem" }}>
                  These notes are for internal use only and won't be visible to customers.
                </div>
              </div>
            </div>

            {/* Tracking Number Input */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Tracking Number (Optional)
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "1rem"
                  }}
                />
                {trackingNumber && (
                  <button
                    onClick={() => {
                      // Add functionality to save tracking number
                      console.log('Tracking number saved:', trackingNumber);
                      alert('Tracking number saved successfully!');
                    }}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#2563eb"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#3b82f6"}
                  >
                    Save
                  </button>
                )}
              </div>
              {selectedOrder.trackingNumber && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#059669" }}>
                  <strong>Current Tracking:</strong> {selectedOrder.trackingNumber}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              {selectedOrder.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'accepted')}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      backgroundColor: "#22c55e",
                      color: "white",
                      border: "none",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#16a34a"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#22c55e"}
                  >
                    Accept Order
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'cancelled')}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      backgroundColor: "#ef4444",
                      color: "white",
                      border: "none",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#dc2626"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#ef4444"}
                  >
                    Cancel Order
                  </button>
                </>
              )}

              {selectedOrder.status === 'accepted' && (
                <>
                  <button 
                    onClick={() => handleDeliveryUpdate(selectedOrder._id, 'shipped')}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#2563eb"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#3b82f6"}
                  >
                    Mark as Shipped
                  </button>
                  <button 
                    onClick={() => handleDeliveryUpdate(selectedOrder._id, 'out_for_delivery')}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      backgroundColor: "#8b5cf6",
                      color: "white",
                      border: "none",
                      transition: "all 0.3s ease"
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#7c3aed"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#8b5cf6"}
                  >
                    Out for Delivery
                  </button>
                </>
              )}

              {(selectedOrder.status === 'shipped' || selectedOrder.deliveryStatus === 'out_for_delivery') && (
                <button 
                  onClick={() => handleDeliveryUpdate(selectedOrder._id, 'delivered')}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    backgroundColor: "#22c55e",
                    color: "white",
                    border: "none",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = "#16a34a"}
                  onMouseOut={(e) => e.target.style.backgroundColor = "#22c55e"}
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
