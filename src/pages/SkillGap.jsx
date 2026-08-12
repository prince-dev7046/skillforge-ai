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
  const [selectedRole, setSelectedRole] = useState(
    "Full Stack Developer"
  );

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

        // Convert categorized object into one array
        const skillsArray = Object.values(skillsObject).flat();

        setResumeSkills(skillsArray);
      } catch (error) {
        console.error("Error reading resume skills:", error);
        setResumeSkills([]);
      }
    }
  }, []);

  const requiredSkills = roleSkills[selectedRole];

  const matchedSkills = requiredSkills.filter((skill) =>
    resumeSkills.some(
      (resumeSkill) =>
        resumeSkill.toLowerCase() === skill.toLowerCase()
    )
  );

  const missingSkills = requiredSkills.filter(
    (skill) =>
      !resumeSkills.some(
        (resumeSkill) =>
          resumeSkill.toLowerCase() === skill.toLowerCase()
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
      : Math.round(
          (matchedSkills.length / requiredSkills.length) * 100
        );

  const getStatus = () => {
    if (matchPercentage >= 80) {
      return "Strong Match";
    }

    if (matchPercentage >= 50) {
      return "Moderate Match";
    }

    return "Needs Improvement";
  };

  const analyzeWithAI = async () => {
    try {
      setAiLoading(true);
      setAiError("");
      setAiResult(null);

      const response = await fetch(
        "http://localhost:5000/api/ai/skill-gap",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeSkills,
            targetRole: selectedRole,
          }),
        }
      );

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

      <h1>Skill Gap Analysis</h1>

      <p>
        Compare your current skills with the skills required
        for your target career.
      </p>

      {/* Target Role */}

      <div className="role-selector">

        <label>Select Target Role:</label>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {Object.keys(roleSkills).map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

      </div>

      {/* Match Score */}

      <div className="skill-score">

        <h2>{matchPercentage}%</h2>

        <p>Skill Match</p>

        <div className="progress-container">

          <div
            className="progress-bar"
            style={{
              width: `${matchPercentage}%`,
            }}
          ></div>

        </div>

        <h3>{getStatus()}</h3>

      </div>

      {/* Skills */}

      <div className="skills-container">

        {/* Matched Skills */}

        <div className="skill-section">

          <h2>✅ Matched Skills</h2>

          {matchedSkills.length > 0 ? (

            <div className="skill-list">

              {matchedSkills.map((skill) => (
                <span
                  className="skill matched"
                  key={skill}
                >
                  {skill}
                </span>
              ))}

            </div>

          ) : (

            <p>No matching skills found.</p>

          )}

        </div>

        {/* Missing Skills */}

        <div className="skill-section">

          <h2>❌ Missing Skills</h2>

          {missingSkills.length > 0 ? (

            <div className="skill-list">

              {missingSkills.map((skill) => (
                <span
                  className="skill missing"
                  key={skill}
                >
                  {skill}
                </span>
              ))}

            </div>

          ) : (

            <p>No missing skills! 🎉</p>

          )}

        </div>

      </div>

      {/* Recommendations */}

      {/* Recommendations */}

      {missingSkills.length > 0 && (
        <div className="recommendations">

          <h2>💡 Recommended Skills to Learn</h2>

          <p>
            Focus on these skills to improve your readiness for{" "}
            <strong>{selectedRole}</strong>.
          </p>

          <div className="recommendation-list">

            {missingSkills.map((skill) => {

              const recommendation = skillRecommendations[skill];

              return (
                <div
                  className="recommendation-card"
                  key={skill}
                >

                  <div className="recommendation-header">

                    <h3>{skill}</h3>

                    <span
                      className={`priority ${recommendation?.priority
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {recommendation?.priority || "Medium"} Priority
                    </span>

                  </div>

                  <p className="recommendation-description">
                    {recommendation?.description ||
                      `Learn ${skill} to improve your skills for the ${selectedRole} role.`}
                  </p>

                  <div className="learning-topics">

                    <strong>What to learn:</strong>

                    <span>
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
      <div className="ai-analysis-section">
        <h2>🤖 AI Skill Gap Analysis</h2>

        <p>
          Get a personalized skill-gap analysis powered by Gemini AI.
        </p>

        <button
          onClick={analyzeWithAI}
          disabled={aiLoading}
          className="ai-analysis-button"
        >
          {aiLoading ? "Analyzing..." : "✨ Analyze with AI"}
        </button>

        {aiError && (
          <p className="ai-error">
            ❌ {aiError}
          </p>
        )}

        {aiResult && (
          <div className="ai-result">

            {/* Header */}
            <div className="ai-result-header">
              <h3>🎯 AI Career Analysis</h3>

              <p>
                <strong>Target Role:</strong>{" "}
                {aiResult.targetRole}
              </p>
            </div>

            {/* Skill Match + Career Readiness */}
            <div className="ai-summary-grid">

              <div className="ai-summary-card">
                <span className="ai-card-icon">📊</span>
                <h4>Skill Match</h4>
                <div className="ai-match-percentage">
                  {aiResult.skillMatchPercentage}%
                </div>

                <div className="ai-progress-container">
                  <div
                    className="ai-progress-bar"
                    style={{
                      width: `${aiResult.skillMatchPercentage}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="ai-summary-card">
                <span className="ai-card-icon">💼</span>
                <h4>Career Readiness</h4>
                <div className="ai-readiness">
                  {aiResult.careerReadiness || "Developing"}
                </div>
              </div>

            </div>

            {/* Overall Assessment */}
            {aiResult.overallAssessment && (
              <div className="ai-card ai-assessment">
                <h3>🎯 Overall Assessment</h3>

                <p>
                  {aiResult.overallAssessment}
                </p>
              </div>
            )}

            {/* Matched Skills */}
            {aiResult.matchedSkills?.length > 0 && (
              <div className="ai-card">
                <h3>✅ Your Strengths</h3>

                <div className="ai-skill-list">
                  {aiResult.matchedSkills.map((skill) => (
                    <span
                      className="ai-skill ai-skill-matched"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Critical Gaps */}
            {aiResult.criticalGaps?.length > 0 && (
              <div className="ai-card">
                <h3>⚠️ Critical Skill Gaps</h3>

                <div className="ai-skill-list">
                  {aiResult.criticalGaps.map((skill) => (
                    <span
                      className="ai-skill ai-skill-missing"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {aiResult.missingSkills?.length > 0 && (
              <div className="ai-card">
                <h3>📚 Skills You Should Learn</h3>

                <div className="ai-skill-list">
                  {aiResult.missingSkills.map((skill) => (
                    <span
                      className="ai-skill ai-skill-missing"
                      key={skill}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Priorities */}
            {aiResult.learningPriorities?.length > 0 && (
              <div className="ai-card">
                <h3>🔥 Learning Priorities</h3>

                <div className="learning-priority-list">
                  {aiResult.learningPriorities.map((item, index) => (
                    <div
                      className="learning-priority-card"
                      key={`${item.skill}-${index}`}
                    >
                      <div className="priority-number">
                        {index + 1}
                      </div>

                      <div className="priority-content">
                        <div className="priority-title-row">
                          <h4>{item.skill}</h4>

                          <span
                            className={`ai-priority-badge ${item.priority
                              ?.toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {item.priority} Priority
                          </span>
                        </div>

                        <p>{item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized Recommendation */}
            {aiResult.recommendation && (
              <div className="ai-card ai-recommendation">
                <h3>💡 Personalized Recommendation</h3>

                <p>
                  {aiResult.recommendation}
                </p>
              </div>
            )}

            {/* Next Steps */}
            {aiResult.nextSteps?.length > 0 && (
              <div className="ai-card">
                <h3>🚀 Your Next Steps</h3>

                <ol className="ai-next-steps">
                  {aiResult.nextSteps.map((step, index) => (
                    <li key={index}>
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