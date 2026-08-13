import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { api } from "../services/api";

function Progress() {
  const { user } = useContext(UserContext);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");
        const data = await api.getProgressAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Progress fetch error:", err);
        setError(err.message || "Failed to load progress analytics.");
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-2xl)" }}>
        <div className="loader" style={{ display: "inline-block", marginBottom: "var(--space-md)" }}></div>
        <p style={{ fontWeight: "700" }}>Loading progress dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-error" style={{ margin: "var(--space-xl)", color: "var(--neo-pink)", fontWeight: "800" }}>
        ❌ {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="dashboard-card" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
        <h3>📊 Analytics Unavailable</h3>
        <p>Could not compile progress analytics. Please check your data settings.</p>
      </div>
    );
  }

  // Circular progress dimensions for Roadmap ring
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const roadmapPct = analytics.roadmap?.completionRate || 0;
  const strokeDashoffset = circumference - (roadmapPct / 100) * circumference;

  return (
    <div className="progress-page">
      <div className="page-header">
        <div>
          <h1>Progress Analytics</h1>
          <p>
            Track your skills development, mock interview scores, and curriculum completion metrics in real-time.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "var(--space-lg)", padding: "var(--space-md)", border: "var(--border-md)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--surface-cyan)", boxShadow: "var(--shadow-sm)" }}>
        <h3>🎯 Target Profile Path: <strong>{analytics.targetRole}</strong></h3>
      </div>

      {/* Analytics Core Dashboard Cards */}
      <div className="dashboard-grid">
        {/* Left Card: Career Readiness Gauge */}
        <div className="dashboard-card" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minWidth: "260px" }}>
          <h2>Career Readiness</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "var(--space-md)" }}>
            Current Level: <strong>{analytics.careerReadiness}</strong>
          </p>

          {/* SVG Gauge */}
          <div style={{ position: "relative", width: "160px", height: "160px", margin: "var(--space-md) 0" }}>
            <svg width="100%" height="100%" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth={strokeWidth}
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="var(--neo-yellow)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (analytics.skillMatchPercentage / 100) * circumference}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "28px", fontWeight: "800" }}>{analytics.skillMatchPercentage}%</span>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>Match</span>
            </div>
          </div>

          <div style={{ padding: "var(--space-sm)", border: "var(--border-sm)", borderRadius: "var(--radius-xs)", width: "100%", backgroundColor: "var(--bg-app)", fontSize: "13px" }}>
            💡 Your skill profile matches <strong>{analytics.skillMatchPercentage}%</strong> of standard guidelines.
          </div>
        </div>

        {/* Right Card: Curriculum Roadmap Ring */}
        <div className="dashboard-card" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minWidth: "260px" }}>
          <h2>Curriculum Progress</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "var(--space-md)" }}>
            Completed modules vs total modules.
          </p>

          {/* SVG Ring */}
          <div style={{ position: "relative", width: "160px", height: "160px", margin: "var(--space-md) 0" }}>
            <svg width="100%" height="100%" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth={strokeWidth}
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="var(--neo-green)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "28px", fontWeight: "800" }}>{roadmapPct}%</span>
              <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>Complete</span>
            </div>
          </div>

          <div style={{ padding: "var(--space-sm)", border: "var(--border-sm)", borderRadius: "var(--radius-xs)", width: "100%", backgroundColor: "var(--bg-app)", fontSize: "13px" }}>
            📝 <strong>{analytics.roadmap?.completed}</strong> of <strong>{analytics.roadmap?.total}</strong> modules fully mastered.
          </div>
        </div>
      </div>

      {/* Grid of Sub-sections (Projects & Interviews) */}
      <div className="dashboard-grid" style={{ marginTop: "var(--space-lg)" }}>
        {/* Projects Completion Graph */}
        <div className="dashboard-card" style={{ flex: 1, minWidth: "260px" }}>
          <h2>Project Metrics</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "var(--space-md)" }}>
            Recommendations started vs completed.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)", marginTop: "var(--space-md)" }}>
            {/* Completed */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700", marginBottom: "2px" }}>
                <span>Completed</span>
                <span>{analytics.projects?.completed}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${analytics.projects?.total > 0 ? (analytics.projects.completed / analytics.projects.total) * 100 : 0}%`,
                    backgroundColor: "var(--neo-green)",
                  }}
                ></div>
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "700", marginBottom: "2px" }}>
                <span>Active (In Progress)</span>
                <span>{analytics.projects?.inProgress}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${analytics.projects?.total > 0 ? (analytics.projects.inProgress / analytics.projects.total) * 100 : 0}%`,
                    backgroundColor: "var(--neo-cyan)",
                  }}
                ></div>
              </div>
            </div>

            {/* Total */}
            <div style={{ marginTop: "var(--space-sm)", padding: "var(--space-sm)", border: "var(--border-sm)", borderRadius: "var(--radius-xs)", backgroundColor: "var(--surface-yellow)", fontSize: "13px", textAlign: "center" }}>
              📋 Total recommendations tracked: <strong>{analytics.projects?.total}</strong>
            </div>
          </div>
        </div>

        {/* Mock Interview Scores */}
        <div className="dashboard-card" style={{ flex: 1, minWidth: "260px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2>Interview Performance</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "var(--space-md)" }}>
              Analytics parsed from mock evaluations.
            </p>

            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", margin: "var(--space-md) 0" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)" }}>Q&A Answered</span>
                <h3 style={{ fontSize: "36px", margin: 0 }}>{analytics.interviews?.questionsAnswered}</h3>
              </div>

              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: "var(--text-muted)" }}>Average Score</span>
                <div
                  style={{
                    display: "inline-block",
                    padding: "var(--space-xs) var(--space-md)",
                    backgroundColor: "var(--neo-orange)",
                    border: "var(--border-sm)",
                    borderRadius: "var(--radius-xs)",
                    fontSize: "24px",
                    fontWeight: "800",
                    marginTop: "var(--space-2xs)",
                  }}
                >
                  {analytics.interviews?.averageScore} / 10
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "var(--border-sm)", paddingTop: "var(--space-sm)", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
            🏆 Mock history logs keep track of strengths and model answers.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Progress;