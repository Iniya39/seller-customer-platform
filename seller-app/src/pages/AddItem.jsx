import { useState } from "react";
import ProductCategory from "../components/ProductCategory";

export default function AddItem() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categories = ["Electronics", "Clothing", "Books", "Furniture"];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Product</h2>

      <h3>Product Categories</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {categories.map((cat) => (
          <li
            key={cat}
            style={{
              padding: "10px",
              margin: "5px 0",
              border: "1px solid gray",
              cursor: "pointer",
              background: selectedCategory === cat ? "#e0f7fa" : "#fff",
            }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </li>
        ))}
      </ul>

      {selectedCategory && <ProductCategory category={selectedCategory} />}
    </div>
  );
}
