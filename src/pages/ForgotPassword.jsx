import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/Auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setMessage(response.message || "Password reset link has been sent to your email");
      setSubmitted(true);
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Forgot Password</h1>

        {submitted ? (
          <div className="success-message">
            <div className="icon">✓</div>
            <p>{message}</p>
            <p className="success-message-subtext">
              Check your email (or terminal logs in dev mode) for the reset link.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="auth-button"
              style={{ marginTop: "20px", width: "100%" }}
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <p className="auth-card-description">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={loading || !email}
            >
              {loading ? "Sending Link..." : "Send Reset Link"}
            </button>

            <p className="auth-link">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="link-button"
              >
                Back to Login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
