import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSkillForgeData, updateSkillForgeData } from "../services/api";
import StatCard from "../components/StatCard";
import ProgressCard from "../components/ProgressCard";

function Roadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [targetRole, setTargetRole] = useState("");
  const [progress, setProgress] = useState({});
  const [isAIPersonalized, setIsAIPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingSkill, setSavingSkill] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getSkillForgeData();

        if (data) {
          const role = data.targetRole || "Full Stack Developer";
          setTargetRole(role);

          const savedProg = data.roadmapProgress || {};
          setProgress(savedProg);

          const skillGap = data.skillGap || {};
          const aiAnalysis = data.aiSkillAnalysis || {};

          let roadmapData = [];

          // Priority 1: Gemini AI generated structured roadmap
          if (Array.isArray(aiAnalysis.roadmap) && aiAnalysis.roadmap.length > 0) {
            roadmapData = aiAnalysis.roadmap.map((item, index) => ({
              id: index + 1,
              skill: item.skill,
              priority: item.priority || index + 1,
              reason:
                item.reason || `Master ${item.skill} to advance toward your ${role} target.`,
              difficulty: item.difficulty || "Intermediate",
              duration: item.duration || "1-2 weeks",
              topics: Array.isArray(item.topics) ? item.topics : [],
              project:
                item.miniProject || `Build an end-to-end practical project using ${item.skill}`,
              prerequisites: Array.isArray(item.prerequisites) ? item.prerequisites : [],
            }));
            setIsAIPersonalized(true);
          }
          // Priority 2: Gemini AI learning priorities
          else if (
            Array.isArray(aiAnalysis.learningPriorities) &&
            aiAnalysis.learningPriorities.length > 0
          ) {
            roadmapData = aiAnalysis.learningPriorities.map((item, index) => {
              const skillInfo = getSkillInfo(item.skill);
              return {
                id: index + 1,
                skill: item.skill,
                priority: item.priority || "Medium",
                reason: item.reason || `Learn ${item.skill} to bridge critical career gaps.`,
                difficulty: skillInfo.difficulty,
                duration: skillInfo.duration,
                topics: skillInfo.topics,
                project: skillInfo.project,
                prerequisites: [],
              };
            });
            setIsAIPersonalized(true);
          }
          // Priority 3: Missing skills from rule-based or AI gap
          else {
            const missingSkills =
              skillGap.missingSkills ||
              (Array.isArray(aiAnalysis.missingSkills) ? aiAnalysis.missingSkills : []);

            if (missingSkills.length > 0) {
              roadmapData = missingSkills.map((skill, index) => {
                const skillInfo = getSkillInfo(skill);
                return {
                  id: index + 1,
                  skill,
                  priority: "Medium",
                  reason: `Strengthen your ${skill} skills to qualify for ${role} positions.`,
                  difficulty: skillInfo.difficulty,
                  duration: skillInfo.duration,
                  topics: skillInfo.topics,
                  project: skillInfo.project,
                  prerequisites: [],
                };
              });
            }
            setIsAIPersonalized(false);
          }

          setRoadmap(roadmapData);
        }
      } catch (error) {
        console.error("Error loading roadmap from MongoDB:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  function getSkillInfo(skill) {
    const skillName = (skill || "").toLowerCase();

    const skillDatabase = {
      javascript: {
        difficulty: "Beginner",
        duration: "1 week",
        topics: [
          "JavaScript Fundamentals",
          "Functions, Closures & Scope",
          "Objects, Arrays & ES6+",
          "Async/Await & Promises",
        ],
        project: "Build an Interactive Dashboard with Async APIs",
      },
      react: {
        difficulty: "Intermediate",
        duration: "2 weeks",
        topics: [
          "Component Architecture",
          "Props, State & Context",
          "Hooks (useEffect, useMemo, custom hooks)",
          "Routing and State Management",
        ],
        project: "Build a Full-Featured SaaS Dashboard in React",
      },
      node: {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "Node.js Event Loop & Architecture",
          "Modules and npm Ecosystem",
          "File System & Streams",
          "HTTP and Server Concepts",
        ],
        project: "Build an Asynchronous REST API Server",
      },
      "node.js": {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "Node.js Event Loop & Architecture",
          "Modules and npm Ecosystem",
          "File System & Streams",
          "HTTP and Server Concepts",
        ],
        project: "Build an Asynchronous REST API Server",
      },
      express: {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "Express Routing & Controllers",
          "Custom & Error Middleware",
          "RESTful Architecture & JWT",
          "Input Validation and Sanitization",
        ],
        project: "Build an Authenticated REST API Service",
      },
      "express.js": {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "Express Routing & Controllers",
          "Custom & Error Middleware",
          "RESTful Architecture & JWT",
          "Input Validation and Sanitization",
        ],
        project: "Build an Authenticated REST API Service",
      },
      mongodb: {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "NoSQL Modeling & Schema Design",
          "Mongoose ORM & Validation",
          "Aggregation Pipeline",
          "Indexing & Query Optimization",
        ],
        project: "Design a High-Throughput Database Schema for SkillForge",
      },
      sql: {
        difficulty: "Beginner",
        duration: "1 week",
        topics: [
          "Relational Database Schema Design",
          "SELECT, Complex JOINs & Subqueries",
          "Aggregations & GROUP BY",
          "Transactions & ACID Principles",
        ],
        project: "Create an Analytics Database with Multi-Table Queries",
      },
      python: {
        difficulty: "Beginner",
        duration: "1 week",
        topics: [
          "Python Core Syntax & Data Structures",
          "Object-Oriented Design & Modules",
          "Virtual Environments & Package Management",
          "File I/O and API Requests",
        ],
        project: "Build an Automated Data Extraction & CLI Tool",
      },
      java: {
        difficulty: "Intermediate",
        duration: "2 weeks",
        topics: [
          "Java OOP, Generics & Collections",
          "Exception Handling & Streams",
          "Multithreading & Concurrency",
          "Spring Boot Framework Basics",
        ],
        project: "Build an Enterprise Backend Microservice",
      },
      "rest api": {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "HTTP Verbs, Headers & Status Codes",
          "API Security & Rate Limiting",
          "CRUD Pattern Best Practices",
          "Pagination & Filtering",
        ],
        project: "Architect and Document a Production-Grade REST API",
      },
      git: {
        difficulty: "Beginner",
        duration: "3 days",
        topics: [
          "Branching, Committing & Rebasing",
          "Pull Requests & Code Review",
          "Merge Conflicts Resolution",
          "GitHub Actions CI/CD Basics",
        ],
        project: "Set Up a Multi-Branch GitHub Workflow with CI",
      },
      "machine learning": {
        difficulty: "Intermediate",
        duration: "3 weeks",
        topics: [
          "Supervised & Unsupervised Learning",
          "Feature Engineering & Normalization",
          "Model Evaluation Metrics (ROC, Precision, Recall)",
          "Ensemble Methods (Random Forest, XGBoost)",
        ],
        project: "Build an End-to-End Prediction & Classification Pipeline",
      },
      "scikit-learn": {
        difficulty: "Intermediate",
        duration: "2 weeks",
        topics: [
          "Pipelines & Transformers",
          "Hyperparameter Tuning (GridSearchCV)",
          "Classification & Regression Models",
          "Model Serialization (Pickle/Joblib)",
        ],
        project: "Train and Deploy a Predictive Scoring Model",
      },
    };

    return (
      skillDatabase[skillName] || {
        difficulty: "Intermediate",
        duration: "1-2 weeks",
        topics: [
          `${skill} Fundamentals & Best Practices`,
          `Core Architecture & Patterns of ${skill}`,
          `Practical Implementation & Error Handling`,
          `Testing & Optimization with ${skill}`,
        ],
        project: `Build a production-quality project demonstrating ${skill}`,
      }
    );
  }

  const updateSkillStatus = async (skill, status) => {
    const updatedProgress = {
      ...progress,
      [skill]: status,
    };

    setProgress(updatedProgress);
    setSavingSkill(skill);

    try {
      await updateSkillForgeData({
        roadmapProgress: updatedProgress,
      });
      window.dispatchEvent(new CustomEvent("skillforge-refresh"));
    } catch (err) {
      console.error("Failed to persist roadmap progress to MongoDB:", err);
    } finally {
      setSavingSkill(null);
    }
  };

  const completedCount = roadmap.filter(
    (item) => progress[item.skill] === "Completed"
  ).length;

  const progressPercentage =
    roadmap.length > 0 ? Math.round((completedCount / roadmap.length) * 100) : 0;

  const inProgressCount = roadmap.filter(
    (item) => progress[item.skill] === "In Progress"
  ).length;

  const notStartedCount = roadmap.filter(
    (item) => !progress[item.skill] || progress[item.skill] === "Not Started"
  ).length;

  if (loading) {
    return (
      <div className="roadmap-page">
        <div className="loading-state" style={{ minHeight: "50vh" }}>
          <div className="spinner"></div>
          <p>Loading your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="roadmap-page">
      {/* Header Banner */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-role-badge">
            🎯 TARGET CAREER: <strong>{targetRole || "Full Stack Developer"}</strong>
          </div>
          <h1>Personalized Learning Roadmap</h1>
          <p className="dashboard-header-sub">
            Step-by-step milestone curriculum generated from your verified resume skills and target career gaps.
          </p>
        </div>
      </div>

      {isAIPersonalized && (
        <div className="status-banner info" style={{ marginBottom: "24px" }}>
          <span>🤖</span>
          <p>
            <strong>Gemini AI Personalized Roadmap</strong> — Generated specifically from your verified resume skills and target career requirements.
          </p>
        </div>
      )}

      {roadmap.length === 0 ? (
        <div className="empty-state-card" style={{ border: "var(--nb-border-dashed)", margin: "40px auto", maxWidth: "600px" }}>
          <span className="empty-icon">🗺️</span>
          <h3>No Roadmap Generated Yet</h3>
          <p>
            Upload your resume or run a Skill Gap analysis to build your customized milestone roadmap.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
            <Link to="/resume" className="primary-btn">
              Upload Resume
            </Link>
            <Link to="/skill-gap" className="secondary-btn">
              Skill Gap Analysis
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Stat Cards Grid */}
          <div className="stats-grid" style={{ marginBottom: "24px" }}>
            <StatCard
              title="Total Modules"
              value={roadmap.length}
              subtitle="Curriculum steps"
              variant="yellow"
              icon="📚"
            />
            <StatCard
              title="Completed"
              value={completedCount}
              subtitle="Milestones done"
              badgeText={`${completedCount}/${roadmap.length}`}
              badgeVariant="mint"
              variant="mint"
              icon="✅"
            />
            <StatCard
              title="In Progress"
              value={inProgressCount}
              subtitle="Active learning"
              badgeText="Active"
              badgeVariant="orange"
              variant="orange"
              icon="🔄"
            />
            <StatCard
              title="Remaining"
              value={notStartedCount}
              subtitle="Next milestones"
              badgeText="Queued"
              badgeVariant="default"
              variant="cyan"
              icon="⏳"
            />
          </div>

          {/* Overall Progress Meter */}
          <ProgressCard
            title="Overall Roadmap Mastery"
            percentage={progressPercentage}
            completedSteps={completedCount}
            totalSteps={roadmap.length}
            subtitle={
              progressPercentage === 100
                ? `🎉 Outstanding! You have completed all learning milestones for ${targetRole}!`
                : "Keep building projects and practicing concepts to reach 100% job readiness."
            }
            variant="mint"
            icon="📈"
          />

          {/* Milestone Timeline List */}
          <div className="roadmap-container" style={{ marginTop: "32px" }}>
            <div className="roadmap-section-header">
              <h2>Milestone Track ({roadmap.length} Steps)</h2>
              <span className="badge-saved">PERSISTED TO PROFILE</span>
            </div>

            <div className="roadmap-list">
              {roadmap.map((item) => {
                const currentStatus = progress[item.skill] || "Not Started";
                const isCompleted = currentStatus === "Completed";
                const isInProgress = currentStatus === "In Progress";
                const isSaving = savingSkill === item.skill;

                return (
                  <div
                    className={`roadmap-card ${isCompleted ? "completed" : isInProgress ? "in-progress" : ""}`}
                    key={item.id}
                  >
                    <div className="roadmap-card-header">
                      <div className="roadmap-number-badge">Step {item.id}</div>
                      <div className="roadmap-header-right">
                        <span
                          className={`status-pill ${
                            isCompleted
                              ? "status-completed"
                              : isInProgress
                              ? "status-in-progress"
                              : "status-not-started"
                          }`}
                        >
                          {currentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="roadmap-card-body">
                      <h3 className="roadmap-skill-title">{item.skill}</h3>

                      <div className="roadmap-meta-row">
                        <span className="roadmap-meta-tag priority-tag">
                          🔥 Priority: {item.priority}
                        </span>
                        <span className="roadmap-meta-tag difficulty-tag">
                          📊 Difficulty: {item.difficulty}
                        </span>
                        <span className="roadmap-meta-tag duration-tag">
                          ⏱️ Time: {item.duration}
                        </span>
                      </div>

                      <p className="roadmap-reason">
                        <strong>Why learn this:</strong> {item.reason}
                      </p>

                      {/* Topics Breakdown */}
                      <div className="roadmap-topics-box">
                        <h4>📚 Key Concepts & Topics</h4>
                        <ul className="roadmap-topics-list">
                          {(Array.isArray(item.topics) ? item.topics : []).map((topic, idx) => (
                            <li key={idx}>{topic}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Prerequisites if present */}
                      {Array.isArray(item.prerequisites) && item.prerequisites.length > 0 && (
                        <div className="roadmap-prereq-box">
                          <h4>🔗 Prerequisites</h4>
                          <ul className="roadmap-topics-list">
                            {item.prerequisites.map((prereq, idx) => (
                              <li key={idx}>{prereq}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommended Hands-on Project */}
                      <div className="roadmap-project-box">
                        <h4>💻 Recommended Hands-On Mini Project</h4>
                        <p className="roadmap-project-text">{item.project}</p>
                      </div>

                      {/* Action Button Controls */}
                      <div className="roadmap-actions">
                        {isCompleted ? (
                          <button disabled className="btn-completed">
                            ✅ Milestone Completed
                          </button>
                        ) : (
                          <>
                            <button
                              className="primary-btn"
                              disabled={isSaving}
                              onClick={() =>
                                updateSkillStatus(
                                  item.skill,
                                  isInProgress ? "In Progress" : "In Progress"
                                )
                              }
                            >
                              {isInProgress ? "📖 In Progress" : "🚀 Start Learning"}
                            </button>

                            {isInProgress && (
                              <button
                                className="success-btn"
                                disabled={isSaving}
                                onClick={() => updateSkillStatus(item.skill, "Completed")}
                              >
                                ✅ Mark as Completed
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Roadmap;