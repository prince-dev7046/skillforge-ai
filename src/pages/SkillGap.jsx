import { useEffect, useState } from "react";
import { getSkillForgeData, updateSkillForgeData, analyzeSkillGapAI } from "../services/api";
import SkillCard from "../components/SkillCard";
import StatCard from "../components/StatCard";

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
    description: "Learn HTML to build the structure and content of modern web pages.",
    topics: "Semantic HTML, forms, tables, accessibility",
  },
  CSS: {
    priority: "High",
    description: "Learn CSS to create responsive and visually appealing web interfaces.",
    topics: "Flexbox, Grid, responsive design, animations",
  },
  JavaScript: {
    priority: "High",
    description: "JavaScript is essential for creating interactive web applications.",
    topics: "ES6, DOM, async/await, APIs",
  },
  React: {
    priority: "High",
    description: "React is widely used to build modern and component-based frontend applications.",
    topics: "Components, Props, State, Hooks, React Router",
  },
  "Node.js": {
    priority: "High",
    description: "Node.js allows you to build scalable backend applications using JavaScript.",
    topics: "Modules, Express.js, REST APIs, asynchronous programming",
  },
  "Express.js": {
    priority: "Medium",
    description: "Express.js is a popular Node.js framework for building backend APIs.",
    topics: "Routes, middleware, controllers, REST APIs",
  },
  MongoDB: {
    priority: "Medium",
    description: "MongoDB is a NoSQL database commonly used in modern web applications.",
    topics: "Collections, documents, CRUD, queries, indexes",
  },
  SQL: {
    priority: "High",
    description: "SQL is essential for working with relational databases and structured data.",
    topics: "SELECT, JOIN, GROUP BY, subqueries, database design",
  },
  Git: {
    priority: "Medium",
    description: "Git is essential for version control and collaborating on software projects.",
    topics: "Commit, branch, merge, pull, push, GitHub",
  },
  Python: {
    priority: "High",
    description: "Python is one of the most important programming languages for machine learning and data science.",
    topics: "Functions, OOP, modules, virtual environments",
  },
  NumPy: {
    priority: "High",
    description: "NumPy provides powerful tools for numerical computing and array operations.",
    topics: "Arrays, indexing, broadcasting, linear algebra",
  },
  Pandas: {
    priority: "High",
    description: "Pandas is essential for cleaning, transforming, and analyzing datasets.",
    topics: "DataFrames, filtering, grouping, merging, data cleaning",
  },
  Matplotlib: {
    priority: "Medium",
    description: "Matplotlib helps you visualize datasets and understand patterns in data.",
    topics: "Plots, charts, subplots, customization",
  },
  "Scikit-learn": {
    priority: "High",
    description: "Scikit-learn provides tools for building and evaluating machine learning models.",
    topics: "Preprocessing, regression, classification, model evaluation",
  },
  "Machine Learning": {
    priority: "High",
    description: "Machine learning is fundamental for developing predictive and intelligent applications.",
    topics: "Supervised learning, unsupervised learning, model evaluation",
  },
  Statistics: {
    priority: "High",
    description: "Statistics provides the mathematical foundation needed for data analysis and machine learning.",
    topics: "Probability, distributions, hypothesis testing, correlation",
  },
  Java: {
    priority: "High",
    description: "Java is widely used for backend development and enterprise applications.",
    topics: "OOP, collections, exceptions, multithreading, Spring",
  },
  "REST API": {
    priority: "High",
    description: "REST APIs allow frontend and backend applications to communicate with each other.",
    topics: "HTTP methods, endpoints, JSON, status codes, authentication",
  },
};

function SkillGap() {
  const [resumeSkills, setResumeSkills] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Full Stack Developer");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  // Load user data from MongoDB on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setPageLoading(true);
        const data = await getSkillForgeData();

        if (data) {
          if (data.targetRole) {
            setSelectedRole(data.targetRole);
          }

          if (data.resumeSkills) {
            let skillsArr = [];
            if (Array.isArray(data.resumeSkills)) {
              skillsArr = data.resumeSkills;
            } else if (typeof data.resumeSkills === "object") {
              skillsArr = Object.values(data.resumeSkills).flat();
            }
            setResumeSkills(skillsArr);
          }

          if (data.aiSkillAnalysis && Object.keys(data.aiSkillAnalysis).length > 0) {
            setAiResult(data.aiSkillAnalysis);
          }
        }
      } catch (error) {
        console.error("Error loading Skill Gap data from MongoDB:", error);
      } finally {
        setPageLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Recalculate skill match based on current role and resume skills
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

  const matchPercentage =
    requiredSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / requiredSkills.length) * 100);

  // Save role change & rule-based skill gap to MongoDB
  const handleRoleChange = async (newRole) => {
    setSelectedRole(newRole);
    setAiResult(null); // Reset AI result when target role changes

    const newRequired = roleSkills[newRole] || [];
    const newMatched = newRequired.filter((skill) =>
      resumeSkills.some((r) => r.toLowerCase() === skill.toLowerCase())
    );
    const newMissing = newRequired.filter(
      (skill) => !resumeSkills.some((r) => r.toLowerCase() === skill.toLowerCase())
    );

    try {
      await updateSkillForgeData({
        targetRole: newRole,
        skillGap: {
          matchedSkills: newMatched,
          missingSkills: newMissing,
        },
        aiSkillAnalysis: {}, // Clear old AI analysis for previous role
      });
      window.dispatchEvent(new CustomEvent("skillforge-refresh"));
    } catch (err) {
      console.error("Error updating role in MongoDB:", err);
    }
  };

  const getStatus = () => {
    if (matchPercentage >= 80) return "Strong Match";
    if (matchPercentage >= 50) return "Moderate Match";
    return "Needs Improvement";
  };

  const analyzeWithAI = async () => {
    if (resumeSkills.length === 0) {
      setAiError("Please upload a resume first to extract your skills for AI analysis.");
      return;
    }

    try {
      setAiLoading(true);
      setAiError("");

      const result = await analyzeSkillGapAI(resumeSkills, selectedRole);

      setAiResult(result);

      // Save AI analysis result to MongoDB
      await updateSkillForgeData({
        targetRole: selectedRole,
        aiSkillAnalysis: result,
        skillGap: {
          matchedSkills: result.matchedSkills || matchedSkills,
          missingSkills: result.missingSkills || missingSkills,
        },
      });

      window.dispatchEvent(new CustomEvent("skillforge-refresh"));
    } catch (error) {
      console.error("AI Skill Gap Error:", error);
      setAiError(error.message || "Failed to complete AI analysis. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="skill-gap-page">
        <div className="loading-state" style={{ minHeight: "50vh" }}>
          <div className="spinner"></div>
          <p>Loading your skill gap analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="skill-gap-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-role-badge">
            🎯 BENCHMARK ANALYSIS
          </div>
          <h1>Skill Gap Analysis</h1>
          <p className="dashboard-header-sub">
            Compare your verified skills against industry benchmarks and run Gemini AI deep evaluations.
          </p>
        </div>

        {/* Target Role Selector Control */}
        <div className="role-selector-box">
          <label htmlFor="role-select" className="role-selector-label">
            TARGET CAREER ROLE:
          </label>
          <select
            id="role-select"
            className="role-selector-select"
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
          >
            {Object.keys(roleSkills).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {resumeSkills.length === 0 && (
        <div className="status-banner warning">
          <span>⚠️</span>
          <p>
            No resume skills detected.{" "}
            <a
              href="/resume"
              style={{
                color: "inherit",
                textDecoration: "underline",
                fontWeight: "bold",
              }}
            >
              Upload your resume
            </a>{" "}
            for accurate gap analysis and personalized roadmap recommendations.
          </p>
        </div>
      )}

      {/* Match Score & Skill Comparison Cards Grid */}
      <div className="skill-gap-top-grid">
        {/* Match Score Card */}
        <div className="skill-score-card">
          <div className="skill-score-header">
            <h3>Skill Match Benchmark</h3>
            <span className="badge-saved">{getStatus()}</span>
          </div>

          <div className="skill-score-body">
            <h2 className="skill-score-number">{matchPercentage}%</h2>
            <p className="skill-score-label">Coverage for {selectedRole}</p>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${matchPercentage}%`,
                backgroundColor:
                  matchPercentage >= 80
                    ? "var(--nb-mint)"
                    : matchPercentage >= 50
                    ? "var(--nb-yellow)"
                    : "var(--nb-pink)",
              }}
            ></div>
          </div>
        </div>

        {/* Matched vs Missing Skills Cards */}
        <div className="skills-comparison-grid">
          <div className="skill-section matched-section">
            <div className="skill-section-header">
              <h3>✅ Matched Skills ({matchedSkills.length})</h3>
            </div>
            {matchedSkills.length > 0 ? (
              <div className="skill-list">
                {matchedSkills.map((skill) => (
                  <SkillCard key={skill} skill={skill} status="matched" variant="pill" />
                ))}
              </div>
            ) : (
              <p className="skill-empty-text">No matching skills found for this role yet.</p>
            )}
          </div>

          <div className="skill-section missing-section">
            <div className="skill-section-header">
              <h3>❌ Missing Skills ({missingSkills.length})</h3>
            </div>
            {missingSkills.length > 0 ? (
              <div className="skill-list">
                {missingSkills.map((skill) => (
                  <SkillCard key={skill} skill={skill} status="missing" variant="pill" />
                ))}
              </div>
            ) : (
              <p className="skill-empty-text" style={{ color: "#065f46" }}>
                You have covered all core skills for this role! 🎉
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="ai-analysis-section">
        <div className="ai-analysis-header">
          <div>
            <h2>🤖 Gemini AI Deep Career Analysis</h2>
            <p className="ai-analysis-sub">
              Get comprehensive career readiness ratings, critical gaps, and prioritized action steps.
            </p>
          </div>

          <button
            onClick={analyzeWithAI}
            disabled={aiLoading}
            className="primary-btn"
          >
            {aiLoading ? "✨ Analyzing with Gemini..." : "✨ Run AI Deep Analysis"}
          </button>
        </div>

        {aiError && (
          <div className="status-banner error" style={{ marginTop: "20px" }}>
            <span>❌</span>
            <p>{aiError}</p>
          </div>
        )}

        {aiResult && (
          <div className="ai-result">
            <div className="ai-result-header">
              <h3>🎯 AI Assessment: {aiResult.targetRole}</h3>
            </div>

            <div className="ai-summary-grid">
              <StatCard
                title="AI SKILL MATCH"
                value={`${aiResult.skillMatchPercentage}%`}
                subtitle="Calculated by Gemini AI"
                variant="yellow"
                icon="📊"
              />

              <StatCard
                title="CAREER READINESS"
                value={aiResult.careerReadiness || "Developing"}
                subtitle={`Targeting ${selectedRole}`}
                variant="mint"
                icon="💼"
              />
            </div>

            {aiResult.overallAssessment && (
              <div className="ai-card ai-assessment">
                <h3>🎯 Overall Assessment</h3>
                <p>{aiResult.overallAssessment}</p>
              </div>
            )}

            {Array.isArray(aiResult.matchedSkills) && aiResult.matchedSkills.length > 0 && (
              <div className="ai-card">
                <h3>✅ Your Verified Strengths</h3>
                <div className="skill-list" style={{ marginTop: "10px" }}>
                  {aiResult.matchedSkills.map((skill) => (
                    <SkillCard key={skill} skill={skill} status="matched" variant="pill" />
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(aiResult.criticalGaps) && aiResult.criticalGaps.length > 0 && (
              <div className="ai-card">
                <h3>⚠️ Critical Skill Gaps</h3>
                <div className="skill-list" style={{ marginTop: "10px" }}>
                  {aiResult.criticalGaps.map((skill) => (
                    <SkillCard key={skill} skill={skill} status="missing" variant="pill" />
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(aiResult.missingSkills) && aiResult.missingSkills.length > 0 && (
              <div className="ai-card">
                <h3>📚 Skills You Should Learn</h3>
                <div className="skill-list" style={{ marginTop: "10px" }}>
                  {aiResult.missingSkills.map((skill) => (
                    <SkillCard key={skill} skill={skill} status="missing" variant="pill" />
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(aiResult.learningPriorities) && aiResult.learningPriorities.length > 0 && (
              <div className="ai-card">
                <h3>🔥 Learning Priorities</h3>
                <div className="learning-priority-list">
                  {aiResult.learningPriorities.map((item, index) => (
                    <div className="learning-priority-card" key={`${item.skill}-${index}`}>
                      <div className="priority-number">{index + 1}</div>
                      <div className="priority-content">
                        <div className="priority-title-row">
                          <h4>{item.skill}</h4>
                          <span
                            className={`priority priority--${item.priority
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

            {aiResult.recommendation && (
              <div className="ai-card ai-recommendation">
                <h3>💡 Strategic Recommendation</h3>
                <p>{aiResult.recommendation}</p>
              </div>
            )}

            {Array.isArray(aiResult.nextSteps) && aiResult.nextSteps.length > 0 && (
              <div className="ai-card">
                <h3>🚀 Recommended Next Steps</h3>
                <ol className="ai-next-steps">
                  {aiResult.nextSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rule-Based Recommendations Fallback / Complement */}
      {missingSkills.length > 0 && (
        <div className="recommendations" style={{ marginTop: "32px" }}>
          <h2>💡 Skill Development Guides</h2>
          <p className="dashboard-card-sub" style={{ marginBottom: "20px" }}>
            Practical overview of high-impact skills to acquire for <strong>{selectedRole}</strong>.
          </p>

          <div className="recommendation-list">
            {missingSkills.map((skill) => {
              const rec = skillRecommendations[skill];
              return (
                <div className="recommendation-card" key={skill}>
                  <div className="recommendation-header">
                    <h3>{skill}</h3>
                    <span
                      className={`priority priority--${
                        rec?.priority?.toLowerCase() || "medium"
                      }`}
                    >
                      {rec?.priority || "Medium"} Priority
                    </span>
                  </div>

                  <p className="recommendation-description">
                    {rec?.description || `Learn ${skill} to strengthen your readiness for ${selectedRole}.`}
                  </p>

                  <div className="learning-topics">
                    <strong>What to learn:</strong>
                    <span>{rec?.topics || `Core concepts and practical projects with ${skill}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillGap;