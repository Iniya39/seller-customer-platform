import { useNavigate } from "react-router-dom";

export default function Dashboard({ user }) {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {user.name}</h1>
      <h2>Seller Dashboard</h2>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <button onClick={() => navigate("/add-item")}>Add Item</button>
        <button onClick={() => navigate("/edit-item")}>Edit Item</button>
        <button onClick={() => navigate("/update-delivery")}>Update Delivery</button>
      </div>
    </div>
  );
}
