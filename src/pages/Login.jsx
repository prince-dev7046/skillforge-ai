import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        if (!name || !email || !password) {
          setError("All fields are required.");
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }

        await registerUser(name, email, password);
        setSuccess("Account created successfully! Please login.");
        setIsRegister(false);
        setName("");
        setPassword("");
      } else {
        if (!email || !password) {
          setError("Email and password are required.");
          setLoading(false);
          return;
        }

        const data = await loginUser(email, password);
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Hero Brand Panel */}
        <div className="auth-brand">
          <div>
            <div className="auth-brand-badge">✦ AI-POWERED CAREERSHIP</div>

            <div className="auth-logo">
              {/* <span className="auth-logo-icon">⚡</span> */}
              <h1>
                SkillForge <span>AI</span>
              </h1>
            </div>

            <p className="auth-tagline">
              Your AI-Powered Career Mentor & Personal Roadmap Generator
            </p>

            <div className="auth-features">
              <div className="auth-feature">
                <span className="auth-feature-icon">📄</span>
                <div>
                  <h4>Resume Analysis</h4>
                  <p>Client-side PDF extraction</p>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">🎯</span>
                <div>
                  <h4>Skill Gap Detection</h4>
                  <p>Benchmark against target roles</p>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">🗺️</span>
                <div>
                  <h4>Learning Roadmap</h4>
                  <p>Step-by-step milestone path</p>
                </div>
              </div>

              <div className="auth-feature">
                <span className="auth-feature-icon">💼</span>
                <div>
                  <h4>Interview Prep</h4>
                  <p>AI scoring & feedback coach</p>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            <span>⚡ Powered by Google Gemini AI</span>
          </div>
        </div>

        {/* Right Form Card Panel */}
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
              <p className="auth-subtitle">
                {isRegister
                  ? "Start your personalized career transformation"
                  : "Login to continue your learning milestones"}
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <span className="auth-status-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="auth-success">
                <span className="auth-status-icon">✅</span>
                <p>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder={
                    isRegister
                      ? "Create a strong password (min 6 chars)"
                      : "Enter your password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isRegister && (
                <div style={{ textAlign: "right", marginBottom: "15px" }}>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0066cc",
                      cursor: "pointer",
                      textDecoration: "none",
                      fontSize: "0.9rem",
                      padding: "0",
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                    onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading
                  ? isRegister
                    ? "Creating Account..."
                    : "Logging in..."
                  : isRegister
                  ? "Create Account →"
                  : "Login →"}
              </button>
            </form>

            <div className="auth-toggle-box">
              <p className="auth-toggle">
                {isRegister
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <button
                  type="button"
                  className="auth-toggle-btn"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError("");
                    setSuccess("");
                  }}
                >
                  {isRegister ? "Login" : "Sign Up Free"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;