import { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/UserContext";

function Profile() {
  const { user, skillData, updateProfile } = useContext(UserContext);
  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setTargetRole(user.targetRole || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage("");
      setErrMessage("");
      await updateProfile(name, targetRole);
      setMessage("Profile and target role updated successfully!");
    } catch (err) {
      console.error(err);
      setErrMessage(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const flatSkills = skillData.resumeSkills
    ? (Array.isArray(skillData.resumeSkills) ? skillData.resumeSkills : Object.values(skillData.resumeSkills).flat())
    : [];

  const roles = [
    "Full Stack Developer",
    "Machine Learning Engineer",
    "Data Scientist",
    "Backend Developer",
  ];

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your account settings, career goals, and review your status.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Profile Card Form */}
        <div className="dashboard-card">
          <h2>Edit Settings</h2>
          <form onSubmit={handleSubmit} className="profile-form">
            <div style={{ marginBottom: "var(--space-md)" }}>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "var(--space-2xs)" }}>Name</label>
              <input
                type="text"
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

            <div style={{ marginBottom: "var(--space-md)" }}>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "var(--space-2xs)" }}>Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                style={{
                  width: "100%",
                  padding: "var(--space-sm)",
                  border: "var(--border-sm)",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "#E2E8F0",
                  color: "var(--text-muted)",
                  cursor: "not-allowed",
                  fontFamily: "var(--font-body)",
                }}
              />
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Email addresses are locked for security purposes.
              </span>
            </div>

            <div style={{ marginBottom: "var(--space-lg)" }}>
              <label style={{ fontWeight: "700", display: "block", marginBottom: "var(--space-2xs)" }}>Target Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "var(--space-sm)",
                  border: "var(--border-sm)",
                  borderRadius: "var(--radius-sm)",
                  fontFamily: "var(--font-body)",
                  fontWeight: "600",
                }}
              >
                <option value="">Select a Target Role</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {message && (
              <p className="ai-success" style={{ color: "var(--neo-green)", fontWeight: "700", marginBottom: "var(--space-md)" }}>
                ✅ {message}
              </p>
            )}

            {errMessage && (
              <p className="ai-error" style={{ color: "var(--neo-pink)", fontWeight: "700", marginBottom: "var(--space-md)" }}>
                ❌ {errMessage}
              </p>
            )}

            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Profile Statistics Summary */}
        <div className="dashboard-card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <h2>Goal Overview</h2>
          
          <div className="goal-overview-item" style={{ padding: "var(--space-md)", border: "var(--border-sm)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--surface-cyan)" }}>
            <p style={{ fontWeight: "700", textTransform: "uppercase", fontSize: "12px", color: "var(--text-muted)" }}>Current Goal</p>
            <h3 style={{ margin: "var(--space-2xs) 0 0" }}>{user?.targetRole || "No role selected"}</h3>
          </div>

          <div className="goal-overview-item" style={{ padding: "var(--space-md)", border: "var(--border-sm)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--surface-yellow)" }}>
            <p style={{ fontWeight: "700", textTransform: "uppercase", fontSize: "12px", color: "var(--text-muted)" }}>Career Readiness</p>
            <h3 style={{ margin: "var(--space-2xs) 0 0" }}>
              {skillData.aiSkillAnalysis?.careerReadiness || "Developing (Beginner)"}
            </h3>
          </div>

          <div className="goal-overview-item" style={{ padding: "var(--space-md)", border: "var(--border-sm)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--surface-green)" }}>
            <p style={{ fontWeight: "700", textTransform: "uppercase", fontSize: "12px", color: "var(--text-muted)" }}>Extracted Skills</p>
            <h3 style={{ margin: "var(--space-2xs) 0 0" }}>{flatSkills.length} Detected Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2xs)", marginTop: "var(--space-xs)" }}>
              {flatSkills.slice(0, 10).map(s => (
                <span key={s} className="skill-tag" style={{ fontSize: "11px", padding: "2px 6px" }}>{s}</span>
              ))}
              {flatSkills.length > 10 && <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>+{flatSkills.length - 10} more</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
