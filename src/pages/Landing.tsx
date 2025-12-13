// src/pages/Landing.tsx
import React from "react";
import { Link } from "react-router-dom";

const Landing: React.FC = () => {
  return (
    <div className="app-root theme-light">
      <div className="chat-shell">
        {/* Gornji bar (isti stil kao u App.tsx) */}
        <header className="topbar">
          <div className="topbar-main">
            <div className="topbar-title">NEXORA</div>
            <div className="topbar-subtitle">
              <span className="sub-label">AI Chatbot</span>
              <span className="mono sub-model">Local • Private • Fast</span>
            </div>
          </div>
        </header>

        {/* Tijelo – centrirani „modal” */}
        <main className="chat-body">
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <div
              style={{
                maxWidth: 780,
                width: "100%",
                borderRadius: 24,
                padding: 24,
                border: "1px solid rgba(148,163,184,0.55)",
                background:
                  "linear-gradient(145deg, rgba(249,250,251,0.98), rgba(229,231,235,0.96))",
                boxShadow:
                  "0 18px 45px rgba(15,23,42,0.22), 0 0 0 1px rgba(148,163,184,0.35)",
              }}
            >
              {/* Gornji „chip” */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.8)",
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                  background: "rgba(15,23,42,0.02)",
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "999px",
                    background: "#2563eb",
                    boxShadow: "0 0 8px rgba(37,99,235,0.7)",
                  }}
                />
                <span>Local AI coding assistant</span>
              </div>

              {/* Naslov + opis */}
              <h1
                style={{
                  margin: 0,
                  fontSize: "2rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Welcome to Nexora
              </h1>

              <p
                style={{
                  marginTop: "1rem",
                  marginBottom: "3rem",
                  fontSize: 14,
                  opacity: 0.85,
                  maxWidth: 540,
                }}
              >
                Nexora is a local AI coding assistant. It runs directly on{" "}
                <span className="mono">Ollama</span> models on your computer —
                with no cloud API calls and no code sent to third-party
                services.
              </p>

              {/* Dvije kolone benefita */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 18,
                  marginBottom: "3rem",
                }}
              >
                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <h2
                    style={{
                      margin: 0,
                      marginBottom: 6,
                      fontSize: 16,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    What does Nexora do?
                  </h2>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    <li>Explains your code (JS, TS, React, Node...)</li>
                    <li>Finds bugs and suggests fixes</li>
                    <li>Refactors and cleans up components and functions</li>
                  </ul>
                </div>

                <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                  <h2
                    style={{
                      margin: 0,
                      marginBottom: 6,
                      fontSize: 16,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    Why is it different?
                  </h2>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    <li>Runs entirely locally on your computer</li>
                    <li>No code is sent to the cloud or external services</li>
                    <li>A simple interface focused on code</li>
                  </ul>
                </div>
              </div>

              {/* Blaga razdjelnica */}
              <div
                style={{
                  height: 1,
                  background:
                    "linear-gradient(to right, transparent, #cbd5f5, transparent)",
                  margin: "10px 0 18px",
                  opacity: 0.7,
                }}
              />

              {/* CTA gumbi */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <Link
                  to="/login"
                  className="primary-btn"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 140,
                  }}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="secondary-btn"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: 140,
                  }}
                >
                  Register
                </Link>

                <span
                  style={{
                    fontSize: 11,
                    opacity: 0.7,
                    marginLeft: "auto",
                  }}
                >
                  After logging in, the Nexora chat interface will open.
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Landing;
