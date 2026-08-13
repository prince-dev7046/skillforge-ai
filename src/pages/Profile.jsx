import { useState, useEffect } from "react";
import { getProfile, updateProfile, getSkillForgeData, updateSkillForgeData } from "../services/api";

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
      <div className="loading-state" style={{ minHeight: "50vh" }}>
        <div className="spinner"></div>
        <p>Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="page-header">
        <div>
          <h1>My Profile & Career Settings</h1>
          <p>Manage your personal information, career target role, and view your verified skills.</p>
        </div>
      </div>

      {message.text && (
        <div className={`status-banner ${message.type}`} style={{ marginBottom: "20px" }}>
          <span>{message.type === "error" ? "❌" : "✅"}</span>
          <p>{message.text}</p>
        </div>
      )}

      <div className="profile-grid">
        {/* Left Column: Edit Form */}
        <div className="dashboard-card">
          <h2>Account Details</h2>

          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label htmlFor="prof-name" style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                Full Name
              </label>
              <input
                id="prof-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label htmlFor="prof-email" style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                Email Address <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "normal" }}>(Read-Only)</span>
              </label>
              <input
                id="prof-email"
                type="email"
                value={profile?.email || ""}
                disabled
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  background: "#f3f4f6",
                  color: "#6b7280",
                  fontSize: "15px",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "25px" }}>
              <label htmlFor="prof-role" style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                Target Career Role
              </label>
              <select
                id="prof-role"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "15px",
                  background: "white",
                }}
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
              style={{ width: "100%", padding: "12px", fontSize: "16px" }}
            >
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </form>
        </div>

        {/* Right Column: Career Readiness & Skills Badge */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Career Readiness Badge */}
          <div className="dashboard-card">
            <h2>Career Readiness Status</h2>

            <div style={{ display: "flex", alignItems: "center", gap: "15px", margin: "15px 0" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#e0e7ff",
                  color: "#4338ca",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                {aiAnalysis?.skillMatchPercentage !== undefined ? `${aiAnalysis.skillMatchPercentage}%` : "—"}
              </div>

              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "18px" }}>
                  {aiAnalysis?.careerReadiness || "Developing"} Level
                </h3>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "14px" }}>
                  Targeting {targetRole}
                </p>
              </div>
            </div>

            {aiAnalysis?.overallAssessment && (
              <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.6", marginTop: "10px" }}>
                {aiAnalysis.overallAssessment}
              </p>
            )}
          </div>

          {/* Verified Skills */}
          <div className="dashboard-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h2>Verified Resume Skills ({skills.length})</h2>
              <a href="/resume" style={{ fontSize: "13px", color: "#6366f1", fontWeight: "600" }}>
                Manage Resume →
              </a>
            </div>

            {skills.length > 0 ? (
              <div className="skill-list" style={{ marginTop: "10px" }}>
                {skills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                No skills detected yet. Upload a resume to automatically verify and track your technical competencies.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
