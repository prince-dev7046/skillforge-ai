const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Helper to clean and parse AI JSON responses
function parseAIResponse(text) {
  const cleanedText = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleanedText);
}

// Fallback curated projects by role
const fallbackProjects = {
  "Full Stack Developer": [
    {
      id: "fs-project-1",
      title: "Full-Stack Task & Workflow Automation Hub",
      description: "Build a responsive web application featuring user authentication, interactive Kanban boards, and real-time activity feeds.",
      difficulty: "Beginner",
      estimatedDuration: "1-2 weeks",
      requiredSkills: ["JavaScript", "HTML", "CSS", "React", "Node.js"],
      whyThisProject: "Demonstrates core end-to-end full stack competence with authentication and state management.",
      features: [
        "User registration and JWT login",
        "Interactive drag-and-drop task boards",
        "REST API endpoints with validation",
        "Responsive desktop and mobile layout"
      ],
      suggestedTechStack: ["React", "Express.js", "MongoDB", "CSS"],
      status: "Not Started"
    },
    {
      id: "fs-project-2",
      title: "AI-Enhanced Job Application Tracker",
      description: "Create a SaaS platform allowing job seekers to log applications, track interview stages, and generate tailored resume keywords.",
      difficulty: "Intermediate",
      estimatedDuration: "2-3 weeks",
      requiredSkills: ["React", "Node.js", "Express.js", "MongoDB", "REST API"],
      whyThisProject: "High-value portfolio project demonstrating API integration and database schema design.",
      features: [
        "Application status pipelines",
        "Resume skill matching scoring",
        "Search, filter, and sorting metrics",
        "CSV export and analytics charts"
      ],
      suggestedTechStack: ["React", "Node.js", "MongoDB", "Express.js"],
      status: "Not Started"
    },
    {
      id: "fs-project-3",
      title: "Real-Time Collaborative Document Workspace",
      description: "An advanced collaborative platform with live multi-user editing, revision history, and role-based permissions.",
      difficulty: "Advanced",
      estimatedDuration: "3-4 weeks",
      requiredSkills: ["React", "Node.js", "WebSockets", "MongoDB", "SQL"],
      whyThisProject: "Highlights expertise in asynchronous concurrency, WebSockets, and complex state synchronization.",
      features: [
        "Live concurrent document editing",
        "Granular team access control",
        "Version history snapshots",
        "Production deployment & CI/CD"
      ],
      suggestedTechStack: ["React", "Node.js", "Socket.io", "MongoDB"],
      status: "Not Started"
    }
  ],
  "Backend Developer": [
    {
      id: "be-project-1",
      title: "High-Throughput URL Shortener & Analytics API",
      description: "Architect a resilient REST API for URL redirection with custom aliases, click rate analytics, and Redis caching.",
      difficulty: "Beginner",
      estimatedDuration: "1-2 weeks",
      requiredSkills: ["Node.js", "Express.js", "SQL", "REST API"],
      whyThisProject: "Core backend architecture demonstrating caching, hashing, and database indexing.",
      features: [
        "Base62 URL shortening algorithm",
        "Redis caching for fast redirection",
        "Geographical and referrer analytics logging",
        "Rate limiting middleware"
      ],
      suggestedTechStack: ["Node.js", "Express.js", "PostgreSQL", "Redis"],
      status: "Not Started"
    },
    {
      id: "be-project-2",
      title: "Scalable Microservices E-Commerce Core",
      description: "Develop decoupled services for user auth, product catalog, cart management, and order processing.",
      difficulty: "Intermediate",
      estimatedDuration: "2-3 weeks",
      requiredSkills: ["Java", "Node.js", "MongoDB", "SQL", "REST API"],
      whyThisProject: "Validates distributed systems design, data consistency, and API gateway routing.",
      features: [
        "JWT + OAuth2 authentication service",
        "Catalog service with full-text search",
        "ACID compliant order transaction management",
        "Dockerized microservice environment"
      ],
      suggestedTechStack: ["Node.js / Java Spring", "MongoDB", "Docker"],
      status: "Not Started"
    },
    {
      id: "be-project-3",
      title: "Distributed Task Queue & Job Scheduler",
      description: "A resilient background job processing engine with retries, exponential backoff, and priority queues.",
      difficulty: "Advanced",
      estimatedDuration: "3-4 weeks",
      requiredSkills: ["Node.js", "SQL", "Redis", "Git"],
      whyThisProject: "Shows mastery over asynchronous event-driven backend engineering.",
      features: [
        "Priority job queue distribution",
        "Dead-letter queues and retry handlers",
        "Worker concurrency scaling",
        "Real-time health monitoring endpoints"
      ],
      suggestedTechStack: ["Node.js", "Redis / BullMQ", "PostgreSQL"],
      status: "Not Started"
    }
  ],
  "Machine Learning Engineer": [
    {
      id: "ml-project-1",
      title: "Predictive Real Estate Valuation Model & API",
      description: "End-to-end regression model with data preprocessing pipelines, feature engineering, and a FastAPI inference server.",
      difficulty: "Beginner",
      estimatedDuration: "1-2 weeks",
      requiredSkills: ["Python", "NumPy", "Pandas", "Scikit-learn"],
      whyThisProject: "Demonstrates practical machine learning fundamentals and inference deployment.",
      features: [
        "Data cleaning and outlier removal",
        "Feature scaling and one-hot encoding",
        "Model training with cross-validation",
        "REST API serving real-time predictions"
      ],
      suggestedTechStack: ["Python", "Pandas", "Scikit-learn", "FastAPI"],
      status: "Not Started"
    },
    {
      id: "ml-project-2",
      title: "Customer Sentiment & Text Classification Engine",
      description: "Build an NLP classification pipeline that analyzes product reviews and customer feedback sentiment.",
      difficulty: "Intermediate",
      estimatedDuration: "2-3 weeks",
      requiredSkills: ["Python", "Pandas", "Machine Learning", "Scikit-learn"],
      whyThisProject: "Shows proficiency in text tokenization, embeddings, and classification metrics.",
      features: [
        "TF-IDF and subword tokenization",
        "Model benchmark evaluation (Precision, Recall, F1)",
        "Interactive dashboard for batch predictions",
        "Confidence score thresholding"
      ],
      suggestedTechStack: ["Python", "Scikit-learn", "Flask / Streamlit"],
      status: "Not Started"
    },
    {
      id: "ml-project-3",
      title: "Automated MLOps Training & Deployment Pipeline",
      description: "Production-grade CI/CD pipeline for model retraining, versioning, drift detection, and automated container deployment.",
      difficulty: "Advanced",
      estimatedDuration: "3-4 weeks",
      requiredSkills: ["Python", "Machine Learning", "Docker", "Git"],
      whyThisProject: "Essential for senior ML roles demonstrating production lifecycle management.",
      features: [
        "Model artifact versioning with DVC/MLflow",
        "Automated continuous training pipeline",
        "Data drift and performance monitoring",
        "Dockerized inference container"
      ],
      suggestedTechStack: ["Python", "MLflow", "Docker", "GitHub Actions"],
      status: "Not Started"
    }
  ],
  "Data Scientist": [
    {
      id: "ds-project-1",
      title: "Customer Segmentation & Behavioral Clustering",
      description: "Unsupervised learning project segmenting user personas based on purchasing behaviors and engagement metrics.",
      difficulty: "Beginner",
      estimatedDuration: "1-2 weeks",
      requiredSkills: ["Python", "Pandas", "NumPy", "Matplotlib", "Statistics"],
      whyThisProject: "Validates exploratory data analysis and cluster analysis capabilities.",
      features: [
        "Dimensionality reduction (PCA)",
        "K-Means and Hierarchical clustering",
        "Interactive demographic visualizations",
        "Business persona summary generation"
      ],
      suggestedTechStack: ["Python", "Pandas", "Matplotlib", "Seaborn"],
      status: "Not Started"
    },
    {
      id: "ds-project-2",
      title: "Churn Risk Prediction & Explainability Dashboard",
      description: "Predict customer churn probability with SHAP/LIME model interpretability for stakeholder insights.",
      difficulty: "Intermediate",
      estimatedDuration: "2-3 weeks",
      requiredSkills: ["Python", "Pandas", "Scikit-learn", "Machine Learning", "Statistics"],
      whyThisProject: "Demonstrates actionable business intelligence and model interpretability.",
      features: [
        "Class imbalance handling (SMOTE)",
        "Feature importance and SHAP value explainability",
        "Revenue risk calculation metrics",
        "Interactive executive summary dashboard"
      ],
      suggestedTechStack: ["Python", "Scikit-learn", "SHAP", "Streamlit"],
      status: "Not Started"
    }
  ]
};

// Helper for AI calls with fallback
async function callGemini(prompt, preferredModel = "gemini-2.0-flash-lite") {
  const modelsToTry = [preferredModel, "gemini-2.0-flash", "gemini-1.5-flash"];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      if (response && response.text) {
        return parseAIResponse(response.text);
      }
    } catch (error) {
      console.warn(`Gemini attempt with model ${model} failed:`, error.message);
      lastError = error;
    }
  }

  throw lastError || new Error("AI analysis could not be completed.");
}

async function analyzeSkillGap(resumeSkills, targetRole) {
  const prompt = `
You are an expert AI career mentor for SkillForge AI.

Your job is to analyze a user's current technical skills against the requirements of their target career role and create a personalized learning roadmap.

Target Role:
${targetRole}

User's Current Skills:
${Array.isArray(resumeSkills) ? resumeSkills.join(", ") : "None"}

Analyze the user's profile carefully.

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT include code fences.

Use EXACTLY this structure:

{
  "targetRole": "${targetRole}",
  "overallAssessment": "",
  "matchedSkills": [],
  "missingSkills": [],
  "skillMatchPercentage": 0,
  "careerReadiness": "Beginner|Developing|Intermediate|Job Ready",
  "criticalGaps": [],
  "learningPriorities": [
    {
      "skill": "",
      "priority": "High|Medium|Low",
      "reason": ""
    }
  ],
  "recommendation": "",
  "nextSteps": [],
  "roadmap": [
    {
      "skill": "",
      "priority": 1,
      "difficulty": "Beginner|Intermediate|Advanced",
      "duration": "1 week",
      "reason": "",
      "topics": [],
      "miniProject": "",
      "prerequisites": []
    }
  ]
}

Return ONLY the JSON object.
`;

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.error("AI Skill Gap Error, using structured fallback:", err.message);
    return {
      targetRole,
      overallAssessment: `Profile analysis for ${targetRole}. Focus on strengthening core missing competencies through hands-on project work.`,
      matchedSkills: resumeSkills.slice(0, 4),
      missingSkills: ["Core Architecture", "API Integration", "Database Optimization", "Automated Testing"],
      skillMatchPercentage: Math.min(85, Math.max(30, resumeSkills.length * 15)),
      careerReadiness: resumeSkills.length > 5 ? "Intermediate" : "Developing",
      criticalGaps: ["Advanced Concepts", "System Design"],
      learningPriorities: [
        { skill: "Core Architecture", priority: "High", reason: `Essential foundation for ${targetRole}` },
        { skill: "API Integration", priority: "Medium", reason: "Required for connected services" }
      ],
      recommendation: "Build portfolio projects demonstrating full stack development and end-to-end integration.",
      nextSteps: ["Complete roadmap modules", "Build 2 portfolio projects", "Practice mock interviews"],
      roadmap: [
        {
          skill: "Core Architecture",
          priority: 1,
          difficulty: "Beginner",
          duration: "1 week",
          reason: `Foundational knowledge for ${targetRole}`,
          topics: ["Architecture Patterns", "Best Practices", "State Management"],
          miniProject: "Build an architectural proof-of-concept",
          prerequisites: []
        }
      ]
    };
  }
}

async function generateProjectRecommendations(skills, targetRole, skillGaps, learningPriorities) {
  const prompt = `
You are an expert AI career mentor for SkillForge AI.

Generate 4 practical, portfolio-ready project recommendations for a user based on their profile.

Target Role: ${targetRole}
User's Current Skills: ${Array.isArray(skills) ? skills.join(", ") : "None provided"}
Skill Gaps: ${Array.isArray(skillGaps) ? skillGaps.join(", ") : "None"}

Return ONLY valid JSON without markdown code fences.

{
  "projects": [
    {
      "id": "proj-1",
      "title": "",
      "description": "",
      "difficulty": "Beginner|Intermediate|Advanced",
      "estimatedDuration": "1-2 weeks",
      "requiredSkills": [],
      "whyThisProject": "",
      "features": [],
      "suggestedTechStack": [],
      "status": "Not Started"
    }
  ]
}
`;

  try {
    const aiResult = await callGemini(prompt);
    if (aiResult && Array.isArray(aiResult.projects) && aiResult.projects.length > 0) {
      return aiResult;
    }
    throw new Error("AI returned empty project list");
  } catch (err) {
    console.warn("AI Projects generation error, using curated project templates:", err.message);
    const fallbackList = fallbackProjects[targetRole] || fallbackProjects["Full Stack Developer"];
    return { projects: fallbackList };
  }
}

async function generateInterviewQuestions(targetRole, interviewType, difficulty, skills) {
  const prompt = `
You are an expert AI interview coach for SkillForge AI.

Generate exactly 5 interview questions for:
Target Role: ${targetRole}
Interview Type: ${interviewType}
Difficulty: ${difficulty}
Candidate's Skills: ${Array.isArray(skills) ? skills.join(", ") : "General"}

Return ONLY valid JSON without markdown:

{
  "questions": [
    {
      "id": 1,
      "question": "",
      "category": "${interviewType}",
      "difficulty": "${difficulty}",
      "expectedTopics": []
    }
  ]
}
`;

  try {
    const aiResult = await callGemini(prompt);
    if (aiResult && Array.isArray(aiResult.questions) && aiResult.questions.length > 0) {
      return aiResult;
    }
    throw new Error("AI returned empty questions");
  } catch (err) {
    console.warn("AI Interview generation error, using curated questions:", err.message);
    return {
      questions: [
        {
          id: 1,
          question: `Explain how you would architect a scalable service for a ${targetRole} position, and what trade-offs you would consider.`,
          category: interviewType,
          difficulty: difficulty,
          expectedTopics: ["Architecture", "Scalability", "Data flow", "Trade-offs"]
        },
        {
          id: 2,
          question: "How do you handle asynchronous operations, error handling, and state management in complex applications?",
          category: interviewType,
          difficulty: difficulty,
          expectedTopics: ["Async/Await", "Error boundaries", "State flow"]
        },
        {
          id: 3,
          question: "Describe a challenging technical bug or performance bottleneck you encountered and how you diagnosed and resolved it.",
          category: interviewType,
          difficulty: difficulty,
          expectedTopics: ["STAR method", "Debugging tools", "Root cause analysis"]
        },
        {
          id: 4,
          question: "What security best practices do you implement when designing APIs, authentication, and database schemas?",
          category: interviewType,
          difficulty: difficulty,
          expectedTopics: ["JWT/Tokens", "Sanitization", "SQL/NoSQL injection prevention", "HTTPS"]
        },
        {
          id: 5,
          question: "How do you collaborate in a cross-functional team and ensure code quality through code reviews and testing?",
          category: interviewType,
          difficulty: difficulty,
          expectedTopics: ["Code reviews", "CI/CD", "Automated tests", "Communication"]
        }
      ]
    };
  }
}

async function evaluateInterviewAnswer(question, answer, targetRole, skills) {
  const prompt = `
You are an expert AI interview evaluator for SkillForge AI.

Evaluate this interview answer:
Question: ${question}
Answer: ${answer}
Target Role: ${targetRole}

Return ONLY valid JSON:

{
  "score": 8,
  "maxScore": 10,
  "strengths": ["Clear explanation"],
  "weaknesses": ["Could mention edge cases"],
  "improvedAnswer": "A comprehensive sample answer...",
  "tips": ["Use STAR method"],
  "overallFeedback": "Good solid response."
}
`;

  try {
    return await callGemini(prompt);
  } catch (err) {
    console.warn("AI evaluation error, generating structured evaluation:", err.message);
    const wordCount = (answer || "").trim().split(/\s+/).length;
    const estimatedScore = Math.min(9, Math.max(5, Math.round(wordCount / 15) + 4));

    return {
      score: estimatedScore,
      maxScore: 10,
      strengths: [
        "Demonstrates direct understanding of the core technical prompt",
        "Presents relevant practical concepts effectively"
      ],
      weaknesses: [
        "Could expand further on trade-offs and performance considerations",
        "Adding concrete metrics or quantifiable outcomes would elevate the answer"
      ],
      improvedAnswer: `In a production environment for a ${targetRole}, I would approach this by first defining the system constraints and requirements. Key strategies include modular separation of concerns, robust automated testing, and comprehensive logging/monitoring.`,
      tips: [
        "Structure complex technical responses with Situation, Task, Action, and Result (STAR).",
        "Always highlight trade-offs and alternative solutions considered."
      ],
      overallFeedback: "Strong foundation. Focusing on architectural trade-offs will make your responses stand out to interviewers."
    };
  }
}

module.exports = {
  analyzeSkillGap,
  generateProjectRecommendations,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
};