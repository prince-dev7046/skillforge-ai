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

function SkillGap() {
  const [resumeSkills, setResumeSkills] = useState([]);
  const [selectedRole, setSelectedRole] = useState(
    "Full Stack Developer"
  );

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

      {missingSkills.length > 0 && (

        <div className="recommendations">

          <h2>💡 Recommended Skills to Learn</h2>

          <p>
            Focus on these skills to improve your match for{" "}
            <strong>{selectedRole}</strong>:
          </p>

          <ul>

            {missingSkills.map((skill) => (
              <li key={skill}>
                Learn <strong>{skill}</strong>
              </li>
            ))}

          </ul>

        </div>

      )}

    </div>
  );
}

export default SkillGap;