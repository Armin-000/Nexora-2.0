// src/pages/Register.tsx
import React, { useState } from "react";
import { data, Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password || !confirm) {
      setError("All fields are required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const resp = await res.json();

      if (!res.ok) {
        setError(resp.error);
        return;
      }

      // Uspješna registracija
      setError(resp.message);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="app-root theme-light">
      <div className="chat-shell">
        <header className="topbar">
          <div className="topbar-main">
            <div className="topbar-title">NEXORA</div>
            <div className="topbar-subtitle">
              <span className="sub-label">Registration</span>
              <span className="mono sub-model">Create a Nexora account</span>
            </div>
          </div>
        </header>

        <main className="chat-body">
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="modal-form"
              style={{
                maxWidth: 420,
                width: "100%",
                borderRadius: 20,
                padding: 20,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "rgba(255,255,255,0.96)",
                boxShadow: "0 18px 40px rgba(15,23,42,0.16)",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: 12,
                  fontSize: 18,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                Registration
              </h2>

              <div className="form-group">
                <label className="field-label" htmlFor="reg-username">
                  Username
                </label>
                <input
                  id="reg-username"
                  type="text"
                  className="field-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="reg-email">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  className="field-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="reg-password">
                  Password
                </label>
                <input
                  id="reg-password"
                  type="password"
                  className="field-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
              </div>

              <div className="form-group">
                <label className="field-label" htmlFor="reg-confirm">
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  type="password"
                  className="field-input"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>

              {error && (
                <div
                  className={
                    error.includes("successfully")
                      ? "form-status form-status-success"
                      : "form-status form-status-error"
                  }
                >
                  {error}
                </div>
              )}

              <div
                className="form-actions"
                style={{ justifyContent: "space-between", marginTop: "1.5rem" }}
              >
                <Link
                  to="/"
                  className="secondary-btn"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ← Back
                </Link>

                <button type="submit" className="primary-btn">
                  Sign up
                </button>
              </div>

              <p
                className="field-hint"
                style={{ marginTop: 10, textAlign: "right" }}
              >
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Register;
