// src/pages/EditItem.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function EditItem({ itemId }) {
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
    <div style={{ padding: "20px" }}>
      <h2>Edit Item</h2>
      <div>
        <label>Name:</label>
        <input type="text" name="name" value={item.name} onChange={handleChange} />
      </div>
      <div>
        <label>Description:</label>
        <textarea name="description" value={item.description} onChange={handleChange} />
      </div>
      <div>
        <label>Current Stock:</label>
        <input type="number" name="stock" value={item.stock} onChange={handleChange} />
      </div>
      <div>
        <label>Price:</label>
        <input type="number" name="price" value={item.price} onChange={handleChange} />
      </div>
      <div>
        <label>Discounted Price:</label>
        <input type="number" name="discountedPrice" value={item.discountedPrice} onChange={handleChange} />
      </div>
      <div>
        <label>Photo URL:</label>
        <input type="text" name="photo" value={item.photo} onChange={handleChange} />
      </div>
      <div style={{ marginTop: "10px" }}>
        <button onClick={handleSave}>Save</button>
        <button onClick={() => alert("Edit cancelled")} style={{ marginLeft: "10px" }}>Cancel</button>
      </div>
    </div>
  );
}
