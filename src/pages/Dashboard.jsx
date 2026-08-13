import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import SkillCard from "../components/SkillCard";
import ProgressCard from "../components/ProgressCard";

function Dashboard() {
  const navigate = useNavigate();
  const { user, skillData } = useContext(UserContext);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoadingAnalytics(true);
        const data = await api.getProgressAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load progress analytics:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    }
    if (user) {
      fetchAnalytics();
    }
  }, [user, skillData]);

  // Skill calculation
  const resumeSkills = skillData?.resumeSkills || {};
  const flatSkillsList = Object.values(resumeSkills).flat();
  const totalSkillsCount = flatSkillsList.length;

  // Roadmap calculation
  const roadmap = skillData?.roadmap || [];
  const totalRoadmapCount = roadmap.length;
  const completedRoadmapCount = roadmap.filter((r) => r.status === "Completed").length;
  const roadmapProgressPercent = totalRoadmapCount > 0 
    ? Math.round((completedRoadmapCount / totalRoadmapCount) * 100)
    : 0;

  // Projects calculation
  const projects = skillData?.projects || [];
  const totalProjectsCount = projects.length;
  const completedProjectsCount = projects.filter((p) => p.status === "Completed").length;

  // Next roadmap goal
  const nextGoalItem = roadmap.find((r) => r.status !== "Completed");

  return (
    <div className="dashboard">
      {/* Hero / Header Section */}
      <div className="dashboard-hero neo-card card-yellow">
        <div className="hero-content">
          <div className="hero-text">
            <span className="badge badge-pink">Personalized Dashboard</span>
            <h1>
              Welcome back{user ? `, ${user.name}` : ""} 👋
            </h1>
            <p>
              Here's your real-time career readiness & skill growth progress.
            </p>
          </div>

          <button className="btn btn-primary hero-btn">
            🚀 Generate Roadmap
          </button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="stats-grid">
        <StatCard
          title="Career Readiness"
          value="74%"
          subtitle="+8% this month"
          variant="green"
          icon="📈"
        />

        <StatCard
          title="Skills"
          value="12"
          subtitle="8 mastered"
          variant="cyan"
          icon="⚡"
        />

        <StatCard
          title="Roadmap Progress"
          value="67%"
          subtitle="8 of 12 modules"
          variant="yellow"
          icon="🗺️"
        />

        <StatCard
          title="Projects"
          value="4"
          subtitle="2 completed"
          variant="pink"
          icon="💡"
        />
      </div>

      {/* Main Grid: Skills & Today's Goal */}
      <div className="dashboard-grid">
        <div className="dashboard-card neo-card">
          <div className="card-header-row">
            <h2>Skill Overview</h2>
            <span className="badge badge-cyan">Core Tech</span>
          </div>

          <div className="skills-list-container">
            <SkillCard name="JavaScript" percentage={90} color="var(--neo-yellow)" />
            <SkillCard name="React" percentage={80} color="var(--neo-cyan)" />
            <SkillCard name="Node.js" percentage={35} color="var(--neo-pink)" />
            <SkillCard name="MongoDB" percentage={70} color="var(--neo-green)" />
          </div>
        </div>

        <ProgressCard
          title="Today's Goal"
          goalTitle="Complete Express.js REST API"
          percentage={65}
          timeInfo="2 hours remaining"
        />
      </div>
    </div>
  );
}

export default Dashboard;