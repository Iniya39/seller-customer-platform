// src/pages/EditItem.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function EditItem({ itemId }) {
    const { id } = useParams();
  const [item, setItem] = useState({
    name: "",
    description: "",
    stock: 0,
    price: 0,
    discountedPrice: 0,
    photo: "",
  });

  // Fetch item details when page loads
  useEffect(() => {
    if (!itemId) return;
    axios.get(`http://localhost:5000/api/products/${itemId}`)
      .then(res => setItem(res.data))
      .catch(err => console.error("Error fetching item:", err));
  }, [itemId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    axios.put(`http://localhost:5000/api/products/${itemId}`, item)
      .then(res => alert("Item updated successfully"))
      .catch(err => alert("Failed to update item"));
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      minHeight: "100vh",
      width: "100%",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "2rem"
    }}>
      <div style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%"
      }}>
        <h2 style={{ marginBottom: "2rem", fontSize: "2rem", textAlign: "center" }}>Edit Item</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Name:</label>
            <input 
              type="text" 
              name="name" 
              value={item.name} 
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Description:</label>
            <textarea 
              name="description" 
              value={item.description} 
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                minHeight: "100px",
                resize: "vertical"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Current Stock:</label>
            <input 
              type="number" 
              name="stock" 
              value={item.stock} 
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Price:</label>
            <input 
              type="number" 
              name="price" 
              value={item.price} 
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Discounted Price:</label>
            <input 
              type="number" 
              name="discountedPrice" 
              value={item.discountedPrice} 
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>Photo URL:</label>
            <input 
              type="text" 
              name="photo" 
              value={item.photo} 
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "1rem"
              }}
            />
          </div>
        </div>
        
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          marginTop: "2rem",
          justifyContent: "center"
        }}>
          <button 
            onClick={handleSave}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor: "#646cff",
              color: "white",
              border: "none"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#535bf2"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#646cff"}
          >
            Save
          </button>
          <button 
            onClick={() => alert("Edit cancelled")}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor: "#666",
              color: "white",
              border: "none"
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#555"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#666"}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
