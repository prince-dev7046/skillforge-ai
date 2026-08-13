import { useEffect, useState } from "react";

function Roadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [targetRole, setTargetRole] = useState("");
  const [progress, setProgress] = useState({});
  const [isAIPersonalized, setIsAIPersonalized] = useState(false);

  useEffect(() => {
    const savedRole = localStorage.getItem("targetRole");
    const savedSkillGap = localStorage.getItem("skillGap");
    const savedAIAnalysis = localStorage.getItem("aiSkillAnalysis");
    const savedProgress = localStorage.getItem("roadmapProgress");

    if (savedRole) {
      setTargetRole(savedRole);
    }

    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error("Error reading roadmap progress:", error);
        setProgress({});
      }
    }

    if (!savedSkillGap && !savedAIAnalysis) {
      return;
    }

    let skillGap = {};
    let aiAnalysis = {};

    try {
      if (savedSkillGap) {
        skillGap = JSON.parse(savedSkillGap);
      }

      if (savedAIAnalysis) {
        aiAnalysis = JSON.parse(savedAIAnalysis);
      }
    } catch (error) {
      console.error("Error reading roadmap data:", error);
      return;
    }

    let roadmapData = [];

    if (
      Array.isArray(aiAnalysis.roadmap) &&
      aiAnalysis.roadmap.length > 0
    ) {
      roadmapData = aiAnalysis.roadmap.map((item, index) => ({
        id: index + 1,
        skill: item.skill,
        priority: item.priority || index + 1,
        reason:
          item.reason ||
          `Learn ${item.skill} to improve your career readiness.`,
        difficulty: item.difficulty || "Intermediate",
        duration: item.duration || "1 week",
        topics: Array.isArray(item.topics) ? item.topics : [],
        project:
          item.miniProject ||
          `Build a project using ${item.skill}`,
        prerequisites: Array.isArray(item.prerequisites)
          ? item.prerequisites
          : [],
      }));

      setIsAIPersonalized(true);
    } else if (
      Array.isArray(aiAnalysis.learningPriorities) &&
      aiAnalysis.learningPriorities.length > 0
    ) {
      roadmapData = aiAnalysis.learningPriorities.map((item, index) => {
        const skillInfo = getSkillInfo(item.skill);

        return {
          id: index + 1,
          skill: item.skill,
          priority: item.priority || "Medium",
          reason:
            item.reason ||
            `Learn ${item.skill} to improve your career readiness.`,
          difficulty: skillInfo.difficulty,
          duration: skillInfo.duration,
          topics: skillInfo.topics,
          project: skillInfo.project,
          prerequisites: [],
        };
      });

      setIsAIPersonalized(true);
    } else if (
      Array.isArray(aiAnalysis.missingSkills) &&
      aiAnalysis.missingSkills.length > 0
    ) {
      roadmapData = aiAnalysis.missingSkills.map((skill, index) => {
        const skillInfo = getSkillInfo(skill);

        return {
          id: index + 1,
          skill,
          priority: "Medium",
          reason: `Learn ${skill} to improve your readiness for the ${
            savedRole || "target"
          } role.`,
          difficulty: skillInfo.difficulty,
          duration: skillInfo.duration,
          topics: skillInfo.topics,
          project: skillInfo.project,
          prerequisites: [],
        };
      });

      setIsAIPersonalized(true);
    } else {
      const missingSkills = skillGap.missingSkills || [];

      roadmapData = missingSkills.map((skill, index) => {
        const skillInfo = getSkillInfo(skill);

        return {
          id: index + 1,
          skill,
          priority: "Medium",
          reason: `Learn ${skill} to improve your skills for the ${
            savedRole || "target"
          } role.`,
          difficulty: skillInfo.difficulty,
          duration: skillInfo.duration,
          topics: skillInfo.topics,
          project: skillInfo.project,
          prerequisites: [],
        };
      });

      setIsAIPersonalized(false);
    }

    setRoadmap(roadmapData);
  }, []);

  function getSkillInfo(skill) {
    const skillName = skill.toLowerCase();

    const skillDatabase = {
      javascript: {
        difficulty: "Beginner",
        duration: "1 week",
        topics: [
          "JavaScript Fundamentals",
          "Functions and Arrays",
          "Objects and DOM",
          "Async JavaScript",
        ],
        project: "Build an Interactive To-Do App",
      },

      react: {
        difficulty: "Intermediate",
        duration: "2 weeks",
        topics: [
          "Components",
          "Props and State",
          "Hooks",
          "React Router",
        ],
        project: "Build a React Dashboard",
      },

      node: {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "Node.js Fundamentals",
          "Modules and npm",
          "File System",
          "HTTP Server",
        ],
        project: "Build a REST API",
      },

      "node.js": {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "Node.js Fundamentals",
          "Modules and npm",
          "File System",
          "HTTP Server",
        ],
        project: "Build a REST API",
      },

      express: {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "Express Fundamentals",
          "Routing",
          "Middleware",
          "REST APIs",
        ],
        project: "Build an Express REST API",
      },

      "express.js": {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "Express Fundamentals",
          "Routing",
          "Middleware",
          "REST APIs",
        ],
        project: "Build an Express REST API",
      },

      mongodb: {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "MongoDB Fundamentals",
          "Collections and Documents",
          "CRUD Operations",
          "MongoDB with Node.js",
        ],
        project: "Build a Student Database API",
      },

      sql: {
        difficulty: "Beginner",
        duration: "1 week",
        topics: [
          "SQL Fundamentals",
          "SELECT Queries",
          "Joins",
          "Aggregations",
        ],
        project: "Build a Student Database",
      },

      python: {
        difficulty: "Beginner",
        duration: "1 week",
        topics: [
          "Python Fundamentals",
          "Functions",
          "Data Structures",
          "Object-Oriented Programming",
        ],
        project: "Build a Python CLI Application",
      },

      java: {
        difficulty: "Intermediate",
        duration: "2 weeks",
        topics: [
          "Java Fundamentals",
          "OOP",
          "Collections",
          "Exception Handling",
        ],
        project: "Build a Java Management System",
      },

      "rest api": {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "HTTP Methods",
          "API Endpoints",
          "Request and Response",
          "JSON",
        ],
        project: "Build a REST API",
      },

      git: {
        difficulty: "Beginner",
        duration: "3 days",
        topics: [
          "Git Fundamentals",
          "Branches",
          "Merge and Pull Requests",
          "GitHub",
        ],
        project: "Collaborative GitHub Project",
      },

      docker: {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "Docker Fundamentals",
          "Images and Containers",
          "Dockerfile",
          "Docker Compose",
        ],
        project: "Containerize a Web Application",
      },

      "scikit-learn": {
        difficulty: "Intermediate",
        duration: "2 weeks",
        topics: [
          "Data Preprocessing",
          "Regression",
          "Classification",
          "Model Evaluation",
        ],
        project: "Build a Machine Learning Prediction System",
      },

      "scikit learn": {
        difficulty: "Intermediate",
        duration: "2 weeks",
        topics: [
          "Data Preprocessing",
          "Regression",
          "Classification",
          "Model Evaluation",
        ],
        project: "Build a Machine Learning Prediction System",
      },

      tensorflow: {
        difficulty: "Advanced",
        duration: "3 weeks",
        topics: [
          "TensorFlow Fundamentals",
          "Neural Networks",
          "Model Training",
          "Model Evaluation",
        ],
        project: "Build a Neural Network Application",
      },

      pytorch: {
        difficulty: "Advanced",
        duration: "3 weeks",
        topics: [
          "PyTorch Fundamentals",
          "Tensors",
          "Neural Networks",
          "Model Training",
        ],
        project: "Build a Deep Learning Image Classifier",
      },

      "machine learning": {
        difficulty: "Intermediate",
        duration: "3 weeks",
        topics: [
          "Supervised Learning",
          "Unsupervised Learning",
          "Feature Engineering",
          "Model Evaluation",
        ],
        project: "Build an End-to-End ML Prediction System",
      },

      "feature engineering": {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          "Feature Selection",
          "Feature Transformation",
          "Encoding",
          "Scaling",
        ],
        project: "Build a Feature Engineering Pipeline",
      },

      mlops: {
        difficulty: "Advanced",
        duration: "3 weeks",
        topics: [
          "ML Pipelines",
          "Model Deployment",
          "Model Monitoring",
          "CI/CD for ML",
        ],
        project: "Deploy a Machine Learning Model",
      },
    };

    return (
      skillDatabase[skillName] || {
        difficulty: "Intermediate",
        duration: "1 week",
        topics: [
          `${skill} Fundamentals`,
          `${skill} Core Concepts`,
          `Practice ${skill}`,
          `Build with ${skill}`,
        ],
        project: `Build a project using ${skill}`,
      }
    );
  }

  function startLearning(skill) {
    const updatedProgress = {
      ...progress,
      [skill]: "In Progress",
    };

    setProgress(updatedProgress);
    localStorage.setItem("roadmapProgress", JSON.stringify(updatedProgress));
  }

  function markCompleted(skill) {
    const updatedProgress = {
      ...progress,
      [skill]: "Completed",
    };

    setProgress(updatedProgress);
    localStorage.setItem("roadmapProgress", JSON.stringify(updatedProgress));
  }

  const completedCount = roadmap.filter(
    (item) => progress[item.skill] === "Completed"
  ).length;

  const progressPercentage =
    roadmap.length > 0
      ? Math.round((completedCount / roadmap.length) * 100)
      : 0;

  const inProgressCount = roadmap.filter(
    (item) => progress[item.skill] === "In Progress"
  ).length;

  const notStartedCount = roadmap.filter(
    (item) => !progress[item.skill]
  ).length;

  return (
    <div className="roadmap-page">
      {/* Header Banner */}
      <div className="page-header neo-card card-cyan">
        <div className="header-content">
          <div>
            <span className="badge badge-yellow">Personalized Timeline</span>
            <h1>Learning Roadmap</h1>
            {targetRole && (
              <p>
                🎯 Target Career Role: <strong>{targetRole}</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Personalized Banner */}
      {isAIPersonalized && (
        <div className="neo-card card-pink">
          <div className="card-header-row" style={{ marginBottom: "var(--space-2xs)", borderBottom: "none" }}>
            <span className="badge badge-yellow">🤖 Gemini AI Personalized</span>
          </div>
          <p className="text-muted">
            This roadmap is customized dynamically based on your Gemini AI skill gap analysis and targeted career goals.
          </p>
        </div>
      )}

      {roadmap.length === 0 ? (
        <div className="neo-card" style={{ textAlign: "center", padding: "var(--space-2xl)" }}>
          <h3>No Roadmap Data Found</h3>
          <p className="text-muted" style={{ marginTop: "var(--space-xs)" }}>
            Please complete your Skill Gap Analysis first to generate a custom learning roadmap.
          </p>
        </div>
      ) : (
        <>
          {/* Prominent Overall Progress & Summary */}
          <div className="summary-grid-4">
            <div className="summary-stat-box card-yellow">
              <span className="badge badge-yellow">Total Modules</span>
              <h3>{roadmap.length}</h3>
              <p className="text-muted">Skills</p>
            </div>

            <div className="summary-stat-box card-green">
              <span className="badge badge-green">Completed</span>
              <h3>{completedCount}</h3>
              <p className="text-muted">Mastered</p>
            </div>

            <div className="summary-stat-box card-yellow">
              <span className="badge badge-yellow">In Progress</span>
              <h3>{inProgressCount}</h3>
              <p className="text-muted">Active</p>
            </div>

            <div className="summary-stat-box">
              <span className="badge">Not Started</span>
              <h3>{notStartedCount}</h3>
              <p className="text-muted">Remaining</p>
            </div>
          </div>

          {/* Overall Roadmap Progress Bar */}
          <div className="neo-card card-cyan">
            <div className="card-header-row" style={{ borderBottom: "none" }}>
              <div>
                <h2>📈 Overall Roadmap Completion</h2>
                <p className="text-muted">{completedCount} of {roadmap.length} skills completed</p>
              </div>
              <span className="score-number" style={{ fontSize: "36px" }}>{progressPercentage}%</span>
            </div>

            <div className="progress-container" style={{ height: "20px", margin: "var(--space-sm) 0" }}>
              <div
                className="progress-fill"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: "var(--neo-green)",
                }}
              ></div>
            </div>

            {progressPercentage === 100 ? (
              <p style={{ fontWeight: "700", color: "var(--text-main)" }}>
                🎉 Congratulations! You have completed your entire learning roadmap!
              </p>
            ) : (
              <p className="text-muted">
                Keep up the momentum! Progress step by step to reach 100% career readiness.
              </p>
            )}
          </div>

          {/* Visually Strong Timeline Nodes */}
          <div className="timeline-wrapper">
            {roadmap.map((item) => {
              const currentStatus = progress[item.skill] || "Not Started";
              const isDone = currentStatus === "Completed";
              const isInProgress = currentStatus === "In Progress";

              return (
                <div className="timeline-step-card" key={item.id}>
                  {/* Step Circle Node */}
                  <div
                    className={`timeline-node-circle ${
                      isDone
                        ? "node-completed"
                        : isInProgress
                        ? "node-progress"
                        : ""
                    }`}
                  >
                    {isDone ? "✓" : item.id}
                  </div>

                  {/* Stage Content Card */}
                  <div
                    className={`timeline-content-card ${
                      isDone ? "completed" : isInProgress ? "in-progress" : ""
                    }`}
                  >
                    <div className="timeline-header-row">
                      <div>
                        <h3>{item.skill}</h3>
                        <p className="text-muted" style={{ marginTop: "4px", fontSize: "14px" }}>
                          {item.reason}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <span
                          className={`badge ${
                            isDone
                              ? "badge-green"
                              : isInProgress
                              ? "badge-yellow"
                              : ""
                          }`}
                        >
                          {currentStatus}
                        </span>

                        <span className="badge badge-cyan">
                          ⏱️ {item.duration}
                        </span>

                        <span className="badge badge-pink">
                          📊 {item.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Topics to Learn */}
                    <div style={{ marginTop: "var(--space-md)" }}>
                      <strong style={{ fontSize: "13px", textTransform: "uppercase" }}>
                        📚 Core Topics:
                      </strong>
                      <div className="topics-pill-grid">
                        {item.topics.map((topic, idx) => (
                          <span key={idx} className="topic-pill">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Prerequisites */}
                    {item.prerequisites && item.prerequisites.length > 0 && (
                      <div style={{ marginTop: "var(--space-sm)" }}>
                        <strong style={{ fontSize: "12px", textTransform: "uppercase" }}>
                          🔗 Prerequisites:
                        </strong>
                        <div className="topics-pill-grid">
                          {item.prerequisites.map((prereq, idx) => (
                            <span key={idx} className="topic-pill">
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mini Project Box */}
                    <div className="mini-project-box">
                      <strong style={{ fontSize: "13px", textTransform: "uppercase" }}>
                        💻 Applied Mini Project:
                      </strong>
                      <p style={{ fontWeight: "700", marginTop: "4px" }}>{item.project}</p>
                    </div>

                    {/* Node Actions */}
                    <div className="node-actions-row">
                      {isDone ? (
                        <button disabled className="btn btn-green">
                          ✅ Completed
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn btn-primary"
                            onClick={() => startLearning(item.skill)}
                          >
                            {isInProgress ? "🔄 Continue Learning" : "🚀 Start Learning"}
                          </button>

                          {isInProgress && (
                            <button
                              className="btn btn-green"
                              onClick={() => markCompleted(item.skill)}
                            >
                              ✓ Mark as Completed
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