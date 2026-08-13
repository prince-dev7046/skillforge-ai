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
        <div className="auth-brand">
          <div className="auth-logo">
            <span className="auth-logo-icon">⚡</span>
            <h1>SkillForge <span>AI</span></h1>
          </div>

          <p className="auth-tagline">
            Your AI-Powered Career Mentor
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <span>📄</span>
              <p>Resume Analysis</p>
            </div>
            <div className="auth-feature">
              <span>🎯</span>
              <p>Skill Gap Detection</p>
            </div>
            <div className="auth-feature">
              <span>🗺️</span>
              <p>Learning Roadmap</p>
            </div>
            <div className="auth-feature">
              <span>💼</span>
              <p>Interview Prep</p>
            </div>
          </div>
        </div>

        <div className="auth-form-section">
          <div className="auth-card">
            <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>

            <p className="auth-subtitle">
              {isRegister
                ? "Start your career transformation journey"
                : "Login to continue your learning journey"}
            </p>

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {success && (
              <div className="auth-success">
                <span>✅</span> {success}
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
                  placeholder="Enter your email"
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
                  placeholder={isRegister ? "Create a password (min 6 chars)" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading
                  ? (isRegister ? "Creating Account..." : "Logging in...")
                  : (isRegister ? "Create Account" : "Login")
                }
              </button>
            </form>

            <p className="auth-toggle">
              {isRegister ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                className="auth-toggle-btn"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                  setSuccess("");
                }}
              >
                {isRegister ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;