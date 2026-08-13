import { useState, useEffect } from "react";
import { getSkillForgeData, updateSkillForgeData, generateProjectsAI } from "../services/api";
import StatCard from "../components/StatCard";
import SkillCard from "../components/SkillCard";

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
      {/* Header Banner */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-role-badge">
            🎯 TARGET CAREER: <strong>{targetRole}</strong>
          </div>
          <h1>AI Portfolio Projects</h1>
          <p className="dashboard-header-sub">
            Build real-world, industry-standard projects customized to bridge your verified skill gaps.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="primary-btn"
            onClick={handleGenerateProjects}
            disabled={generating}
          >
            {generating ? "✨ Generating Projects..." : "✨ Refresh AI Projects"}
          </button>
        </div>
      </div>

      {/* Status Banners */}
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

      {/* Overview Stat Cards Grid */}
      {projects.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: "28px" }}>
          <StatCard
            title="Total Projects"
            value={projects.length}
            subtitle="Curated Portfolio Specs"
            variant="yellow"
            icon="💡"
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            subtitle="Active Development"
            badgeText="Active"
            badgeVariant="orange"
            variant="orange"
            icon="🔄"
          />
          <StatCard
            title="Completed"
            value={completedCount}
            subtitle="Portfolio Verified"
            badgeText={`${completedCount}/${projects.length}`}
            badgeVariant="mint"
            variant="mint"
            icon="✅"
          />
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="empty-state-card" style={{ border: "var(--nb-border-dashed)", margin: "40px auto", maxWidth: "600px" }}>
          <span className="empty-icon">💡</span>
          <h3>No Projects Generated Yet</h3>
          <p>
            Click the button below to generate customized, portfolio-ready project specifications aligned with {targetRole}.
          </p>
          <button
            className="primary-btn"
            style={{ marginTop: "18px" }}
            onClick={handleGenerateProjects}
            disabled={generating}
          >
            {generating ? "✨ Generating..." : "⚡ Generate AI Projects Now"}
          </button>
        </div>
      ) : (
        /* Projects Grid */
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
                className={`project-card ${isCompleted ? "project-completed" : isInProgress ? "project-in-progress" : ""}`}
              >
                <div className="project-card-header">
                  <div className="project-tags-row">
                    <span
                      className={`badge-difficulty ${
                        (project.difficulty || "intermediate").toLowerCase()
                      }`}
                    >
                      {project.difficulty || "Intermediate"}
                    </span>
                    <span className="project-duration-tag">
                      ⏱️ {project.estimatedDuration || "2 weeks"}
                    </span>
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

                <div className="project-card-body">
                  <h2 className="project-title">{project.title || `Project ${pIdx + 1}`}</h2>

                  <p className="project-description">
                    {project.description || "Portfolio project to strengthen technical skills."}
                  </p>

                  {project.whyThisProject && (
                    <div className="project-why">
                      <strong>🎯 Career Impact:</strong>
                      <p>{project.whyThisProject}</p>
                    </div>
                  )}

                  {featuresList.length > 0 && (
                    <div className="project-features">
                      <h4>✨ Core Features to Implement</h4>
                      <ul className="project-features-list">
                        {featuresList.map((feat, idx) => (
                          <li key={idx}>{feat}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {techStackList.length > 0 && (
                    <div className="project-tech-box">
                      <h4>🛠️ Suggested Tech Stack</h4>
                      <div className="skill-list" style={{ marginTop: "6px" }}>
                        {techStackList.map((tech) => (
                          <SkillCard key={tech} skill={tech} status="verified" variant="pill" />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="project-actions">
                    {isCompleted ? (
                      <button
                        className="btn-completed"
                        onClick={() => handleStatusChange(projectId, "In Progress")}
                        style={{ cursor: "pointer" }}
                      >
                        ✅ Completed (Click to Reopen)
                      </button>
                    ) : isInProgress ? (
                      <div className="project-action-group">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Projects;