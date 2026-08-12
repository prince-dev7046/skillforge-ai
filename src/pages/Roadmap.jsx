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
    /*
      Priority 1:
      Gemini AI Personalized Roadmap

      Gemini now generates the complete roadmap including:
      - skill
      - priority
      - difficulty
      - duration
      - reason
      - topics
      - miniProject
      - prerequisites
    */

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
    }

    /*
      Priority 2:
      Gemini AI learning priorities
    */

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
    }

    /*
      Priority 3:
      Gemini AI missing skills
    */

    else if (
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
    }

    /*
      Priority 4:
      Existing F4 skill gap
    */

    else {
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

    localStorage.setItem(
      "roadmapProgress",
      JSON.stringify(updatedProgress)
    );
  }

  function markCompleted(skill) {
    const updatedProgress = {
      ...progress,
      [skill]: "Completed",
    };

    setProgress(updatedProgress);

    localStorage.setItem(
      "roadmapProgress",
      JSON.stringify(updatedProgress)
    );
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
      <h1>Personalized Learning Roadmap</h1>

      {targetRole && (
        <h2>
          🎯 Roadmap for: <span>{targetRole}</span>
        </h2>
      )}

      {isAIPersonalized && (
        <div className="ai-roadmap-banner">
          🤖 <strong>AI-Personalized Roadmap</strong>
          <p>
            This roadmap is generated using your Gemini AI career analysis
            and personalized learning priorities.
          </p>
        </div>
      )}

      {roadmap.length === 0 ? (
        <p>
          No skill gap data found. Please complete Skill Gap Analysis first.
        </p>
      ) : (
        <>
          {/* Roadmap Summary */}
          <div className="roadmap-summary">
            <h2>📚 Your Learning Summary</h2>

            <div className="summary-grid">
              <div className="summary-card">
                <span className="summary-icon">📚</span>
                <h3>{roadmap.length}</h3>
                <p>Total Skills</p>
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
                <p>Not Started</p>
              </div>
            </div>
          </div>

          {/* Overall Progress Section */}
          <div className="roadmap-progress">
            <h2>📈 Overall Roadmap Progress</h2>

            <div className="progress-info">
              <span>
                {completedCount} of {roadmap.length} skills completed
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
              <p className="completion-message">
                🎉 Congratulations! You completed your entire roadmap!
              </p>
            ) : (
              <p>
                Keep learning and complete the remaining skills.
              </p>
            )}
          </div>

          {/* Roadmap Cards */}
          <div className="roadmap-container">
            {roadmap.map((item) => (
              <div
                className={`roadmap-card ${
                  progress[item.skill] === "Completed"
                    ? "completed"
                    : ""
                }`}
                key={item.id}
              >
                <div className="roadmap-number">
                  {item.id}
                </div>

                <div className="roadmap-content">
                  <h3>{item.skill}</h3>

                  {/* AI Priority */}
                  <p>
                    🔥 <strong>AI Priority:</strong>{" "}
                    {item.priority}
                  </p>

                  {/* AI Reason */}
                  <p>
                    🤖 <strong>Why you should learn it:</strong>{" "}
                    {item.reason}
                  </p>

                  <p>
                    📊 <strong>Difficulty:</strong>{" "}
                    {item.difficulty}
                  </p>

                  <p>
                    ⏱️ <strong>Estimated Duration:</strong>{" "}
                    {item.duration}
                  </p>

                  <p>
                    📌 <strong>Status:</strong>{" "}
                    {progress[item.skill] || "Not Started"}
                  </p>

                  <h4>📚 Topics to Learn</h4>

                  <ul>
                    {item.topics.map((topic, index) => (
                      <li key={index}>
                        {topic}
                      </li>
                    ))}
                  </ul>

                  {item.prerequisites &&
                    item.prerequisites.length > 0 && (
                      <>
                        <h4>🔗 Prerequisites</h4>

                        <ul>
                          {item.prerequisites.map((prerequisite, index) => (
                            <li key={index}>
                              {prerequisite}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                  <h4>💻 Mini Project</h4>

                  <p>{item.project}</p>

                  {/* Learning Buttons */}
                  {progress[item.skill] === "Completed" ? (
                    <button disabled>
                      ✅ Completed
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => startLearning(item.skill)}
                      >
                        {progress[item.skill] === "In Progress"
                          ? "Continue Learning"
                          : "Start Learning"}
                      </button>

                      {progress[item.skill] === "In Progress" && (
                        <button
                          onClick={() => markCompleted(item.skill)}
                        >
                          Mark as Completed
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Roadmap;