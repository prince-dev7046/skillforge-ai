import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSkillForgeData, updateSkillForgeData } from "../services/api";

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
      <div className="loading-state" style={{ minHeight: "50vh" }}>
        <div className="spinner"></div>
        <p>Loading your personalized roadmap...</p>
      </div>
    );
  }

  return (
    <div className="roadmap-page">
      <div className="page-header" style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1>Personalized Learning Roadmap</h1>
        {targetRole && (
          <h2 style={{ fontSize: "20px", color: "#4f46e5", marginTop: "8px" }}>
            🎯 Target Role: <span>{targetRole}</span>
          </h2>
        )}
      </div>

      {isAIPersonalized && (
        <div className="ai-roadmap-banner" style={{ maxWidth: "1100px", margin: "0 auto 25px" }}>
          🤖 <strong>Gemini AI Personalized Roadmap</strong>
          <p>
            Generated specifically from your verified resume skills and target career requirements.
          </p>
        </div>
      )}

      {roadmap.length === 0 ? (
        <div className="empty-state-card" style={{ maxWidth: "700px", margin: "40px auto" }}>
          <span className="empty-icon">🗺️</span>
          <h3>No Roadmap Generated Yet</h3>
          <p>
            Upload your resume or run a Skill Gap analysis to build your customized milestone roadmap.
          </p>
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "20px" }}>
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
          {/* Roadmap Summary Cards */}
          <div className="roadmap-summary">
            <h2>📚 Learning Journey Overview</h2>
            <div className="summary-grid">
              <div className="summary-card">
                <span className="summary-icon">📚</span>
                <h3>{roadmap.length}</h3>
                <p>Total Modules</p>
              </div>

              <div className="summary-card">
                <span className="summary-icon">✅</span>
                <h3>{completedCount}</h3>
                <p>Completed</p>
              </div>

              <div className="summary-card">
                <span className="summary-icon">🔄</span>
                <h3>{inProgressCount}</h3>
                <p>In Progress</p>
              </div>

              <div className="summary-card">
                <span className="summary-icon">⏳</span>
                <h3>{notStartedCount}</h3>
                <p>Remaining</p>
              </div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="roadmap-progress">
            <h2>📈 Overall Mastery Progress</h2>
            <div className="progress-info">
              <span>
                {completedCount} of {roadmap.length} milestones achieved
              </span>
              <strong>{progressPercentage}%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {progressPercentage === 100 ? (
              <p className="completion-message" style={{ color: "#10b981", marginTop: "15px" }}>
                🎉 Outstanding work! You have completed all learning milestones for {targetRole}!
              </p>
            ) : (
              <p style={{ color: "#6b7280", marginTop: "10px", fontSize: "14px" }}>
                Keep building projects and practicing concepts to reach 100% job readiness.
              </p>
            )}
          </div>

          {/* Roadmap Cards */}
          <div className="roadmap-container">
            {roadmap.map((item) => {
              const currentStatus = progress[item.skill] || "Not Started";
              const isCompleted = currentStatus === "Completed";
              const isInProgress = currentStatus === "In Progress";
              const isSaving = savingSkill === item.skill;

              return (
                <div
                  className={`roadmap-card ${isCompleted ? "completed" : ""}`}
                  key={item.id}
                >
                  <div className="roadmap-number">{item.id}</div>

                  <div className="roadmap-content">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                      <h3>{item.skill}</h3>
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

                    <p>
                      🔥 <strong>Priority:</strong> {item.priority}
                    </p>

                    <p>
                      🎯 <strong>Why learn this:</strong> {item.reason}
                    </p>

                    <div style={{ display: "flex", gap: "20px", margin: "10px 0", color: "#6b7280", fontSize: "14px" }}>
                      <span>📊 <strong>Difficulty:</strong> {item.difficulty}</span>
                      <span>⏱️ <strong>Estimated Time:</strong> {item.duration}</span>
                    </div>

                    <h4>📚 Key Concepts & Topics</h4>
                    <ul>
                      {(Array.isArray(item.topics) ? item.topics : []).map((topic, idx) => (
                        <li key={idx}>{topic}</li>
                      ))}
                    </ul>

                    {Array.isArray(item.prerequisites) && item.prerequisites.length > 0 && (
                      <>
                        <h4>🔗 Prerequisites</h4>
                        <ul>
                          {item.prerequisites.map((prereq, idx) => (
                            <li key={idx}>{prereq}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    <h4>💻 Recommended Hands-On Mini Project</h4>
                    <p style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                      {item.project}
                    </p>

                    {/* Action Buttons */}
                    <div style={{ marginTop: "18px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
        </>
      )}
    </div>
  );
}

export default Roadmap;