import { useState, useEffect } from "react";
import { getSkillForgeData, updateSkillForgeData, generateProjectsAI } from "../services/api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Helper to safely format array or string list
  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
  };

  // Load existing projects or generate initial recommendations
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getSkillForgeData();

        if (data) {
          const role = data.targetRole || "Full Stack Developer";
          setTargetRole(role);

          const rawSkills = data.resumeSkills || {};
          let skillsArr = [];
          if (Array.isArray(rawSkills)) {
            skillsArr = rawSkills;
          } else if (typeof rawSkills === "object" && rawSkills !== null) {
            skillsArr = Object.values(rawSkills).flat();
          }
          setSkills(skillsArr);

          if (Array.isArray(data.projects) && data.projects.length > 0) {
            setProjects(data.projects);
          } else {
            // Auto-load initial curated projects for the role
            const skillGaps = Array.isArray(data.skillGap?.missingSkills)
              ? data.skillGap.missingSkills
              : [];
            const learningPriorities = Array.isArray(data.aiSkillAnalysis?.learningPriorities)
              ? data.aiSkillAnalysis.learningPriorities
              : [];

            try {
              const res = await generateProjectsAI(
                skillsArr,
                role,
                skillGaps,
                learningPriorities
              );

              if (res && Array.isArray(res.projects) && res.projects.length > 0) {
                setProjects(res.projects);
                await updateSkillForgeData({ projects: res.projects });
              }
            } catch (genErr) {
              console.warn("Initial projects generation notice:", genErr);
            }
          }
        }
      } catch (err) {
        console.error("Error loading projects data:", err);
        setError("Could not load project recommendations from server.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleGenerateProjects = async () => {
    try {
      setGenerating(true);
      setError("");
      setSuccessMsg("");

      const sfData = await getSkillForgeData().catch(() => ({}));
      const role = targetRole || sfData?.targetRole || "Full Stack Developer";
      const skillGaps = Array.isArray(sfData?.skillGap?.missingSkills)
        ? sfData.skillGap.missingSkills
        : [];
      const learningPriorities = Array.isArray(sfData?.aiSkillAnalysis?.learningPriorities)
        ? sfData.aiSkillAnalysis.learningPriorities
        : [];

      const currentSkills =
        skills.length > 0
          ? skills
          : sfData?.resumeSkills
          ? Array.isArray(sfData.resumeSkills)
            ? sfData.resumeSkills
            : typeof sfData.resumeSkills === "object" && sfData.resumeSkills !== null
            ? Object.values(sfData.resumeSkills).flat()
            : []
          : [];

      const result = await generateProjectsAI(
        currentSkills,
        role,
        skillGaps,
        learningPriorities
      );

      if (result && Array.isArray(result.projects) && result.projects.length > 0) {
        setProjects(result.projects);

        // Persist to MongoDB
        await updateSkillForgeData({
          projects: result.projects,
        });

        setSuccessMsg(`Successfully generated ${result.projects.length} portfolio projects for ${role}!`);
        window.dispatchEvent(new CustomEvent("skillforge-refresh"));
      } else {
        throw new Error("Could not parse project recommendations.");
      }
    } catch (err) {
      console.error("Failed to generate projects:", err);
      setError(err.message || "Failed to generate AI project recommendations. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    const updated = projects.map((p) =>
      p.id === projectId ? { ...p, status: newStatus } : p
    );

    setProjects(updated);

    try {
      await updateSkillForgeData({
        projects: updated,
      });
      window.dispatchEvent(new CustomEvent("skillforge-refresh"));
    } catch (err) {
      console.error("Failed to save project status to MongoDB:", err);
    }
  };

  const completedCount = projects.filter((p) => p && p.status === "Completed").length;
  const inProgressCount = projects.filter((p) => p && p.status === "In Progress").length;

  if (loading) {
    return (
      <div className="projects-page">
        <div className="loading-state" style={{ minHeight: "50vh" }}>
          <div className="spinner"></div>
          <p>Loading your portfolio project recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
        <div>
          <h1>AI Portfolio Projects</h1>
          <p>
            Build real-world, industry-standard projects designed to bridge your skill gaps for <strong>{targetRole}</strong>.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={handleGenerateProjects}
          disabled={generating}
          style={{ padding: "12px 20px", fontSize: "15px" }}
        >
          {generating ? "✨ Generating AI Projects..." : "✨ Refresh / Generate Projects"}
        </button>
      </div>

      {error && (
        <div className="status-banner error" style={{ marginBottom: "20px" }}>
          <span>❌</span>
          <p>{error}</p>
        </div>
      )}

      {successMsg && (
        <div className="status-banner success" style={{ marginBottom: "20px" }}>
          <span>✅</span>
          <p>{successMsg}</p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="summary-grid" style={{ marginBottom: "25px" }}>
          <div className="summary-card">
            <span className="summary-icon">💡</span>
            <h3>{projects.length}</h3>
            <p>Total Projects</p>
          </div>
          <div className="summary-card">
            <span className="summary-icon">🔄</span>
            <h3>{inProgressCount}</h3>
            <p>In Progress</p>
          </div>
          <div className="summary-card">
            <span className="summary-icon">✅</span>
            <h3>{completedCount}</h3>
            <p>Completed</p>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">💡</span>
          <h3>No Projects Generated Yet</h3>
          <p>
            Click the "Refresh / Generate Projects" button to get customized, portfolio-ready project specifications aligned with your target career.
          </p>
          <button
            className="primary-btn"
            style={{ marginTop: "15px" }}
            onClick={handleGenerateProjects}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate AI Projects Now"}
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project, pIdx) => {
            if (!project) return null;

            const status = project.status || "Not Started";
            const isCompleted = status === "Completed";
            const isInProgress = status === "In Progress";
            const featuresList = toArray(project.features);
            const techStackList = toArray(project.suggestedTechStack);
            const projectId = project.id || `proj-${pIdx}`;

            return (
              <div
                key={projectId}
                className={`project-card ${isCompleted ? "project-completed" : ""}`}
              >
                <div className="project-header">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span
                        className={`badge-difficulty ${
                          (project.difficulty || "intermediate").toLowerCase()
                        }`}
                      >
                        {project.difficulty || "Intermediate"}
                      </span>
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>
                        ⏱️ {project.estimatedDuration || "2 weeks"}
                      </span>
                    </div>
                    <h2>{project.title || `Project ${pIdx + 1}`}</h2>
                  </div>

                  <span
                    className={`status-pill ${
                      isCompleted
                        ? "status-completed"
                        : isInProgress
                        ? "status-in-progress"
                        : "status-not-started"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <p className="project-description">{project.description || "Portfolio project to strengthen technical skills."}</p>

                {project.whyThisProject && (
                  <div className="project-why">
                    <strong>🎯 Career Impact:</strong>
                    <p>{project.whyThisProject}</p>
                  </div>
                )}

                {featuresList.length > 0 && (
                  <div className="project-features">
                    <strong>✨ Core Features to Implement:</strong>
                    <ul>
                      {featuresList.map((feat, idx) => (
                        <li key={idx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {techStackList.length > 0 && (
                  <div style={{ marginTop: "15px" }}>
                    <strong style={{ fontSize: "13px", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                      🛠️ Suggested Tech Stack:
                    </strong>
                    <div className="skill-list">
                      {techStackList.map((tech) => (
                        <span key={tech} className="skill-tag" style={{ background: "#eef2ff", color: "#4338ca", fontSize: "12px", padding: "4px 10px" }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="project-actions">
                  {isCompleted ? (
                    <button
                      className="btn-completed"
                      onClick={() => handleStatusChange(projectId, "In Progress")}
                    >
                      ✅ Completed (Click to Reopen)
                    </button>
                  ) : isInProgress ? (
                    <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                      <button
                        className="success-btn"
                        style={{ flex: 1 }}
                        onClick={() => handleStatusChange(projectId, "Completed")}
                      >
                        ✅ Mark as Completed
                      </button>
                      <button
                        className="secondary-btn"
                        onClick={() => handleStatusChange(projectId, "Not Started")}
                      >
                        Pause
                      </button>
                    </div>
                  ) : (
                    <button
                      className="primary-btn"
                      style={{ width: "100%" }}
                      onClick={() => handleStatusChange(projectId, "In Progress")}
                    >
                      🚀 Start Project
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Projects;