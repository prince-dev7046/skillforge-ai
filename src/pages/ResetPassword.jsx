import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "../styles/Auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Verify the reset token
    const verifyToken = async () => {
      try {
        await api.get(`/auth/verify-reset-token/${token}`);
        setTokenValid(true);
        setMessage("Token is valid. Enter your new password below.");
      } catch (err) {
        setError(
          err.message || "Invalid or expired reset token. Please request a new one."
        );
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError("No reset token provided");
      setVerifying(false);
    }
  }, [token]);

  // Calculate password strength score (0 to 3)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd) && pwd.length >= 10) score += 1;
    return score;
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate passwords
    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });

      setSuccess(true);
      setMessage(response.message || "Password has been reset successfully!");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect to login after 2.5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Reset Password</h1>

        {verifying ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p className="auth-card-description">Verifying reset token...</p>
            <div className="spinner"></div>
          </div>
        ) : success ? (
          <div className="success-message">
            <div className="icon">✓</div>
            <p>{message}</p>
            <p className="success-message-subtext">
              Redirecting you to login...
            </p>
          </div>
        ) : !tokenValid ? (
          <div className="error-container">
            <div className="error-icon">✕</div>
            <p className="error-message" style={{ marginBottom: "20px", justifyContent: "center" }}>
              {error}
            </p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="auth-button"
              style={{ width: "100%" }}
            >
              Request New Reset Link
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                  style={{ width: "100%", paddingRight: "60px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "var(--nb-violet)",
                  }}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {/* Dynamic Password Strength Indicator */}
            {newPassword && (
              <div style={{ margin: "2px 0 8px" }}>
                <div className="password-strength">
                  <div className={`strength-bar ${strength >= 1 ? (strength === 1 ? "weak" : strength === 2 ? "medium" : "strong") : ""}`}></div>
                  <div className={`strength-bar ${strength >= 2 ? (strength === 2 ? "medium" : "strong") : ""}`}></div>
                  <div className={`strength-bar ${strength >= 3 ? "strong" : ""}`}></div>
                </div>
                <p style={{ fontSize: "12px", color: strength === 1 ? "#e11d48" : strength === 2 ? "#d97706" : "#059669", margin: "4px 0 0", fontWeight: 600 }}>
                  {strength === 1 ? "Weak password" : strength === 2 ? "Good password" : "Strong password"}
                </p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--nb-muted, #666)", marginBottom: "8px" }}>
              ✓ At least 6 characters
              {newPassword.length >= 6 && confirmPassword === newPassword && (
                <span style={{ color: "#059669", fontWeight: 600 }}> • Passwords match ✓</span>
              )}
            </div>

            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={
                loading ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                newPassword.length < 6
              }
            >
              {loading ? "Resetting Password..." : "Reset Password"}
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
