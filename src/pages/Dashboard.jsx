import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile, getSkillForgeData } from "../services/api";

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
      <div className="dashboard-header">
        <div>
          <h1>Welcome back{user?.name ? `, ${user.name}` : ""} 👋</h1>
          <p>
            Targeting: <strong>{targetRole}</strong> — Here is your real-time career readiness overview.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
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

      {/* 4 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <p>Career Readiness</p>
          <h2>{readinessScore}%</h2>
          <span style={{ color: readinessScore >= 70 ? "#10b981" : "#f59e0b" }}>
            {readinessLabel}
          </span>
        </div>

        <div className="stat-card">
          <p>Verified Skills</p>
          <h2>{totalSkillsCount}</h2>
          <span>{skillsArray.length > 0 ? `${skillsArray.slice(0, 2).join(", ")}...` : "None uploaded"}</span>
        </div>

        <div className="stat-card">
          <p>Roadmap Progress</p>
          <h2>{roadmapPercent}%</h2>
          <span>{completedModules} of {roadmapTotal || 0} modules done</span>
        </div>

        <div className="stat-card">
          <p>Portfolio Projects</p>
          <h2>{totalProjects}</h2>
          <span>{completedProjects} completed</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Skill Overview Card */}
        <div className="dashboard-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>Skill Profile Overview</h2>
            <Link to="/skill-gap" style={{ fontSize: "14px", color: "#6366f1", fontWeight: "600" }}>
              Gap Analysis →
            </Link>
          </div>

          {topSkills.length > 0 ? (
            topSkills.map((skill, idx) => {
              // Estimate proficiency based on index or roadmap status
              const isCompleted = roadmapProgress[skill] === "Completed";
              const percent = isCompleted ? 100 : Math.max(60, 95 - idx * 8);

              return (
                <div className="skill" key={skill}>
                  <div>
                    <span style={{ fontWeight: "600" }}>{skill}</span>
                    <span style={{ color: "#6b7280" }}>{percent}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state-card" style={{ padding: "20px", margin: "10px 0" }}>
              <p>No skills detected yet. Upload your resume to visualize your skill levels.</p>
              <button
                className="primary-btn"
                style={{ marginTop: "12px" }}
                onClick={() => navigate("/resume")}
              >
                Upload Resume
              </button>
            </div>
          )}
        </div>

        {/* Today's Goal Card */}
        <div className="dashboard-card">
          <h2>Today's Learning Focus</h2>

          {todaysGoal ? (
            <div>
              <p className="goal-title">
                {roadmapProgress[todaysGoal.skill] === "In Progress" ? "In Progress: " : "Next Milestone: "}
                <strong>{todaysGoal.skill}</strong>
              </p>

              <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "15px" }}>
                {todaysGoal.reason || `Master ${todaysGoal.skill} to advance your career readiness.`}
              </p>

              <div className="goal-progress">
                <div
                  className="goal-progress-fill"
                  style={{
                    width: roadmapProgress[todaysGoal.skill] === "In Progress" ? "50%" : "10%",
                  }}
                ></div>
              </div>

              <div className="goal-footer" style={{ marginTop: "15px" }}>
                <span>
                  {roadmapProgress[todaysGoal.skill] === "In Progress" ? "50% in progress" : "Ready to begin"}
                </span>
                <span>⏱️ {todaysGoal.duration || "1 week"}</span>
              </div>

              <button
                className="primary-btn"
                style={{ width: "100%", marginTop: "20px" }}
                onClick={() => navigate("/roadmap")}
              >
                Continue Learning
              </button>
            </div>
          ) : totalSkillsCount === 0 ? (
            <div>
              <p className="goal-title">Step 1: Upload Your Resume</p>
              <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
                Begin your journey by uploading your resume to extract skills and find your skill gaps.
              </p>
              <button
                className="primary-btn"
                style={{ width: "100%" }}
                onClick={() => navigate("/resume")}
              >
                Go to Resume Analyzer
              </button>
            </div>
          ) : (
            <div>
              <p className="goal-title">Generate Your Personalized Roadmap</p>
              <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
                Analyze skill gaps against {targetRole} requirements to unlock customized milestones.
              </p>
              <button
                className="primary-btn"
                style={{ width: "100%" }}
                onClick={() => navigate("/skill-gap")}
              >
                Analyze Skill Gaps
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;