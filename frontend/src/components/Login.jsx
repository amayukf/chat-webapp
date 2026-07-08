import { useState } from "react";
import "./Login.css";

/* ── Advanced SVG illustration that replaces the plain emoji ── */
function HeroIllustration() {
  return (
    <svg
      className="hero-svg"
      viewBox="0 0 220 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f1db5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="bubble1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="bubble2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="bubble3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="softglow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Background panel */}
      <rect width="220" height="160" rx="20" fill="url(#bg)" />
      {/* Subtle grid */}
      {[20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map((x) => (
        <line
          key={`v${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2="160"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}
      {[20, 40, 60, 80, 100, 120, 140].map((y) => (
        <line
          key={`h${y}`}
          x1="0"
          y1={y}
          x2="220"
          y2={y}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}
      {/* Glow circles */}
      <circle
        cx="55"
        cy="75"
        r="35"
        fill="rgba(139,92,246,0.2)"
        filter="url(#softglow)"
      />
      <circle
        cx="165"
        cy="85"
        r="30"
        fill="rgba(99,102,241,0.2)"
        filter="url(#softglow)"
      />
      {/* ── Left chat bubble (received) ── */}
      <rect
        x="18"
        y="35"
        width="90"
        height="32"
        rx="10"
        fill="url(#bubble1)"
        filter="url(#glow)"
        className="bubble b1"
      />
      {/* Tail */}
      <polygon points="18,52 10,62 22,58" fill="#6366f1" />
      {/* Text lines */}
      <rect
        x="26"
        y="43"
        width="50"
        height="5"
        rx="2.5"
        fill="rgba(255,255,255,0.85)"
      />
      <rect
        x="26"
        y="52"
        width="35"
        height="5"
        rx="2.5"
        fill="rgba(255,255,255,0.55)"
      />
      {/* Read tick */}
      <text x="100" y="61" fontSize="8" fill="#a5f3fc" fontFamily="sans-serif">
        ✓✓
      </text>
      {/* ── Right chat bubble (sent) ── */}
      <rect
        x="112"
        y="18"
        width="90"
        height="32"
        rx="10"
        fill="url(#bubble2)"
        filter="url(#glow)"
        className="bubble b2"
      />
      {/* Tail */}
      <polygon points="202,35 210,45 198,41" fill="#7c3aed" />
      {/* Text lines */}
      <rect
        x="120"
        y="26"
        width="55"
        height="5"
        rx="2.5"
        fill="rgba(255,255,255,0.85)"
      />
      <rect
        x="120"
        y="35"
        width="40"
        height="5"
        rx="2.5"
        fill="rgba(255,255,255,0.55)"
      />
      <text x="164" y="44" fontSize="8" fill="#a5f3fc" fontFamily="sans-serif">
        ✓✓
      </text>
      {/* ── Third bubble (received) ── */}
      <rect
        x="18"
        y="82"
        width="82"
        height="28"
        rx="10"
        fill="url(#bubble3)"
        filter="url(#glow)"
        className="bubble b3"
      />
      <polygon points="18,96 10,106 22,102" fill="#8b5cf6" />
      <rect
        x="26"
        y="90"
        width="45"
        height="5"
        rx="2.5"
        fill="rgba(255,255,255,0.85)"
      />
      <rect
        x="26"
        y="99"
        width="30"
        height="5"
        rx="2.5"
        fill="rgba(255,255,255,0.55)"
      />
      {/* ── User Avatars ── */}
      {/* User A */}
      <circle
        cx="15"
        cy="130"
        r="13"
        fill="#4f1db5"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
      />
      <circle cx="15" cy="126" r="5" fill="#c4b5fd" />
      <ellipse cx="15" cy="138" rx="8" ry="5" fill="#c4b5fd" />
      <circle
        cx="24"
        cy="138"
        r="4"
        fill="#22c55e"
        stroke="white"
        strokeWidth="1.2"
      />{" "}
      {/* online dot */}
      {/* User B */}
      <circle
        cx="205"
        cy="125"
        r="13"
        fill="#3730a3"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
      />
      <circle cx="205" cy="121" r="5" fill="#a5b4fc" />
      <ellipse cx="205" cy="133" rx="8" ry="5" fill="#a5b4fc" />
      <circle
        cx="214"
        cy="133"
        r="4"
        fill="#22c55e"
        stroke="white"
        strokeWidth="1.2"
      />
      {/* User C (offline) */}
      <circle
        cx="110"
        cy="140"
        r="11"
        fill="#6d28d9"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.2"
      />
      <circle cx="110" cy="136" r="4" fill="#ddd6fe" />
      <ellipse cx="110" cy="147" rx="7" ry="4" fill="#ddd6fe" />
      <circle
        cx="118"
        cy="147"
        r="3.5"
        fill="#6b7280"
        stroke="white"
        strokeWidth="1"
      />
      {/* ── Lightning / real-time signal ── */}
      <text
        x="98"
        y="78"
        fontSize="18"
        fill="#fbbf24"
        filter="url(#glow)"
        className="bolt"
      >
        ⚡
      </text>
      {/* ── WiFi waves ── */}
      <g
        transform="translate(185,50)"
        stroke="#a78bfa"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
        className="wifi"
      >
        <path d="M-8,8 Q0,-2 8,8" />
        <path d="M-14,14 Q0,-8 14,14" />
        <path d="M-20,20 Q0,-14 20,20" />
        <circle cx="0" cy="12" r="2" fill="#a78bfa" />
      </g>
      {/* Floating dots */}
      <circle
        cx="95"
        cy="30"
        r="3"
        fill="#fbbf24"
        opacity="0.8"
        className="dot d1"
      />
      <circle
        cx="145"
        cy="62"
        r="2.5"
        fill="#34d399"
        opacity="0.7"
        className="dot d2"
      />
      <circle
        cx="195"
        cy="100"
        r="2"
        fill="#f472b6"
        opacity="0.6"
        className="dot d3"
      />
    </svg>
  );
}

function Login({ socket, setUser, isConnected }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const API_URL = import.meta.env.DEV ? "http://localhost:5000" : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const endpoint =
        mode === "register"
          ? `${API_URL}/api/register`
          : `${API_URL}/api/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      socket.emit("register", data.user._id);
      socket.once("userList", () => {
        setUser(data.user);
        setIsLoading(false);
      });
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="login-card">
        {/* Shimmer top bar */}
        <div className="card-shimmer" />

        {/* Hero illustration */}
        <div className="hero-wrapper">
          <HeroIllustration />
        </div>

        {/* Branding */}
        <div className="brand">
          <h1 className="brand-title">Chatting System</h1>
          <p className="brand-tagline">Real-time · Secure · Always Connected</p>
        </div>

        {/* Connection status */}
        <div
          className={`connection-status ${isConnected ? "connected" : "disconnected"}`}
        >
          <span className="connection-dot" />
          <span>{isConnected ? "Server connected" : "Connecting…"}</span>
        </div>

        {/* Mode tabs */}
        <div className="mode-tabs">
          <button
            type="button"
            className={`tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message" role="alert">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="input-group">
            <span className="input-icon">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={!isConnected || isLoading}
              maxLength={20}
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <span className="input-icon">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!isConnected || isLoading}
              minLength={6}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPass((p) => !p)}
              tabIndex={-1}
              aria-label="Toggle password visibility"
            >
              {showPass ? "🙈" : "👁"}
            </button>
          </div>

          {mode === "register" && (
            <div className="input-group">
              <span className="input-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={!isConnected || isLoading}
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          )}

          <button
            type="submit"
            className="submit-btn"
            disabled={
              !username.trim() ||
              !password ||
              !isConnected ||
              isLoading ||
              (mode === "register" && password !== confirmPassword)
            }
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <>
                <span>
                  {mode === "register" ? "Create Account" : "Sign In"}
                </span>
                <span className="btn-arrow">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </>
            )}
          </button>
        </form>

        <p className="footer-note">
          🔒 Secured with JWT · Real-time via Socket.IO
        </p>
      </div>
    </div>
  );
}

export default Login;
