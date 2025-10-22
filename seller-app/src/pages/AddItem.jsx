import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddItem({ user }) {
  console.log('AddItem component rendered with user:', user); // Debug log
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [productData, setProductData] = useState({
    productId: "",
    name: "",
    description: "",
    stock: 0,
    price: 0,
    discountedPrice: 0,
    photo: "",
    category: "",
    seller: user?._id || user?.id || "",
    sellerName: user?.name || "",
    sellerEmail: user?.email || "",
    userId: user?._id || user?.id || "",
    hasVariations: false,
    variationType: "",
    variations: []
  });
  const [variations, setVariations] = useState([]);
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
    try {
      const { name, value, files } = e.target;
      if (name === 'photoFile') {
        setProductData(prev => ({ ...prev, photoFile: files && files[0] ? files[0] : null }));
        return;
      }
      if (name === 'hasVariations') {
        const boolValue = value === 'true' || value === true;
        console.log('hasVariations changed to:', boolValue); // Debug log
        setProductData(prev => ({ 
          ...prev, 
          [name]: boolValue,
          variations: boolValue ? [] : []
        }));
        setVariations([]);
        return;
      }
      setProductData(prev => ({ ...prev, [name]: value }));
    } catch (error) {
      console.error('Error in handleChange:', error);
      alert('An error occurred while updating the form. Please try again.');
    }
  };

  const addVariation = () => {
    try {
      const newVariation = {
        name: "",
        price: 0,
        discountedPrice: 0,
        stock: 0,
        isActive: true
      };
      setVariations([...variations, newVariation]);
    } catch (error) {
      console.error('Error adding variation:', error);
      alert('An error occurred while adding variation. Please try again.');
    }
  };

  const updateVariation = (index, field, value) => {
    try {
      const updatedVariations = variations.map((variation, i) => 
        i === index ? { ...variation, [field]: value } : variation
      );
      setVariations(updatedVariations);
    } catch (error) {
      console.error('Error updating variation:', error);
      alert('An error occurred while updating variation. Please try again.');
    }
  };

  const removeVariation = (index) => {
    try {
      const updatedVariations = variations.filter((_, i) => i !== index);
      setVariations(updatedVariations);
    } catch (error) {
      console.error('Error removing variation:', error);
      alert('An error occurred while removing variation. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!productData.productId || !productData.name || !productData.description) {
      alert("Please fill in Product ID, product name and description");
      return;
    }

    // Validate variations if hasVariations is true
    if (productData.hasVariations) {
      if (!productData.variationType) {
        alert("Please specify the variation type (e.g., Size, Color, Storage)");
        return;
      }
      if (variations.length === 0) {
        alert("Please add at least one variation");
        return;
      }
      for (let i = 0; i < variations.length; i++) {
        const variation = variations[i];
        if (!variation.name || variation.price <= 0 || variation.stock < 0) {
          alert(`Please fill in all required fields for variation ${i + 1}`);
          return;
        }
      }
    } else {
      // For products without variations, validate base price and stock
      if (productData.price <= 0) {
        alert("Please enter a valid price");
        return;
      }
      if (productData.stock < 0) {
        alert("Please enter a valid stock quantity");
        return;
      }
    }

    // Ensure seller ID is included - user object from login contains _id
    const productToSave = {
      ...productData,
      seller: user?._id || user?.id || user?.seller,
      sellerName: user?.name || "",
      sellerEmail: user?.email || "",
      variations: productData.hasVariations ? variations : []
    };

    // If no valid seller ID, show error
    if (!productToSave.seller) {
      alert("Error: Seller information not found. Please login again.");
      return;
    }

    console.log("Saving product:", productToSave); // Debug log

    setLoading(true);
    try {
      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append('productId', productToSave.productId);
      formData.append('name', productToSave.name);
      formData.append('description', productToSave.description);
      formData.append('category', productToSave.category);
      formData.append('hasVariations', productToSave.hasVariations);
      formData.append('variationType', productToSave.variationType || '');
      formData.append('variations', JSON.stringify(productToSave.variations));
      
      // Only add base price/stock if no variations
      if (!productToSave.hasVariations) {
        formData.append('price', productToSave.price);
        if (productToSave.discountedPrice !== undefined && productToSave.discountedPrice !== null) {
          formData.append('discountedPrice', productToSave.discountedPrice);
        }
        formData.append('stock', productToSave.stock);
      }
      
      formData.append('seller', productToSave.seller);
      formData.append('sellerName', productToSave.sellerName);
      formData.append('sellerEmail', productToSave.sellerEmail);
      if (productToSave.photoFile) {
        formData.append('photo', productToSave.photoFile);
      } else if (productToSave.photo) {
        // Fallback: URL string
        formData.append('photo', productToSave.photo);
      }

      const response = await axios.post("http://localhost:5000/api/products", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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
      productId: "",
      name: "",
      description: "",
      stock: 0,
      price: 0,
      discountedPrice: 0,
      photo: "",
      category: "",
      seller: user?._id || user?.id || "",
      sellerName: user?.name || "",
      sellerEmail: user?.email || "",
      userId: user?._id || user?.id || "",
      hasVariations: false,
      variationType: "",
      variations: []
    });
    setVariations([]);
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
                  Product ID *
                </label>
                <input
                  type="text"
                  name="productId"
                  value={productData.productId}
                  onChange={handleChange}
                  placeholder="Enter unique product ID (e.g., ELEC001, CLOTH002)"
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

              {/* Seller Information Display */}
              <div style={{ 
                padding: "1rem", 
                background: "#f8f9fa", 
                borderRadius: "6px", 
                border: "1px solid #e9ecef" 
              }}>
                <h4 style={{ margin: "0 0 0.5rem 0", color: "#495057", fontSize: "1rem" }}>Seller Information</h4>
                <div style={{ fontSize: "0.9rem", color: "#6c757d", marginBottom: "1rem" }}>
                  <div><strong>Name:</strong> {productData.sellerName || "Not available"}</div>
                  <div><strong>Email:</strong> {productData.sellerEmail || "Not available"}</div>
                  <div><strong>Seller ID:</strong> {productData.seller || "Not available"}</div>
                </div>
                
                {/* Manual User ID Input */}
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500", fontSize: "0.9rem" }}>
                    User ID (if different from Seller ID)
                  </label>
                  <input
                    type="text"
                    name="userId"
                    value={productData.userId || productData.seller}
                    onChange={handleChange}
                    placeholder="Enter your User ID"
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                      fontSize: "0.9rem"
                    }}
                  />
                  <div style={{ fontSize: "0.8rem", color: "#6c757d", marginTop: "0.25rem" }}>
                    This is used for cart functionality. Usually same as Seller ID.
                  </div>
                </div>
              </div>

              {/* Product Variations Toggle */}
              <div style={{ 
                padding: "1rem", 
                background: "#f8f9fa", 
                borderRadius: "8px", 
                border: "1px solid #e9ecef" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "500" }}>
                    <input
                      type="checkbox"
                      name="hasVariations"
                      checked={productData.hasVariations}
                      onChange={(e) => handleChange({ target: { name: 'hasVariations', value: e.target.checked.toString() } })}
                      style={{ transform: "scale(1.2)" }}
                    />
                    This product has variations (e.g., different sizes, colors, storage)
                  </label>
                </div>

                {productData.hasVariations && (
                  <div>
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                        Variation Type
                      </label>
                      <input
                        type="text"
                        name="variationType"
                        value={productData.variationType}
                        onChange={handleChange}
                        placeholder="e.g., Size, Color, Storage, Memory"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          fontSize: "1rem"
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <button
                        type="button"
                        onClick={addVariation}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          border: "1px solid #007bff",
                          background: "#007bff",
                          color: "white",
                          cursor: "pointer",
                          fontSize: "0.9rem"
                        }}
                      >
                        + Add Variation
                      </button>
                    </div>

                    {variations.map((variation, index) => (
                      <div key={index} style={{
                        padding: "1rem",
                        border: "1px solid #dee2e6",
                        borderRadius: "6px",
                        marginBottom: "1rem",
                        background: "white"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                          <h4 style={{ margin: 0, fontSize: "1rem" }}>Variation {index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeVariation(index)}
                            style={{
                              padding: "0.25rem 0.5rem",
                              borderRadius: "4px",
                              border: "1px solid #dc3545",
                              background: "#dc3545",
                              color: "white",
                              cursor: "pointer",
                              fontSize: "0.8rem"
                            }}
                          >
                            Remove
                          </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
                          <div>
                            <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", fontWeight: "500" }}>
                              Name *
                            </label>
                            <input
                              type="text"
                              value={variation.name}
                              onChange={(e) => updateVariation(index, 'name', e.target.value)}
                              placeholder="e.g., Small, Red, 64GB"
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontSize: "0.9rem"
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", fontWeight: "500" }}>
                              Price ($) *
                            </label>
                            <input
                              type="number"
                              value={variation.price}
                              onChange={(e) => updateVariation(index, 'price', parseFloat(e.target.value) || 0)}
                              step="0.01"
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontSize: "0.9rem"
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", fontWeight: "500" }}>
                              Discounted Price ($)
                            </label>
                            <input
                              type="number"
                              value={variation.discountedPrice}
                              onChange={(e) => updateVariation(index, 'discountedPrice', parseFloat(e.target.value) || 0)}
                              step="0.01"
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontSize: "0.9rem"
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem", fontWeight: "500" }}>
                              Stock *
                            </label>
                            <input
                              type="number"
                              value={variation.stock}
                              onChange={(e) => updateVariation(index, 'stock', parseInt(e.target.value) || 0)}
                              min="0"
                              style={{
                                width: "100%",
                                padding: "0.5rem",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                                fontSize: "0.9rem"
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Base Price/Stock (only show if no variations) */}
              {!productData.hasVariations && (
                <>
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
                  </>
                )}

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                    Product Photo
                  </label>
                  <input
                    type="file"
                    name="photoFile"
                    accept="image/*"
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      fontSize: "1rem",
                      background: "white"
                    }}
                  />
                  {productData.photoFile && (
                    <div style={{ marginTop: "0.5rem", color: "#555", fontSize: "0.9rem" }}>
                      Selected: <span style={{ fontWeight: 600 }}>{productData.photoFile.name}</span>
                    </div>
                  )}
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
