import { useEffect, useState } from "react";

function Roadmap() {
  const [roadmap, setRoadmap] = useState([]);
  const [targetRole, setTargetRole] = useState("");
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const savedRole = localStorage.getItem("targetRole");
    const savedSkillGap = localStorage.getItem("skillGap");

    if (savedRole) {
      setTargetRole(savedRole);
    }

    if (!savedSkillGap) {
      return;
    }

    const skillGap = JSON.parse(savedSkillGap);

    const missingSkills = skillGap.missingSkills || [];

    const roadmapData = missingSkills.map((skill, index) => {
      const skillInfo = getSkillInfo(skill);

      return {
        id: index + 1,
        skill: skill,
        difficulty: skillInfo.difficulty,
        duration: skillInfo.duration,
        topics: skillInfo.topics,
        project: skillInfo.project,
      };
    });

    const savedProgress = localStorage.getItem("roadmapProgress");

    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
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

  // Calculate completed roadmap items
  const completedCount = roadmap.filter(
    (item) => progress[item.skill] === "Completed"
  ).length;

  // Calculate overall progress percentage
  const progressPercentage =
    roadmap.length > 0
      ? Math.round((completedCount / roadmap.length) * 100)
      : 0;

  return (
    <div className="roadmap-page">

      <h1>Personalized Learning Roadmap</h1>

      {targetRole && (
        <h2>
          🎯 Roadmap for: <span>{targetRole}</span>
        </h2>
      )}

      {roadmap.length === 0 ? (
        <p>
          No skill gap data found. Please complete Skill Gap Analysis first.
        </p>
      ) : (
        <>
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

                  <h4>💻 Mini Project</h4>

                  <p>
                    {item.project}
                  </p>

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