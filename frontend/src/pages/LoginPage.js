import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLogo, EyeSlashIcon, LoginBackground } from '../components/Icons';
import { API_BASE_URL } from '../config';
import "../App.css";

function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email) {
      setError("Email is required");
      return;
    }
    if (!form.password) {
      setError("Password is required");
      return;
    }
    if (!form.email.includes("@") || !form.email.includes(".")) {
      setError("Invalid email format");
      return;
    }

    fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          navigate("/dashboard");
        }
      })
      .catch((err) => {
        console.error("Network error:", err);
        setError("Failed to connect to server.");
      });
  };

  return (
    <div className="container-fluid main-bg p-0 position-relative">

      <div className="background-wrapper">
        <LoginBackground className="bg-graphic" />

        <div className="w-100 text-center text-white logo-section">
          <AppLogo />
          <p className="m-0 small tracking-wide mt-3 text-white-50">Online Project Management</p>
        </div>
      </div>

      <div className="form-card-container">
        <div className="form-card text-center p-4">
          <h4 className="fw-normal mb-4 text-dark">Login to get started</h4>

          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-3 text-start">
              <label className="form-label text-muted small mb-1">Email</label>
              <input name="email" type="email" className="form-control rounded-3 py-2" value={form.email} onChange={handleChange} />
            </div>

            <div className="mb-2 text-start">
              <label className="form-label text-muted small mb-1">Password</label>
              <div className="position-relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="form-control rounded-3 py-2 pe-5"
                  value={form.password}
                  onChange={handleChange}
                />
                <span className="position-absolute end-0 top-50 translate-middle-y me-3 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  <EyeSlashIcon />
                </span>
              </div>
              <div className="text-end mt-2">
                <a href="#forgot" className="text-decoration-none small text-primary">Forgot password?</a>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 rounded-pill py-2 mt-4 fw-medium">
              Login
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

export default LoginPage;