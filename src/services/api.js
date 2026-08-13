const API_BASE = "http://localhost:5000/api";

// Get stored JWT token
function getToken() {
  return localStorage.getItem("token");
}

// Centralized fetch with JWT and error handling
async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle expired/invalid token
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Session expired. Please login again.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

// ==================
// Auth
// ==================

export async function loginUser(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(name, email, password) {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

// ==================
// Profile
// ==================

export async function getProfile() {
  return apiFetch("/user/profile");
}

export async function updateProfile(data) {
  return apiFetch("/user/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ==================
// SkillForge Data
// ==================

export async function getSkillForgeData() {
  return apiFetch("/user/skillforge-data");
}

export async function updateSkillForgeData(data) {
  return apiFetch("/user/skillforge-data", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ==================
// AI
// ==================

export async function analyzeSkillGapAI(resumeSkills, targetRole) {
  return apiFetch("/ai/skill-gap", {
    method: "POST",
    body: JSON.stringify({ resumeSkills, targetRole }),
  });
}

export async function generateCareerAnalysis(resumeSkills, targetRole) {
  return apiFetch("/ai/career-analysis", {
    method: "POST",
    body: JSON.stringify({ resumeSkills, targetRole }),
  });
}

export async function generateProjectsAI(skills, targetRole, skillGaps, learningPriorities) {
  return apiFetch("/ai/projects", {
    method: "POST",
    body: JSON.stringify({ skills, targetRole, skillGaps, learningPriorities }),
  });
}

export async function generateInterviewQuestionsAI(targetRole, interviewType, difficulty, skills) {
  return apiFetch("/ai/interview/questions", {
    method: "POST",
    body: JSON.stringify({ targetRole, interviewType, difficulty, skills }),
  });
}

export async function evaluateInterviewAnswerAI(question, answer, targetRole, skills) {
  return apiFetch("/ai/interview/evaluate", {
    method: "POST",
    body: JSON.stringify({ question, answer, targetRole, skills }),
  });
}
