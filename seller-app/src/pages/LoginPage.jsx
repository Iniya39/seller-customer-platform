import { useState } from "react";
import axios from "axios";

export default function LoginPage({ setLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/users/login", { email, password });
      
      // Save token (optional)
      localStorage.setItem("token", res.data.token);

      alert("Login successful!");
      setLoggedIn(true);
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Seller Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", padding: "0.5rem" }}
      />
      <button onClick={handleLogin} style={{ padding: "0.5rem 1rem" }}>
        Login
      </button>
    </div>
  );
}
