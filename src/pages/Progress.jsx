import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSkillForgeData, getProfile } from "../services/api";
import StatCard from "../components/StatCard";
import SkillCard from "../components/SkillCard";

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
      <div className="progress-analytics-page">
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
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-role-badge">
            🎯 TARGET CAREER: <strong>{targetRole}</strong>
          </div>
          <h1>Progress & Career Analytics</h1>
          <p className="dashboard-header-sub">
            Holistic view of your learning milestones, verified skill acquisition, and career readiness trajectory.
          </p>
        </div>

        <div className="dashboard-actions">
          <Link to="/roadmap" className="secondary-btn">
            🗺️ My Roadmap
          </Link>
          <Link to="/skill-gap" className="primary-btn">
            🎯 Skill Gap Analysis
          </Link>
        </div>
      </div>

      {/* Top Level 4 Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Overall Readiness"
          value={`${readinessScore}%`}
          subtitle="Career Benchmark"
          badgeText={`${readinessLevel} Level`}
          badgeVariant={readinessScore >= 75 ? "mint" : "yellow"}
          variant="yellow"
          icon="🎯"
        />

        <StatCard
          title="Roadmap Completion"
          value={`${roadmapPercent}%`}
          subtitle={`${completedRoadmap} of ${totalRoadmapItems} milestones`}
          badgeText={`${completedRoadmap}/${totalRoadmapItems}`}
          badgeVariant="mint"
          variant="mint"
          icon="🗺️"
        />

        <StatCard
          title="Projects Finished"
          value={`${completedProjects}/${projects.length || 0}`}
          subtitle={`${projectPercent}% portfolio completion`}
          badgeText={`${projectPercent}% Done`}
          badgeVariant="default"
          variant="violet"
          icon="💡"
        />

        <StatCard
          title="Avg Interview Score"
          value={avgInterviewScore ? `${avgInterviewScore}/10` : "—"}
          subtitle={`${totalInterviews} answers evaluated`}
          badgeText={totalInterviews > 0 ? `${totalInterviews} Tests` : "No Tests"}
          badgeVariant={avgInterviewScore >= 7 ? "mint" : "orange"}
          variant="cyan"
          icon="💼"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Detailed Milestone Progress Meters */}
        <div className="dashboard-card">
          <div className="dashboard-card-title-row">
            <div>
              <h2>Career Preparation Milestones</h2>
              <p className="dashboard-card-sub">Quantitative breakdown of core development tracks</p>
            </div>
            <span className="badge-saved">📊 LIVE DATA</span>
          </div>

          <div className="progress-milestones-list">
            {/* Metric 1: Skill Gap Reduction */}
            <div className="progress-milestone-item">
              <div className="milestone-label-row">
                <span className="milestone-name">🎯 Skill Match Benchmark</span>
                <span className="milestone-value-tag">{readinessScore}% Match</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${readinessScore}%`, backgroundColor: "var(--nb-yellow)" }}></div>
              </div>
            </div>

            {/* Metric 2: Roadmap Execution */}
            <div className="progress-milestone-item">
              <div className="milestone-label-row">
                <span className="milestone-name">🗺️ Learning Roadmap Execution</span>
                <span className="milestone-value-tag">{roadmapPercent}% Done</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${roadmapPercent}%`, backgroundColor: "var(--nb-mint)" }}></div>
              </div>
              <div className="milestone-breakdown-row">
                <span className="breakdown-pill breakdown-completed">✅ {completedRoadmap} Completed</span>
                <span className="breakdown-pill breakdown-progress">🔄 {inProgressRoadmap} In Progress</span>
                <span className="breakdown-pill breakdown-remaining">⏳ {Math.max(0, totalRoadmapItems - completedRoadmap - inProgressRoadmap)} Remaining</span>
              </div>
            </div>

            {/* Metric 3: Portfolio Projects */}
            <div className="progress-milestone-item">
              <div className="milestone-label-row">
                <span className="milestone-name">💡 Portfolio Projects Built</span>
                <span className="milestone-value-tag">{projectPercent}% Built</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${projectPercent}%`, backgroundColor: "var(--nb-violet)" }}></div>
              </div>
              <div className="milestone-breakdown-row">
                <span className="breakdown-pill breakdown-completed">✅ {completedProjects} Completed</span>
                <span className="breakdown-pill breakdown-progress">🔄 {inProgressProjects} In Progress</span>
              </div>
            </div>

            {/* Metric 4: Interview Competency */}
            <div className="progress-milestone-item">
              <div className="milestone-label-row">
                <span className="milestone-name">💼 Mock Interview Competency</span>
                <span className="milestone-value-tag">{avgInterviewScore ? `${Math.round(avgInterviewScore * 10)}%` : "0%"} Score</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: avgInterviewScore ? `${avgInterviewScore * 10}%` : "0%",
                    backgroundColor: "var(--nb-cyan)",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skill Domain Breakdown */}
        <div className="dashboard-card">
          <div className="dashboard-card-title-row">
            <div>
              <h2>Skills Breakdown</h2>
              <p className="dashboard-card-sub">Verified resume technical competencies</p>
            </div>
            <span className="badge-saved">{totalSkills} Total</span>
          </div>

          {totalSkills > 0 ? (
            <div className="progress-skills-breakdown">
              {Object.entries(categorized).map(([category, catSkills]) => {
                if (!catSkills || catSkills.length === 0) return null;
                return (
                  <div key={category} className="skills-category-group">
                    <div className="skills-category-header">
                      <span className="category-title">{category.replace(/([A-Z])/g, " $1")}</span>
                      <span className="category-count">{catSkills.length} skills</span>
                    </div>
                    <div className="skill-list" style={{ marginTop: "6px" }}>
                      {catSkills.map((s) => (
                        <SkillCard key={s} skill={s} status="verified" variant="pill" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-card" style={{ border: "var(--nb-border-dashed)" }}>
              <span className="empty-icon">📋</span>
              <h3>No Verified Skills Yet</h3>
              <p>Upload your resume to automatically categorize and track your skills.</p>
              <Link to="/resume" className="primary-btn" style={{ display: "inline-flex", marginTop: "14px" }}>
                Upload Resume →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Progress;