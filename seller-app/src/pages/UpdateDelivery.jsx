// src/pages/UpdateDelivery.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function UpdateDelivery() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch delivery orders when component mounts
  useEffect(() => {
    axios.get("http://localhost:5000/api/orders") // change URL if needed
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch orders:", err);
        setLoading(false);
      });
  }, []);

  // Handle updating delivery status
  const handleUpdate = (orderId, newStatus) => {
    axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus })
      .then(res => {
        setOrders(prev => prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        alert("Delivery status updated successfully!");
      })
      .catch(err => alert("Failed to update delivery status"));
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Update Delivery</h2>
      {orders.length === 0 ? (
        <p>No delivery orders found.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.customerName}</td>
                <td>{order.productName}</td>
                <td>{order.quantity}</td>
                <td>{order.status}</td>
                <td>
                  <button onClick={() => handleUpdate(order._id, "Shipped")}>Shipped</button>
                  <button onClick={() => handleUpdate(order._id, "Delivered")} style={{ marginLeft: "5px" }}>Delivered</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
