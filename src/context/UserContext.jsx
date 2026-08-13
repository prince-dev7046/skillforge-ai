import { createContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [skillData, setSkillData] = useState({
    targetRole: "",
    resumeSkills: {},
    skillGap: { matchedSkills: [], missingSkills: [] },
    aiSkillAnalysis: {},
    roadmap: [],
    projects: [],
    interviewHistory: [],
    notifications: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const profile = await api.getProfile();
      setUser(profile);

      const data = await api.getSkillForgeData();
      setSkillData(data);
    } catch (err) {
      console.error("Context Data Fetch Error:", err);
      setError(err.message || "Failed to load user session.");
      // Token might be invalid
      if (err.message.includes("401") || err.message.includes("token")) {
        localStorage.removeItem("token");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleLogin = async (email, password) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.login(email, password);
      localStorage.setItem("token", response.token);
      await refreshData();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      setLoading(true);
      setError("");
      const response = await api.register(name, email, password);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSkillData({
      targetRole: "",
      resumeSkills: {},
      skillGap: { matchedSkills: [], missingSkills: [] },
      aiSkillAnalysis: {},
      roadmap: [],
      projects: [],
      interviewHistory: [],
      notifications: [],
    });
  };

  const updateProfile = async (name, targetRole) => {
    try {
      setLoading(true);
      const response = await api.updateProfile(name, targetRole);
      setUser(response.user);
      // Sync SkillForge data which might have changed due to target role recalculations
      const data = await api.getSkillForgeData();
      setSkillData(data);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSkillData = async (fieldsToUpdate) => {
    try {
      const response = await api.updateSkillForgeData(fieldsToUpdate);
      setSkillData(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const triggerAISkillAnalysis = async (targetRole, resumeSkills) => {
    try {
      setLoading(true);
      const result = await api.analyzeSkillGap(targetRole, resumeSkills);
      // Re-fetch skillforge data to load newly generated AI roadmap & assessment in context
      const data = await api.getSkillForgeData();
      setSkillData(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        skillData,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshData,
        updateProfile,
        updateSkillData,
        triggerAISkillAnalysis,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
