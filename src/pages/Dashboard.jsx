import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import SkillCard from "../components/SkillCard";
import ProgressCard from "../components/ProgressCard";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.log("No authentication token found");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/user/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch profile");
        }

        setUser(data);
      } catch (error) {
        console.error("Profile Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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