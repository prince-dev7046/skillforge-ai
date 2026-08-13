const API_BASE = "http://localhost:5000/api";

// Helper to make API requests with Authorization header
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Session expired or unauthorized
    if (response.status === 401) {
      localStorage.removeItem("token");
      // Use window location redirect to force layout re-render & redirect to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: async (email, password) => {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password) => {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  // User & Profile
  getProfile: async () => {
    return request("/user/profile");
  },

  updateProfile: async (name, targetRole) => {
    return request("/user/profile", {
      method: "PUT",
      body: JSON.stringify({ name, targetRole }),
    });
  },

  // SkillForge Data
  getSkillForgeData: async () => {
    return request("/user/skillforge-data");
  },

  updateSkillForgeData: async (data) => {
    return request("/user/skillforge-data", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Projects
  getProjects: async () => {
    return request("/projects");
  },

  addProject: async (projectData) => {
    return request("/projects", {
      method: "POST",
      body: JSON.stringify(projectData),
    });
  },

  generateProjects: async () => {
    return request("/projects", {
      method: "POST",
      body: JSON.stringify({ generate: true }),
    });
  },

  updateProjectStatus: async (id, status) => {
    return request(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  deleteProject: async (id) => {
    return request(`/projects/${id}`, {
      method: "DELETE",
    });
  },

  // AI Actions
  analyzeSkillGap: async (targetRole, resumeSkills) => {
    return request("/ai/skill-gap", {
      method: "POST",
      body: JSON.stringify({ targetRole, resumeSkills }),
    });
  },

  generateInterviewQuestions: async (interviewType, difficulty) => {
    return request("/ai/interview/questions", {
      method: "POST",
      body: JSON.stringify({ interviewType, difficulty }),
    });
  },

  evaluateInterviewAnswer: async (question, userAnswer, interviewType, difficulty) => {
    return request("/ai/interview/evaluate", {
      method: "POST",
      body: JSON.stringify({ question, userAnswer, interviewType, difficulty }),
    });
  },

  // Progress Analytics
  getProgressAnalytics: async () => {
    return request("/progress");
  },

  // Notifications
  getNotifications: async () => {
    return request("/notifications");
  },

  markNotificationRead: async (id) => {
    return request(`/notifications/${id}`, {
      method: "PUT",
    });
  },

  markAllNotificationsRead: async () => {
    return request("/notifications/read-all", {
      method: "PUT",
    });
  },
};
