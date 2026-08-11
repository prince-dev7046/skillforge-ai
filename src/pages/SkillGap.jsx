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

  useEffect(() => {
    localStorage.setItem("targetRole", selectedRole);
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

    </div>
  );
}

export default SkillGap;