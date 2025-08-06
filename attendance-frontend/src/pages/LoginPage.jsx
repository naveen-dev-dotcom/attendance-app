import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/class-selection");
    } catch (err) {
      setError("Invalid credentials, please try again.");
    }
  };

  return (
    <div className="login-box">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
<div className="form-group" style={{ position: "relative", width: "fit-content" }}>
  <input
    type={showPass ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    style={{ paddingRight: "2.5rem" }}  // add right padding so text doesn't overlap the emoji
  />
  <span
    onClick={() => setShowPass((show) => !show)}
    tabIndex={0}
    title={showPass ? "Hide Password" : "Show Password"}
    aria-label={showPass ? "Hide Password" : "Show Password"}
    style={{
      position: "absolute",
      right: "0.5rem",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      userSelect: "none",
      fontSize: "1.2rem",
    }}
  >
    {showPass ? "🙈" : "👁️"}
  </span>
</div>

        <div className="form-group">
          <button type="submit" className="login-button">
            Login
          </button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
