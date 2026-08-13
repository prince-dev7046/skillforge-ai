import { useEffect, useState } from "react";

const roleSkills = {
  "Full Stack Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "SQL",
    "Git",
  ],

  "Machine Learning Engineer": [
    "Python",
    "NumPy",
    "Pandas",
    "Matplotlib",
    "Scikit-learn",
    "Machine Learning",
    "SQL",
    "Git",
  ],

  "Data Scientist": [
    "Python",
    "NumPy",
    "Pandas",
    "Matplotlib",
    "Scikit-learn",
    "SQL",
    "Machine Learning",
    "Statistics",
  ],

  "Backend Developer": [
    "Java",
    "Python",
    "Node.js",
    "Express.js",
    "SQL",
    "MongoDB",
    "REST API",
    "Git",
  ],
};

const skillRecommendations = {
  HTML: {
    priority: "High",
    description:
      "Learn HTML to build the structure and content of modern web pages.",
    topics: "Semantic HTML, forms, tables, accessibility",
  },

  CSS: {
    priority: "High",
    description:
      "Learn CSS to create responsive and visually appealing web interfaces.",
    topics: "Flexbox, Grid, responsive design, animations",
  },

  JavaScript: {
    priority: "High",
    description:
      "JavaScript is essential for creating interactive web applications.",
    topics: "ES6, DOM, async/await, APIs",
  },

  React: {
    priority: "High",
    description:
      "React is widely used to build modern and component-based frontend applications.",
    topics: "Components, Props, State, Hooks, React Router",
  },

  "Node.js": {
    priority: "High",
    description:
      "Node.js allows you to build scalable backend applications using JavaScript.",
    topics: "Modules, Express.js, REST APIs, asynchronous programming",
  },

  "Express.js": {
    priority: "Medium",
    description:
      "Express.js is a popular Node.js framework for building backend APIs.",
    topics: "Routes, middleware, controllers, REST APIs",
  },

  MongoDB: {
    priority: "Medium",
    description:
      "MongoDB is a NoSQL database commonly used in modern web applications.",
    topics: "Collections, documents, CRUD, queries, indexes",
  },

  SQL: {
    priority: "High",
    description:
      "SQL is essential for working with relational databases and structured data.",
    topics: "SELECT, JOIN, GROUP BY, subqueries, database design",
  },

  Git: {
    priority: "Medium",
    description:
      "Git is essential for version control and collaborating on software projects.",
    topics: "Commit, branch, merge, pull, push, GitHub",
  },

  Python: {
    priority: "High",
    description:
      "Python is one of the most important programming languages for machine learning and data science.",
    topics: "Functions, OOP, modules, virtual environments",
  },

  NumPy: {
    priority: "High",
    description:
      "NumPy provides powerful tools for numerical computing and array operations.",
    topics: "Arrays, indexing, broadcasting, linear algebra",
  },

  Pandas: {
    priority: "High",
    description:
      "Pandas is essential for cleaning, transforming, and analyzing datasets.",
    topics: "DataFrames, filtering, grouping, merging, data cleaning",
  },

  Matplotlib: {
    priority: "Medium",
    description:
      "Matplotlib helps you visualize datasets and understand patterns in data.",
    topics: "Plots, charts, subplots, customization",
  },

  "Scikit-learn": {
    priority: "High",
    description:
      "Scikit-learn provides tools for building and evaluating machine learning models.",
    topics: "Preprocessing, regression, classification, model evaluation",
  },

  "Machine Learning": {
    priority: "High",
    description:
      "Machine learning is fundamental for developing predictive and intelligent applications.",
    topics: "Supervised learning, unsupervised learning, model evaluation",
  },

  Statistics: {
    priority: "High",
    description:
      "Statistics provides the mathematical foundation needed for data analysis and machine learning.",
    topics: "Probability, distributions, hypothesis testing, correlation",
  },

  Java: {
    priority: "High",
    description:
      "Java is widely used for backend development and enterprise applications.",
    topics: "OOP, collections, exceptions, multithreading, Spring",
  },

  "REST API": {
    priority: "High",
    description:
      "REST APIs allow frontend and backend applications to communicate with each other.",
    topics: "HTTP methods, endpoints, JSON, status codes, authentication",
  },
};

function SkillGap() {
  const [resumeSkills, setResumeSkills] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Full Stack Developer");

  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    localStorage.setItem("targetRole", selectedRole);

    // Clear old AI analysis when target role changes
    localStorage.removeItem("aiSkillAnalysis");
  }, [selectedRole]);

  useEffect(() => {
    const savedSkills = localStorage.getItem("resumeSkills");

    if (savedSkills) {
      try {
        const skillsObject = JSON.parse(savedSkills);
        const skillsArray = Object.values(skillsObject).flat();
        setResumeSkills(skillsArray);
      } catch (error) {
        console.error("Error reading resume skills:", error);
        setResumeSkills([]);
      }
    }
  }, []);

  const requiredSkills = roleSkills[selectedRole] || [];

  const matchedSkills = requiredSkills.filter((skill) =>
    resumeSkills.some(
      (resumeSkill) => resumeSkill.toLowerCase() === skill.toLowerCase()
    )
  );

  const missingSkills = requiredSkills.filter(
    (skill) =>
      !resumeSkills.some(
        (resumeSkill) => resumeSkill.toLowerCase() === skill.toLowerCase()
      )
  );

  localStorage.setItem(
    "skillGap",
    JSON.stringify({
      matchedSkills,
      missingSkills,
    })
  );

  const matchPercentage =
    requiredSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / requiredSkills.length) * 100);

  const getStatusBadgeClass = () => {
    if (matchPercentage >= 80) return "badge-green";
    if (matchPercentage >= 50) return "badge-yellow";
    return "badge-pink";
  };

  const getStatusText = () => {
    if (matchPercentage >= 80) return "Strong Match";
    if (matchPercentage >= 50) return "Moderate Match";
    return "Needs Improvement";
  };

  const analyzeWithAI = async () => {
    try {
      setAiLoading(true);
      setAiError("");
      setAiResult(null);

      const response = await fetch("http://localhost:5000/api/ai/skill-gap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeSkills,
          targetRole: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "AI analysis failed");
      }

      setAiResult(data);
      localStorage.setItem("aiSkillAnalysis", JSON.stringify(data));
    } catch (error) {
      console.error("AI Skill Gap Error:", error);
      setAiError(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="skill-gap-page">
      {/* Header Banner */}
      <div className="page-header neo-card card-yellow">
        <div className="header-content">
          <div>
            <span className="badge badge-pink">Skill Matrix</span>
            <h1>Skill Gap Analysis</h1>
            <p>
              Compare your current resume skills with industry requirements for your target career role.
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Target Role Selector */}
      <div className="role-selector-card neo-card card-cyan">
        <label>TARGET CAREER ROLE</label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="role-select-dropdown"
        >
          {Object.keys(roleSkills).map((role) => (
            <option key={role} value={role}>
              🎯 {role}
            </option>
          ))}
        </select>
      </div>

      {/* Match Score Hierarchy */}
      <div className="score-display-card neo-card">
        <span className="badge badge-cyan">Overall Readiness</span>
        <h2 className="score-number">{matchPercentage}%</h2>
        <p className="text-muted">Skill Match for {selectedRole}</p>

        <div className="progress-container score-progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${matchPercentage}%`,
              backgroundColor:
                matchPercentage >= 80
                  ? "var(--neo-green)"
                  : matchPercentage >= 50
                  ? "var(--neo-yellow)"
                  : "var(--neo-pink)",
            }}
          ></div>
        </div>

        <span className={`badge ${getStatusBadgeClass()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Matched vs Missing Skills Grid */}
      <div className="skills-container grid-2">
        {/* Matched Skills */}
        <div className="skill-section neo-card card-green">
          <div className="card-header-row">
            <h2>✅ Matched Skills</h2>
            <span className="badge badge-green">{matchedSkills.length} Found</span>
          </div>

          {matchedSkills.length > 0 ? (
            <div className="skill-list">
              {matchedSkills.map((skill) => (
                <span className="badge badge-green" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted">No matching skills found for this role.</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="skill-section neo-card card-pink">
          <div className="card-header-row">
            <h2>❌ Missing Skills</h2>
            <span className="badge badge-pink">{missingSkills.length} Needed</span>
          </div>

          {missingSkills.length > 0 ? (
            <div className="skill-list">
              {missingSkills.map((skill) => (
                <span className="badge badge-pink" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted">No missing skills! You're fully matched! 🎉</p>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {missingSkills.length > 0 && (
        <div className="recommendations neo-card">
          <div className="card-header-row">
            <h2>💡 Recommended Skills to Learn</h2>
            <span className="badge badge-yellow">Action Plan</span>
          </div>

          <p className="text-muted">
            Focus on these key skills to improve your readiness for <strong>{selectedRole}</strong>.
          </p>

          <div className="recommendation-grid">
            {missingSkills.map((skill) => {
              const recommendation = skillRecommendations[skill];
              const priority = recommendation?.priority || "Medium";
              const badgeClass =
                priority === "High"
                  ? "badge-pink"
                  : priority === "Medium"
                  ? "badge-yellow"
                  : "badge-green";

              return (
                <div className="recommendation-card" key={skill}>
                  <div className="recommendation-header">
                    <h3>{skill}</h3>
                    <span className={`badge ${badgeClass}`}>
                      {priority} Priority
                    </span>
                  </div>

                  <p className="text-muted">
                    {recommendation?.description ||
                      `Learn ${skill} to improve your qualification for the ${selectedRole} position.`}
                  </p>

                  <div className="learning-topics-box">
                    <strong>📌 Topics to Cover:</strong>{" "}
                    <span className="text-muted">
                      {recommendation?.topics ||
                        `Fundamentals and practical applications of ${skill}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visually Distinct Gemini AI Analysis Section */}
      <div className="ai-section-box neo-card card-yellow">
        <div className="ai-header-row">
          <div>
            <span className="badge badge-pink">AI Powered</span>
            <h2>🤖 Gemini AI Skill Analysis</h2>
          </div>
        </div>

        <p className="text-muted" style={{ marginBottom: "var(--space-md)" }}>
          Get a personalized career readiness & skill gap analysis powered by Google Gemini.
        </p>

        <button
          onClick={analyzeWithAI}
          disabled={aiLoading}
          className="btn btn-primary"
        >
          {aiLoading ? "🔄 Analyzing with AI..." : "✨ Run AI Skill Analysis"}
        </button>

        {aiError && (
          <div className="badge badge-pink" style={{ marginTop: "var(--space-md)", display: "block" }}>
            ❌ {aiError}
          </div>
        )}

        {aiResult && (
          <div className="ai-result" style={{ marginTop: "var(--space-xl)" }}>
            <div className="card-header-row">
              <h3>🎯 AI Career Analysis</h3>
              <span className="badge badge-cyan">Target: {aiResult.targetRole}</span>
            </div>

            {/* AI Summary Grid */}
            <div className="grid-2" style={{ gap: "var(--space-md)", marginBottom: "var(--space-lg)" }}>
              <div className="neo-card card-cyan">
                <span className="badge badge-yellow">📊 Match Score</span>
                <div className="score-number">{aiResult.skillMatchPercentage}%</div>
                <div className="progress-container">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${aiResult.skillMatchPercentage}%`,
                      backgroundColor: "var(--neo-yellow)",
                    }}
                  ></div>
                </div>
              </div>

              <div className="neo-card card-green">
                <span className="badge badge-green">💼 Readiness Level</span>
                <h3 style={{ marginTop: "var(--space-sm)", fontSize: "24px" }}>
                  {aiResult.careerReadiness || "Developing"}
                </h3>
              </div>
            </div>

            {/* Overall Assessment */}
            {aiResult.overallAssessment && (
              <div className="neo-card" style={{ marginBottom: "var(--space-md)" }}>
                <h4>🎯 Overall Assessment</h4>
                <p className="text-muted">{aiResult.overallAssessment}</p>
              </div>
            )}

            {/* Strengths & Critical Gaps */}
            {aiResult.matchedSkills?.length > 0 && (
              <div className="neo-card card-green" style={{ marginBottom: "var(--space-md)" }}>
                <h4>✅ Your Strengths</h4>
                <div className="skill-list" style={{ marginTop: "var(--space-xs)" }}>
                  {aiResult.matchedSkills.map((skill) => (
                    <span className="badge badge-green" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {aiResult.criticalGaps?.length > 0 && (
              <div className="neo-card card-pink" style={{ marginBottom: "var(--space-md)" }}>
                <h4>⚠️ Critical Skill Gaps</h4>
                <div className="skill-list" style={{ marginTop: "var(--space-xs)" }}>
                  {aiResult.criticalGaps.map((skill) => (
                    <span className="badge badge-pink" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Priorities */}
            {aiResult.learningPriorities?.length > 0 && (
              <div className="neo-card" style={{ marginBottom: "var(--space-md)" }}>
                <h4>🔥 Learning Priorities</h4>
                <div style={{ marginTop: "var(--space-sm)" }}>
                  {aiResult.learningPriorities.map((item, index) => (
                    <div className="priority-item-card" key={`${item.skill}-${index}`}>
                      <div className="priority-number-badge">{index + 1}</div>
                      <div>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                          <strong style={{ fontSize: "16px" }}>{item.skill}</strong>
                          <span
                            className={`badge ${
                              item.priority === "High"
                                ? "badge-pink"
                                : item.priority === "Medium"
                                ? "badge-yellow"
                                : "badge-green"
                            }`}
                          >
                            {item.priority} Priority
                          </span>
                        </div>
                        <p className="text-muted" style={{ marginTop: "4px" }}>
                          {item.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation & Next Steps */}
            {aiResult.recommendation && (
              <div className="neo-card card-yellow" style={{ marginBottom: "var(--space-md)" }}>
                <h4>💡 AI Recommendation</h4>
                <p className="text-muted">{aiResult.recommendation}</p>
              </div>
            )}

            {aiResult.nextSteps?.length > 0 && (
              <div className="neo-card">
                <h4>🚀 Recommended Next Steps</h4>
                <ol style={{ paddingLeft: "var(--space-lg)", marginTop: "var(--space-xs)" }}>
                  {aiResult.nextSteps.map((step, index) => (
                    <li key={index} className="text-muted" style={{ marginBottom: "8px" }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillGap;