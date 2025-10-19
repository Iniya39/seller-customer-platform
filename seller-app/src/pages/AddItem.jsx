import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddItem({ user }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    stock: 0,
    price: 0,
    discountedPrice: 0,
    photo: "",
    category: "",
    seller: user?._id || user?.id || ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = ["Electronics", "Clothing", "Books", "Furniture"];

  // Product templates for each category
  const productTemplates = {
    Electronics: {
      description: "Enter product specifications, features, and technical details",
      placeholder: "e.g., 64GB storage, 12MP camera, 6.1-inch display, wireless charging",
      fields: {
        brand: "Brand",
        model: "Model",
        specifications: "Technical Specifications",
        warranty: "Warranty Period"
      }
    },
    Clothing: {
      description: "Enter clothing details, size information, and material",
      placeholder: "e.g., Cotton blend, Machine washable, Available in S, M, L, XL",
      fields: {
        brand: "Brand",
        material: "Material",
        sizes: "Available Sizes",
        careInstructions: "Care Instructions"
      }
    },
    Books: {
      description: "Enter book details, author information, and publication details",
      placeholder: "e.g., Hardcover, 300 pages, Published 2023, ISBN: 978-1234567890",
      fields: {
        author: "Author",
        publisher: "Publisher",
        isbn: "ISBN",
        pages: "Number of Pages"
      }
    },
    Furniture: {
      description: "Enter furniture details, dimensions, and material information",
      placeholder: "e.g., Solid wood construction, Dimensions: 120cm x 60cm x 75cm, Assembly required",
      fields: {
        material: "Material",
        dimensions: "Dimensions",
        assembly: "Assembly Required",
        weight: "Weight"
      }
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setProductData(prev => ({ ...prev, category }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!productData.name || !productData.description) {
      alert("Please fill in product name and description");
      return;
    }

    // Ensure seller ID is included - user object from login contains _id
    const productToSave = {
      ...productData,
      seller: user?._id || user?.id || user?.seller
    };

    // If no valid seller ID, show error
    if (!productToSave.seller) {
      alert("Error: Seller information not found. Please login again.");
      return;
    }

    console.log("Saving product:", productToSave); // Debug log

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/products", productToSave);
      alert("Product added successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error details:", error.response?.data); // Debug log
      alert("Failed to add product: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setProductData({
      name: "",
      description: "",
      stock: 0,
      price: 0,
      discountedPrice: 0,
      photo: "",
      category: "",
      seller: user?._id || user?.id || ""
    });
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      minHeight: "100vh",
      width: "100%",
      maxWidth: "800px",
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
        <h2 style={{ marginBottom: "2rem", fontSize: "2rem" }}>Add New Product</h2>

        {!selectedCategory ? (
          <>
            <h3 style={{ marginBottom: "1rem", fontSize: "1.2rem" }}>Select Product Category</h3>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
              gap: "1rem",
              marginBottom: "2rem"
            }}>
        {categories.map((cat) => (
                <div
            key={cat}
            style={{
                    padding: "1.5rem",
                    border: "2px solid #ccc",
                    borderRadius: "8px",
              cursor: "pointer",
                    background: "transparent",
                    transition: "all 0.3s ease",
                    fontWeight: "500",
                    fontSize: "1.1rem"
                  }}
                  onClick={() => handleCategorySelect(cat)}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#646cff";
                    e.target.style.color = "white";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "inherit";
                  }}
          >
            {cat}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{selectedCategory} Product</h3>
              <p style={{ color: "#888", fontSize: "1rem", marginBottom: "1rem" }}>
                {productTemplates[selectedCategory].description}
              </p>
            </div>

            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "1rem",
              textAlign: "left",
              maxWidth: "600px",
              margin: "0 auto"
            }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
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
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  placeholder={productTemplates[selectedCategory].placeholder}
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={productData.stock}
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
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleChange}
                    step="0.01"
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Discounted Price ($)
                  </label>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={productData.discountedPrice}
                    onChange={handleChange}
                    step="0.01"
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
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Photo URL
                  </label>
                  <input
                    type="url"
                    name="photo"
                    value={productData.photo}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
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
                  onClick={resetForm}
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
                  Back to Categories
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "6px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    backgroundColor: loading ? "#999" : "#646cff",
                    color: "white",
                    border: "none"
                  }}
                  onMouseOver={(e) => !loading && (e.target.style.backgroundColor = "#535bf2")}
                  onMouseOut={(e) => !loading && (e.target.style.backgroundColor = "#646cff")}
                >
                  {loading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
