import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function Login() {
  const navigate = useNavigate();
  const { login, register } = useContext(UserContext);

  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [localSuccess, setLocalSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLocalSuccess("");
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        if (!name || !email || !password) {
          throw new Error("All fields are required.");
        }
        await register(name, email, password);
        setLocalSuccess("Registration successful! Please sign in below.");
        setIsRegistering(false);
        setPassword("");
      } else {
        if (!email || !password) {
          throw new Error("Email and password are required.");
        }
        await login(email, password);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Auth submit error:", error);
      setLocalError(error.message || "An error occurred during authentication.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "75vh",
        padding: "var(--space-md)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--bg-card)",
          border: "var(--border-lg)",
          borderRadius: "var(--radius-md)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
      >
        {/* Toggle Tabs */}
        <div style={{ display: "flex", borderBottom: "var(--border-md)" }}>
          <button
            onClick={() => {
              setIsRegistering(false);
              setLocalError("");
              setLocalSuccess("");
            }}
            style={{
              flex: 1,
              padding: "var(--space-md)",
              fontSize: "16px",
              fontWeight: "800",
              textTransform: "uppercase",
              backgroundColor: !isRegistering ? "var(--neo-yellow)" : "white",
              border: "none",
              boxShadow: "none",
              borderRadius: 0,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsRegistering(true);
              setLocalError("");
              setLocalSuccess("");
            }}
            style={{
              flex: 1,
              padding: "var(--space-md)",
              fontSize: "16px",
              fontWeight: "800",
              textTransform: "uppercase",
              backgroundColor: isRegistering ? "var(--neo-yellow)" : "white",
              border: "none",
              boxShadow: "none",
              borderRadius: 0,
              cursor: "pointer",
              borderLeft: "var(--border-md)",
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "var(--space-lg)" }}>
          <h2 style={{ textAlign: "center", marginBottom: "var(--space-md)", textTransform: "uppercase" }}>
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>

          {localSuccess && (
            <div
              style={{
                backgroundColor: "var(--surface-green)",
                border: "var(--border-sm)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-sm)",
                marginBottom: "var(--space-md)",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              ✅ {localSuccess}
            </div>
          )}

          {localError && (
            <div
              style={{
                backgroundColor: "var(--surface-pink)",
                border: "var(--border-sm)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-sm)",
                marginBottom: "var(--space-md)",
                fontWeight: "700",
                fontSize: "13px",
              }}
            >
              ❌ {localError}
            </div>
          )}

          {isRegistering && (
            <div style={{ marginBottom: "var(--space-md)" }}>
              <label style={{ display: "block", fontWeight: "700", marginBottom: "var(--space-2xs)" }}>
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "var(--space-sm)",
                  border: "var(--border-sm)",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-body)",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "var(--space-md)" }}>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "var(--space-2xs)" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "var(--space-sm)",
                border: "var(--border-sm)",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>

          <div style={{ marginBottom: "var(--space-lg)" }}>
            <label style={{ display: "block", fontWeight: "700", marginBottom: "var(--space-2xs)" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "var(--space-sm)",
                border: "var(--border-sm)",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "var(--space-md)",
              textTransform: "uppercase",
              fontSize: "14px",
              fontWeight: "800",
            }}
          >
            {isSubmitting ? "Processing..." : isRegistering ? "Sign Up" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;