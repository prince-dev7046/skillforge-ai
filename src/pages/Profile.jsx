import { useState, useEffect } from "react";
import { getProfile, updateProfile, getSkillForgeData, updateSkillForgeData } from "../services/api";
import SkillCard from "../components/SkillCard";
import StatCard from "../components/StatCard";

const supportedRoles = [
  "Full Stack Developer",
  "Machine Learning Engineer",
  "Data Scientist",
  "Backend Developer",
];

function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        const [userData, sfData] = await Promise.all([
          getProfile(),
          getSkillForgeData(),
        ]);

        setProfile(userData);
        setName(userData.name || "");
        setTargetRole(userData.targetRole || sfData.targetRole || "Full Stack Developer");

        const rawSkills = sfData.resumeSkills || {};
        const skillsArr = Array.isArray(rawSkills)
          ? rawSkills
          : Object.values(rawSkills).flat();
        setSkills(skillsArr);

        if (sfData.aiSkillAnalysis) {
          setAiAnalysis(sfData.aiSkillAnalysis);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        setMessage({ type: "error", text: "Failed to load profile data." });
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "Name cannot be empty." });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      // Update basic profile
      await updateProfile({
        name: name.trim(),
        targetRole,
      });

      // Also ensure targetRole syncs with skillforge-data
      await updateSkillForgeData({
        targetRole,
      });

      // Notify Navbar & other components
      window.dispatchEvent(new CustomEvent("skillforge-refresh"));

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage({ type: "error", text: error.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state" style={{ minHeight: "50vh" }}>
          <div className="spinner"></div>
          <p>Loading your profile details...</p>
        </div>
      </div>
    );
  }

  const initialLetter = (name || profile?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      {/* Header Banner */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-role-badge">
            👤 USER ACCOUNT
          </div>
          <h1>My Profile & Settings</h1>
          <p className="dashboard-header-sub">
            Manage your personal information, career target role, and view verified resume skills.
          </p>
        </div>
      </div>

      {/* Status Banners */}
      {message.text && (
        <div className={`status-banner ${message.type}`} style={{ marginBottom: "24px" }}>
          <span>{message.type === "error" ? "❌" : "✅"}</span>
          <p>{message.text}</p>
        </div>
      )}

      {/* Two Column Profile Layout */}
      <div className="profile-grid">
        {/* Left Column: Account Details Form */}
        <div className="dashboard-card">
          <div className="dashboard-card-title-row">
            <div>
              <h2>Account Details</h2>
              <p className="dashboard-card-sub">Update profile information and target role</p>
            </div>
            <span className="badge-saved">AUTHENTICATED</span>
          </div>

          <div className="profile-avatar-header">
            <div className="profile-large-avatar">{initialLetter}</div>
            <div>
              <h3 className="profile-user-name">{name || "User"}</h3>
              <p className="profile-user-email">{profile?.email || ""}</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label htmlFor="prof-name" className="config-label" style={{ display: "block", marginBottom: "6px" }}>
                FULL NAME
              </label>
              <input
                id="prof-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="interview-textarea"
                style={{ height: "auto", minHeight: "44px" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label htmlFor="prof-email" className="config-label" style={{ display: "block", marginBottom: "6px" }}>
                EMAIL ADDRESS <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "normal" }}>(Read-Only)</span>
              </label>
              <input
                id="prof-email"
                type="email"
                value={profile?.email || ""}
                disabled
                className="interview-textarea"
                style={{
                  height: "auto",
                  minHeight: "44px",
                  background: "var(--nb-surface-alt)",
                  color: "#64748b",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "28px" }}>
              <label htmlFor="prof-role" className="config-label" style={{ display: "block", marginBottom: "6px" }}>
                TARGET CAREER ROLE
              </label>
              <select
                id="prof-role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="role-selector-select"
                style={{ width: "100%", height: "46px" }}
              >
                {supportedRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
              style={{ width: "100%", padding: "12px", fontSize: "1rem" }}
            >
              {saving ? "✨ Saving Changes..." : "💾 Save Profile Changes"}
            </button>
          </form>
        </div>

        {/* Right Column: Career Readiness & Verified Skills */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Career Readiness Card */}
          <StatCard
            title="Career Readiness Status"
            value={aiAnalysis?.skillMatchPercentage !== undefined ? `${aiAnalysis.skillMatchPercentage}%` : "—"}
            subtitle={aiAnalysis?.careerReadiness ? `${aiAnalysis.careerReadiness} Level` : "Developing Level"}
            badgeText={targetRole}
            badgeVariant="mint"
            variant="yellow"
            icon="🎯"
          />

          {/* Verified Skills Card */}
          <div className="dashboard-card">
            <div className="dashboard-card-title-row">
              <div>
                <h2>Verified Resume Skills ({skills.length})</h2>
                <p className="dashboard-card-sub">Extracted skills from your profile resume</p>
              </div>
              <a href="/resume" className="dashboard-card-link">
                Manage Resume →
              </a>
            </div>

            {skills.length > 0 ? (
              <div className="skill-list" style={{ marginTop: "12px" }}>
                {skills.map((skill) => (
                  <SkillCard key={skill} skill={skill} status="verified" variant="pill" />
                ))}
              </div>
            ) : (
              <div className="empty-state-card" style={{ border: "var(--nb-border-dashed)", padding: "20px" }}>
                <span className="empty-icon">📋</span>
                <p style={{ color: "#64748b", fontSize: "0.9rem", margin: 0 }}>
                  No skills detected yet. Upload a resume to automatically verify and track your technical competencies.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
