import { useState } from "react";

export default function ProductForm({ product }) {
  const [prodData, setProdData] = useState(product);
  const [editing, setEditing] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProdData({ ...prodData, [name]: value });
  };

  const handleSave = () => {
    setEditing(false);
    console.log("Saved product:", prodData);
    // Add Axios POST/PUT to save in backend
  };

  const handleEdit = () => setEditing(true);

  return (
    <div style={{ border: "1px solid gray", padding: "10px", marginTop: "10px" }}>
      <h4>Product Details</h4>

      <input
        name="name"
        placeholder="Name"
        value={prodData.name}
        onChange={handleChange}
        disabled={!editing}
      /><br />

      <input
        name="description"
        placeholder="Description"
        value={prodData.description}
        onChange={handleChange}
        disabled={!editing}
      /><br />

      <input
        name="stock"
        type="number"
        placeholder="Current Stock"
        value={prodData.stock}
        onChange={handleChange}
        disabled={!editing}
      /><br />

      <input
        name="price"
        type="number"
        placeholder="Price"
        value={prodData.price}
        onChange={handleChange}
        disabled={!editing}
      /><br />

      <input
        name="discount"
        type="number"
        placeholder="Discounted Price"
        value={prodData.discount}
        onChange={handleChange}
        disabled={!editing}
      /><br />

      <input
        name="photo"
        placeholder="Photo URL"
        value={prodData.photo}
        onChange={handleChange}
        disabled={!editing}
      /><br />

      <button onClick={handleEdit} disabled={editing}>Edit</button>
      <button onClick={handleSave} disabled={!editing}>Save</button>
    </div>
  );
}
