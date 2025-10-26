import { useState, useEffect } from "react";
import axios from "axios";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data.products || res.data);
    } catch (err) {
      alert("Failed to fetch products: " + err.message);
    }
  };

  const addProduct = async () => {
    if (!name || !price) return alert("Enter name and price");
    try {
      await axios.post("http://localhost:5000/api/products", { name, price });
      setName("");
      setPrice("");
      fetchProducts();
    } catch (err) {
      alert("Failed to add product: " + err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Product Management</h1>

      <input
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ marginRight: "1rem", padding: "0.5rem" }}
      />
      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        style={{ marginRight: "1rem", padding: "0.5rem" }}
      />
      <button onClick={addProduct} style={{ padding: "0.5rem 1rem" }}>
        Add Product
      </button>

      <ul style={{ marginTop: "2rem" }}>
        {products.map((p) => (
          <li key={p._id}>
            {p.name} - ₹{p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
