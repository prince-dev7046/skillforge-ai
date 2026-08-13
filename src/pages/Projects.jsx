import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { api } from "../services/api";

function Projects() {
  const { skillData, refreshData } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const projects = skillData?.projects || [];
  const targetRole = skillData?.targetRole || "";

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError("");
      await api.generateProjects();
      await refreshData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate project recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (projectId, status) => {
    try {
      await api.updateProjectStatus(projectId, status);
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to update project status.");
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Are you sure you want to remove this project?")) return;
    try {
      await api.deleteProject(projectId);
      await refreshData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete project.");
    }
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Project Recommendations</h1>
          <p>
            Get personalized hands-on project ideas powered by Gemini AI, targeted at building your missing career skills.
          </p>
        </div>
      </div>

      {!targetRole ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
          <h3>🎯 Target Role Required</h3>
          <p>Select your Target Role in the Skill Gap page before receiving project ideas.</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
          <h2>✨ Personalized AI Recommendations</h2>
          <p style={{ margin: "var(--space-sm) 0 var(--space-lg)" }}>
            Gemini AI will analyze your skills against the requirements for <strong>{targetRole}</strong> and suggest projects to build.
          </p>
          <button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating Projects..." : "✨ Generate Project Ideas"}
          </button>
          {error && <p style={{ color: "var(--neo-pink)", marginTop: "var(--space-md)" }}>❌ {error}</p>}
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-lg)", flexWrap: "wrap", gap: "var(--space-sm)" }}>
            <h2>Custom Project Roadmap</h2>
            <button onClick={handleGenerate} disabled={loading} style={{ backgroundColor: "var(--neo-cyan)" }}>
              {loading ? "Regenerating..." : "🔄 Regenerate Recommendations"}
            </button>
          </div>

          {error && <p style={{ color: "var(--neo-pink)", marginBottom: "var(--space-md)" }}>❌ {error}</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="dashboard-card"
                style={{
                  borderLeft:
                    proj.status === "Completed"
                      ? "8px solid var(--neo-green)"
                      : proj.status === "In Progress"
                      ? "8px solid var(--neo-cyan)"
                      : "8px solid var(--neo-orange)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-md)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-xs)" }}>
                  <div>
                    <h3 style={{ fontSize: "20px", margin: 0 }}>{proj.title}</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
                      ⏱️ Duration: <strong>{proj.duration}</strong> | 📊 Difficulty: <strong>{proj.difficulty}</strong>
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                    <button
                      onClick={() => handleDelete(proj._id)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        backgroundColor: "var(--neo-pink)",
                        color: "white",
                        boxShadow: "1px 1px 0px var(--border-color)",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p>{proj.description}</p>

                <div style={{ padding: "var(--space-sm)", backgroundColor: "var(--surface-cyan)", border: "var(--border-sm)", borderRadius: "var(--radius-xs)" }}>
                  <strong>🤖 Relevance:</strong> {proj.whyProject}
                </div>

                <div>
                  <strong>🛠️ Required Skills to Practice:</strong>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2xs)", marginTop: "var(--space-2xs)" }}>
                    {(proj.requiredSkills || []).map((s) => (
                      <span key={s} className="skill-tag" style={{ fontSize: "11px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {proj.features && (
                  <div>
                    <strong>📋 Proposed Key Features:</strong>
                    <div style={{ whiteSpace: "pre-line", fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", paddingLeft: "10px" }}>
                      {proj.features}
                    </div>
                  </div>
                )}

                {proj.suggestedStack && (
                  <div>
                    <strong>📦 Suggested Technology Stack:</strong>
                    <p style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--text-main)", marginTop: "2px" }}>
                      {proj.suggestedStack}
                    </p>
                  </div>
                )}

                <div style={{ borderTop: "var(--border-sm)", paddingTop: "var(--space-md)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-sm)" }}>
                  <span>Status: <strong style={{ textTransform: "uppercase" }}>{proj.status}</strong></span>
                  
                  <div style={{ display: "flex", gap: "var(--space-sm)" }}>
                    {proj.status === "Not Started" && (
                      <button onClick={() => handleStatusChange(proj._id, "In Progress")}>
                        Start Project
                      </button>
                    )}

                    {proj.status === "In Progress" && (
                      <>
                        <button onClick={() => handleStatusChange(proj._id, "Completed")} style={{ backgroundColor: "var(--neo-green)" }}>
                          Mark Completed
                        </button>
                        <button onClick={() => handleStatusChange(proj._id, "Not Started")} style={{ backgroundColor: "#94A3B8" }}>
                          Reset Status
                        </button>
                      </>
                    )}

                    {proj.status === "Completed" && (
                      <button disabled style={{ backgroundColor: "#CBD5E1" }}>
                        🎉 Project Mastered!
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Projects;