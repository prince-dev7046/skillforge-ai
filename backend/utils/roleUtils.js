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
    topics: ["Semantic HTML", "Forms", "Tables", "Accessibility"],
    miniProject: "Build a semantic personal portfolio page.",
  },
  CSS: {
    priority: "High",
    description: "Learn CSS to create responsive and visually appealing web interfaces.",
    topics: ["Flexbox", "Grid", "Responsive Design", "CSS Variables"],
    miniProject: "Style a responsive pricing cards page.",
  },
  JavaScript: {
    priority: "High",
    description: "JavaScript is essential for creating interactive web applications.",
    topics: ["ES6+", "DOM Manipulation", "Promises & Async/Await", "Fetch API"],
    miniProject: "Build an interactive dashboard dashboard interface.",
  },
  React: {
    priority: "High",
    description: "React is widely used to build modern component-based frontend applications.",
    topics: ["Components & Props", "State Management", "Hooks (useEffect, useState)", "React Router"],
    miniProject: "Build a multi-page product catalog.",
  },
  "Node.js": {
    priority: "High",
    description: "Node.js allows you to build scalable backend applications using JavaScript.",
    topics: ["CommonJS & ES Modules", "File System module", "npm package management", "Events & Streams"],
    miniProject: "Build a command-line file organiser tool.",
  },
  "Express.js": {
    priority: "Medium",
    description: "Express.js is a popular Node.js framework for building backend APIs.",
    topics: ["Routing", "Middleware", "Request/Response handling", "Error Handling"],
    miniProject: "Build a CRUD API for a task tracker.",
  },
  MongoDB: {
    priority: "Medium",
    description: "MongoDB is a NoSQL database commonly used in modern web applications.",
    topics: ["Mongoose Schemas", "CRUD operations", "Querying & Filtering", "Relationships & Population"],
    miniProject: "Connect task tracker API to MongoDB database.",
  },
  SQL: {
    priority: "High",
    description: "SQL is essential for working with relational databases and structured data.",
    topics: ["SELECT queries & filtering", "JOINS & relationships", "Aggregations & Group By", "Indexes"],
    miniProject: "Design and query an employee management system DB.",
  },
  Git: {
    priority: "Medium",
    description: "Git is essential for version control and collaborating on software projects.",
    topics: ["Init, clone & commits", "Branching & merging", "Resolving conflicts", "GitHub Pull Requests"],
    miniProject: "Publish a repository to GitHub using command line Git.",
  },
  Python: {
    priority: "High",
    description: "Python is the primary language for machine learning and data science.",
    topics: ["Syntax & data types", "Control flow & functions", "OOP concepts", "File handling & modules"],
    miniProject: "Write a command-line web scraper script.",
  },
  NumPy: {
    priority: "High",
    description: "NumPy provides powerful tools for numerical computing and array operations.",
    topics: ["Arrays & indexing", "Array operations & broadcasting", "Vectorization", "Linear algebra basics"],
    miniProject: "Perform matrix manipulations on structural datasets.",
  },
  Pandas: {
    priority: "High",
    description: "Pandas is essential for cleaning, transforming, and analyzing datasets.",
    topics: ["DataFrames & Series", "Data importing & cleaning", "Data aggregation & grouping", "Merging datasets"],
    miniProject: "Clean and analyze a raw sales transactions dataset.",
  },
  Matplotlib: {
    priority: "Medium",
    description: "Matplotlib helps you visualize datasets and understand patterns in data.",
    topics: ["Basic line/bar plots", "Histograms & scatter plots", "Subplots & figures", "Formatting charts"],
    miniProject: "Create a dashboard dashboard displaying business insights.",
  },
  "Scikit-learn": {
    priority: "High",
    description: "Scikit-learn provides tools for building and evaluating machine learning models.",
    topics: ["Supervised classification", "Linear & logistic regression", "Feature scaling", "Cross-validation"],
    miniProject: "Train a model to predict housing prices.",
  },
  "Machine Learning": {
    priority: "High",
    description: "Machine learning is fundamental for developing predictive and intelligent applications.",
    topics: ["Supervised vs Unsupervised learning", "Bias-Variance tradeoff", "Underfitting vs Overfitting", "Hyperparameter tuning"],
    miniProject: "Build an end-to-end customer churn predictor system.",
  },
  Statistics: {
    priority: "High",
    description: "Statistics provides the mathematical foundation needed for data analysis and ML.",
    topics: ["Probability theory", "Probability distributions", "Hypothesis testing", "Correlation & regression"],
    miniProject: "Perform A/B test analysis on user conversion rates.",
  },
  Java: {
    priority: "High",
    description: "Java is widely used for backend development and enterprise applications.",
    topics: ["Java syntax & variables", "Object-Oriented programming", "Collection framework", "Exception Handling"],
    miniProject: "Build a bank account simulator in Java.",
  },
  "REST API": {
    priority: "High",
    description: "REST APIs allow frontend and backend applications to communicate.",
    topics: ["HTTP Methods (GET, POST, etc.)", "URL design & routes", "Status codes", "Headers & JSON exchange"],
    miniProject: "Build a REST API for a digital book library.",
  },
};

function calculateSkillGap(resumeSkills, targetRole) {
  if (!targetRole || !roleSkills[targetRole]) {
    return { matchedSkills: [], missingSkills: [] };
  }

  const required = roleSkills[targetRole];
  
  // Normalize user skills list for comparison
  let flatResumeSkills = [];
  if (Array.isArray(resumeSkills)) {
    flatResumeSkills = resumeSkills;
  } else if (typeof resumeSkills === "object" && resumeSkills !== null) {
    flatResumeSkills = Object.values(resumeSkills).flat();
  }

  const normalizedResume = flatResumeSkills.map((s) => s.trim().toLowerCase());

  const matchedSkills = required.filter((reqSkill) =>
    normalizedResume.includes(reqSkill.toLowerCase())
  );

  const missingSkills = required.filter(
    (reqSkill) => !normalizedResume.includes(reqSkill.toLowerCase())
  );

  return { matchedSkills, missingSkills };
}

function generateDefaultRoadmap(targetRole, resumeSkills) {
  const { missingSkills } = calculateSkillGap(resumeSkills, targetRole);

  const roadmapItems = missingSkills.map((skill, index) => {
    const rec = skillRecommendations[skill] || {
      priority: "Medium",
      description: `Learn ${skill} to master foundational requirements for the ${targetRole} role.`,
      topics: [`${skill} Fundamentals`, `${skill} core features`, `${skill} tools`],
      miniProject: `Build a starter project using ${skill}.`,
    };

    return {
      id: index + 1,
      skill,
      priority: rec.priority === "High" ? 1 : rec.priority === "Medium" ? 2 : 3,
      difficulty: rec.priority === "High" ? "Beginner" : "Intermediate",
      duration: rec.priority === "High" ? "1 week" : "2 weeks",
      reason: rec.description,
      topics: rec.topics,
      miniProject: rec.miniProject,
      prerequisites: [],
      status: "Not Started",
    };
  });

  return roadmapItems;
}

module.exports = {
  roleSkills,
  calculateSkillGap,
  generateDefaultRoadmap,
};
