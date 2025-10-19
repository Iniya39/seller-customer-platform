import { useNavigate } from "react-router-dom";

export default function Dashboard({ user }) {
  const navigate = useNavigate();

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
        padding: "3rem",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        textAlign: "center"
      }}>
        <h1 style={{ marginBottom: "1rem", fontSize: "2.5rem" }}>Welcome, {user.name}</h1>
        <h2 style={{ marginBottom: "3rem", fontSize: "1.5rem", color: "#888" }}>Seller Dashboard</h2>

        <div style={{ 
          display: "flex", 
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "300px",
          margin: "0 auto"
        }}>
          <button 
            onClick={() => navigate("/add-item")}
            style={{
              padding: "1rem 2rem",
              borderRadius: "8px",
              fontSize: "1.1rem",
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
            Add New Product
          </button>
          <button 
            onClick={() => navigate("/edit-item")}
            style={{
              padding: "1rem 2rem",
              borderRadius: "8px",
              fontSize: "1.1rem",
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
            Edit Item
          </button>
          <button 
            onClick={() => navigate("/update-delivery")}
            style={{
              padding: "1rem 2rem",
              borderRadius: "8px",
              fontSize: "1.1rem",
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
            Update Delivery
          </button>
        </div>
      </div>
    </div>
  );
}
