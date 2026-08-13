import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSkillForgeData, getProfile } from "../services/api";

function Progress() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [userData, sfData] = await Promise.all([
          getProfile(),
          getSkillForgeData(),
        ]);

        setUser(userData);
        setData(sfData);
      } catch (err) {
        console.error("Error loading progress analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div className="progress-page">
        <div className="loading-state" style={{ minHeight: "50vh" }}>
          <div className="spinner"></div>
          <p>Analyzing your comprehensive career trajectory data...</p>
        </div>
      </div>
    );
  }

  const targetRole = data?.targetRole || user?.targetRole || "Full Stack Developer";
  const resumeSkills = data?.resumeSkills || {};
  const skillsArray = Array.isArray(resumeSkills)
    ? resumeSkills
    : Object.values(resumeSkills).flat();
  const totalSkills = skillsArray.length;

  const aiAnalysis = data?.aiSkillAnalysis || {};
  const skillGap = data?.skillGap || {};

  // Career Readiness
  let readinessScore = 0;
  let readinessLevel = "Beginner";

  if (aiAnalysis?.skillMatchPercentage !== undefined) {
    readinessScore = aiAnalysis.skillMatchPercentage;
    readinessLevel = aiAnalysis.careerReadiness || "Developing";
  } else if (skillGap?.matchedSkills && skillGap?.missingSkills) {
    const total = skillGap.matchedSkills.length + skillGap.missingSkills.length;
    readinessScore = total > 0 ? Math.round((skillGap.matchedSkills.length / total) * 100) : 0;
    readinessLevel = readinessScore >= 80 ? "Job Ready" : readinessScore >= 50 ? "Intermediate" : "Beginner";
  } else if (totalSkills > 0) {
    readinessScore = Math.min(100, totalSkills * 10);
    readinessLevel = readinessScore >= 70 ? "Intermediate" : "Developing";
  }

  // Roadmap Metrics
  const roadmapProgress = data?.roadmapProgress || {};
  const roadmapItems = aiAnalysis?.roadmap || [];
  const totalRoadmapItems = roadmapItems.length || Object.keys(roadmapProgress).length || (skillGap?.missingSkills?.length || 0);

  const completedRoadmap = Object.values(roadmapProgress).filter(
    (s) => s === "Completed"
  ).length;

  const inProgressRoadmap = Object.values(roadmapProgress).filter(
    (s) => s === "In Progress"
  ).length;

  const roadmapPercent =
    totalRoadmapItems > 0 ? Math.round((completedRoadmap / totalRoadmapItems) * 100) : 0;

  // Projects Metrics
  const projects = data?.projects || [];
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const inProgressProjects = projects.filter((p) => p.status === "In Progress").length;
  const projectPercent =
    projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;

  // Interview Metrics
  const interviewHistory = data?.interviewHistory || [];
  const totalInterviews = interviewHistory.length;
  const avgInterviewScore =
    totalInterviews > 0
      ? (
          interviewHistory.reduce((acc, curr) => acc + (curr.score || 0), 0) /
          totalInterviews
        ).toFixed(1)
      : null;

  // Categorized Skills breakdown
  const categorized = typeof resumeSkills === "object" && !Array.isArray(resumeSkills)
    ? resumeSkills
    : { General: skillsArray };

  return (
    <div className="progress-analytics-page">
      <div className="page-header">
        <div>
          <h1>Progress & Career Analytics</h1>
          <p>
            Holistic view of your learning milestones, verified skill acquisition, and career readiness for <strong>{targetRole}</strong>.
          </p>
        </div>
      </div>

      {/* Top Level Big Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <p>Overall Readiness</p>
          <h2>{readinessScore}%</h2>
          <span style={{ color: readinessScore >= 75 ? "#10b981" : "#6366f1" }}>
            {readinessLevel} Level
          </span>
        </div>

        <div className="stat-card">
          <p>Roadmap Completion</p>
          <h2>{roadmapPercent}%</h2>
          <span>{completedRoadmap} of {totalRoadmapItems} completed</span>
        </div>

        <div className="stat-card">
          <p>Projects Finished</p>
          <h2>{completedProjects}/{projects.length || 0}</h2>
          <span>{projectPercent}% portfolio completion</span>
        </div>

        <div className="stat-card">
          <p>Avg Interview Score</p>
          <h2>{avgInterviewScore ? `${avgInterviewScore}/10` : "—"}</h2>
          <span>{totalInterviews} answers evaluated</span>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: "25px" }}>
        {/* Left Column: Detailed Progress Bars */}
        <div className="dashboard-card">
          <h2>Career Preparation Milestones</h2>

          {/* Metric 1: Skill Gap Reduction */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
              <span style={{ fontWeight: "600" }}>🎯 Skill Match Benchmark</span>
              <span>{readinessScore}% Match</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${readinessScore}%` }}></div>
            </div>
          </div>

          {/* Metric 2: Roadmap Execution */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
              <span style={{ fontWeight: "600" }}>🗺️ Learning Roadmap Completion</span>
              <span>{roadmapPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${roadmapPercent}%`, background: "#10b981" }}></div>
            </div>
            <div style={{ display: "flex", gap: "15px", marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
              <span>✅ {completedRoadmap} Completed</span>
              <span>🔄 {inProgressRoadmap} In Progress</span>
              <span>⏳ {Math.max(0, totalRoadmapItems - completedRoadmap - inProgressRoadmap)} Remaining</span>
            </div>
          </div>

          {/* Metric 3: Portfolio Projects */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
              <span style={{ fontWeight: "600" }}>💡 Portfolio Projects Built</span>
              <span>{projectPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${projectPercent}%`, background: "#8b5cf6" }}></div>
            </div>
            <div style={{ display: "flex", gap: "15px", marginTop: "8px", fontSize: "12px", color: "#6b7280" }}>
              <span>✅ {completedProjects} Completed</span>
              <span>🔄 {inProgressProjects} In Progress</span>
            </div>
          </div>

          {/* Metric 4: Interview Proficiency */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "14px" }}>
              <span style={{ fontWeight: "600" }}>💼 Mock Interview Competency</span>
              <span>{avgInterviewScore ? `${Math.round(avgInterviewScore * 10)}%` : "0%"}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: avgInterviewScore ? `${avgInterviewScore * 10}%` : "0%",
                  background: "#f59e0b",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Column: Skill Domain Breakdown */}
        <div className="dashboard-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>Skills Breakdown</h2>
            <span className="badge-saved">{totalSkills} Skills Total</span>
          </div>

          {totalSkills > 0 ? (
            Object.entries(categorized).map(([category, catSkills]) => {
              if (!catSkills || catSkills.length === 0) return null;
              return (
                <div key={category} style={{ marginBottom: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                    <span style={{ fontWeight: "600" }}>{category.replace(/([A-Z])/g, " $1")}</span>
                    <span style={{ color: "#6b7280" }}>{catSkills.length} skills</span>
                  </div>
                  <div className="skill-list" style={{ marginTop: "4px" }}>
                    {catSkills.map((s) => (
                      <span key={s} className="skill-tag" style={{ fontSize: "12px", padding: "4px 10px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-card" style={{ padding: "15px" }}>
              <p>No verified skills yet.</p>
              <Link to="/resume" className="primary-btn" style={{ display: "inline-block", marginTop: "10px" }}>
                Upload Resume
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Progress;