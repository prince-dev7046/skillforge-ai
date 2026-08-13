import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile, getSkillForgeData } from "../services/api";
import StatCard from "../components/StatCard";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [skillForgeData, setSkillForgeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profile, sfData] = await Promise.all([
          getProfile(),
          getSkillForgeData(),
        ]);

        setUser(profile);
        setSkillForgeData(sfData);
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state" style={{ minHeight: "60vh" }}>
          <div className="spinner"></div>
          <p>Loading your career analytics dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic stats
  const resumeSkills = skillForgeData?.resumeSkills || {};
  const skillsArray = Array.isArray(resumeSkills)
    ? resumeSkills
    : Object.values(resumeSkills).flat();
  const totalSkillsCount = skillsArray.length;

  const aiAnalysis = skillForgeData?.aiSkillAnalysis || {};
  const skillGap = skillForgeData?.skillGap || {};
  const targetRole = skillForgeData?.targetRole || user?.targetRole || "Full Stack Developer";

  // Career Readiness Score
  let readinessScore = 0;
  let readinessLabel = "Beginner";

  if (aiAnalysis?.skillMatchPercentage !== undefined) {
    readinessScore = aiAnalysis.skillMatchPercentage;
    readinessLabel = aiAnalysis.careerReadiness || "Developing";
  } else if (skillGap?.matchedSkills && skillGap?.missingSkills) {
    const total = skillGap.matchedSkills.length + skillGap.missingSkills.length;
    readinessScore = total > 0 ? Math.round((skillGap.matchedSkills.length / total) * 100) : 0;
    readinessLabel = readinessScore >= 80 ? "Job Ready" : readinessScore >= 50 ? "Intermediate" : "Beginner";
  } else if (totalSkillsCount > 0) {
    readinessScore = Math.min(100, totalSkillsCount * 10);
    readinessLabel = readinessScore >= 70 ? "Intermediate" : "Developing";
  }

  // Roadmap calculations
  const roadmapProgress = skillForgeData?.roadmapProgress || {};
  const roadmapItems = aiAnalysis?.roadmap || [];
  const roadmapTotal = roadmapItems.length || Object.keys(roadmapProgress).length || (skillGap?.missingSkills?.length || 0);

  const completedModules = Object.values(roadmapProgress).filter(
    (status) => status === "Completed"
  ).length;

  const roadmapPercent =
    roadmapTotal > 0 ? Math.round((completedModules / roadmapTotal) * 100) : 0;

  // Projects calculations
  const projectsList = skillForgeData?.projects || [];
  const totalProjects = projectsList.length;
  const completedProjects = projectsList.filter(
    (p) => p.status === "Completed"
  ).length;

  // Find Today's Goal: Next in-progress or not-started item
  let todaysGoal = null;

  if (roadmapItems.length > 0) {
    const inProgressItem = roadmapItems.find(
      (item) => roadmapProgress[item.skill] === "In Progress"
    );
    const notStartedItem = roadmapItems.find(
      (item) => !roadmapProgress[item.skill] || roadmapProgress[item.skill] === "Not Started"
    );

    todaysGoal = inProgressItem || notStartedItem;
  }

  // Top skills for overview
  const topSkills = skillsArray.slice(0, 5);

  return (
    <div className="dashboard">
      {/* Header Banner */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-role-badge">
            🎯 TARGET CAREER: <strong>{targetRole}</strong>
          </div>
          <h1>Welcome back{user?.name ? `, ${user.name}` : ""} 👋</h1>
          <p className="dashboard-header-sub">
            Real-time career readiness analytics & personalized skill milestones.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="secondary-btn"
            onClick={() => navigate("/resume")}
          >
            📄 Update Resume
          </button>
          <button
            className="primary-btn"
            onClick={() => navigate("/roadmap")}
          >
            🗺️ View Roadmap
          </button>
        </div>
      </div>

      {/* 4 Reusable Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Career Readiness"
          value={`${readinessScore}%`}
          subtitle="Skill Benchmark"
          badgeText={readinessLabel}
          badgeVariant={readinessScore >= 70 ? "mint" : "orange"}
          variant="yellow"
          icon="🎯"
        />

        <StatCard
          title="Verified Skills"
          value={totalSkillsCount}
          subtitle={skillsArray.length > 0 ? `${skillsArray.slice(0, 2).join(", ")}...` : "No skills uploaded"}
          badgeText="Verified"
          badgeVariant="default"
          variant="violet"
          icon="Verified"
          icon="⚡"
        />

        <StatCard
          title="Roadmap Execution"
          value={`${roadmapPercent}%`}
          subtitle={`${completedModules} of ${roadmapTotal || 0} modules done`}
          badgeText={`${completedModules}/${roadmapTotal || 0}`}
          badgeVariant="mint"
          variant="mint"
          icon="🗺️"
        />

        <StatCard
          title="Portfolio Projects"
          value={totalProjects}
          subtitle={`${completedProjects} completed`}
          badgeText={`${completedProjects} Done`}
          badgeVariant="default"
          variant="cyan"
          icon="💡"
        />
      </div>

      {/* Two Column Grid */}
      <div className="dashboard-grid">
        {/* Skill Overview Card */}
        <div className="dashboard-card">
          <div className="dashboard-card-title-row">
            <div>
              <h2>Skill Profile Overview</h2>
              <p className="dashboard-card-sub">Top extracted technical competencies</p>
            </div>
            <Link to="/skill-gap" className="dashboard-card-link">
              Gap Analysis →
            </Link>
          </div>

          {topSkills.length > 0 ? (
            <div className="dashboard-skills-list">
              {topSkills.map((skill, idx) => {
                const isCompleted = roadmapProgress[skill] === "Completed";
                const percent = isCompleted ? 100 : Math.max(60, 95 - idx * 8);

                return (
                  <div className="skill" key={skill}>
                    <div className="skill-info-row">
                      <span className="skill-name">{skill}</span>
                      <span className="skill-percent">{percent}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-card" style={{ border: "var(--nb-border-dashed)" }}>
              <span className="empty-icon">📄</span>
              <h3>No Skills Detected Yet</h3>
              <p>Upload your PDF resume to extract skills and visualize your levels.</p>
              <button
                className="primary-btn"
                style={{ marginTop: "16px" }}
                onClick={() => navigate("/resume")}
              >
                Upload Resume
              </button>
            </div>
          )}
        </div>

        {/* Today's Learning Focus Card */}
        <div className="dashboard-card dashboard-focus-card">
          <div className="dashboard-card-title-row">
            <div>
              <h2>Today's Learning Focus</h2>
              <p className="dashboard-card-sub">Recommended next action milestone</p>
            </div>
            <span className="dashboard-focus-badge">🔥 FOCUS</span>
          </div>

          {todaysGoal ? (
            <div className="dashboard-focus-body">
              <div className="goal-banner">
                <span className="goal-status-tag">
                  {roadmapProgress[todaysGoal.skill] === "In Progress" ? "In Progress" : "Next Milestone"}
                </span>
                <h3 className="goal-skill-title">{todaysGoal.skill}</h3>
              </div>

              <p className="goal-description">
                {todaysGoal.reason || `Master ${todaysGoal.skill} to advance your career readiness.`}
              </p>

              <div className="goal-meter-box">
                <div className="goal-meter-header">
                  <span>Milestone Completion</span>
                  <strong>{roadmapProgress[todaysGoal.skill] === "In Progress" ? "50%" : "0%"}</strong>
                </div>
                <div className="goal-progress">
                  <div
                    className="goal-progress-fill"
                    style={{
                      width: roadmapProgress[todaysGoal.skill] === "In Progress" ? "50%" : "10%",
                    }}
                  ></div>
                </div>
              </div>

              <div className="goal-footer">
                <span>⏱️ Time Est: {todaysGoal.duration || "1 week"}</span>
              </div>

              <button
                className="primary-btn"
                style={{ width: "100%", marginTop: "20px" }}
                onClick={() => navigate("/roadmap")}
              >
                Continue Learning →
              </button>
            </div>
          ) : totalSkillsCount === 0 ? (
            <div className="dashboard-focus-body">
              <div className="goal-banner">
                <span className="goal-status-tag">Step 1</span>
                <h3 className="goal-skill-title">Upload Your Resume</h3>
              </div>
              <p className="goal-description">
                Begin your journey by uploading your resume to extract verified skills and detect critical gaps.
              </p>
              <button
                className="primary-btn"
                style={{ width: "100%", marginTop: "20px" }}
                onClick={() => navigate("/resume")}
              >
                Go to Resume Analyzer →
              </button>
            </div>
          ) : (
            <div className="dashboard-focus-body">
              <div className="goal-banner">
                <span className="goal-status-tag">Step 2</span>
                <h3 className="goal-skill-title">Generate Personal Roadmap</h3>
              </div>
              <p className="goal-description">
                Analyze skill gaps against {targetRole} requirements to unlock customized milestone modules.
              </p>
              <button
                className="primary-btn"
                style={{ width: "100%", marginTop: "20px" }}
                onClick={() => navigate("/skill-gap")}
              >
                Analyze Skill Gaps →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;