const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  analyzeSkillGap,
  generateProjectRecommendations,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} = require("../services/aiService");

const router = express.Router();

// AI Skill Gap Analysis
router.post("/skill-gap", authMiddleware, async (req, res) => {
  try {
    const { resumeSkills, targetRole } = req.body;

    if (!resumeSkills || !targetRole) {
      return res.status(400).json({
        error: "resumeSkills and targetRole are required",
      });
    }

    const skillsArray = Array.isArray(resumeSkills)
      ? resumeSkills
      : Object.values(resumeSkills).flat();

    const result = await analyzeSkillGap(skillsArray, targetRole);

    res.json(result);
  } catch (error) {
    console.error("AI Skill Gap Error:", error);

    res.status(500).json({
      error: error.message || "Failed to analyze skill gap",
    });
  }
});

// AI Career Analysis (alias — same logic but explicit)
router.post("/career-analysis", authMiddleware, async (req, res) => {
  try {
    const { resumeSkills, targetRole } = req.body;

    if (!resumeSkills || !targetRole) {
      return res.status(400).json({
        error: "resumeSkills and targetRole are required",
      });
    }

    const skillsArray = Array.isArray(resumeSkills)
      ? resumeSkills
      : Object.values(resumeSkills).flat();

    const result = await analyzeSkillGap(skillsArray, targetRole);

    res.json(result);
  } catch (error) {
    console.error("AI Career Analysis Error:", error);

    res.status(500).json({
      error: error.message || "Failed to generate career analysis",
    });
  }
});

// AI Project Recommendations
router.post("/projects", authMiddleware, async (req, res) => {
  try {
    const { skills, targetRole, skillGaps, learningPriorities } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        error: "targetRole is required",
      });
    }

    const result = await generateProjectRecommendations(
      skills || [],
      targetRole,
      skillGaps || [],
      learningPriorities || []
    );

    res.json(result);
  } catch (error) {
    console.error("AI Projects Error:", error);

    res.status(500).json({
      error: error.message || "Failed to generate project recommendations",
    });
  }
});

// AI Interview Questions
router.post("/interview/questions", authMiddleware, async (req, res) => {
  try {
    const { targetRole, interviewType, difficulty, skills } = req.body;

    if (!targetRole || !interviewType || !difficulty) {
      return res.status(400).json({
        error: "targetRole, interviewType, and difficulty are required",
      });
    }

    const result = await generateInterviewQuestions(
      targetRole,
      interviewType,
      difficulty,
      skills || []
    );

    res.json(result);
  } catch (error) {
    console.error("AI Interview Questions Error:", error);

    res.status(500).json({
      error: error.message || "Failed to generate interview questions",
    });
  }
});

// AI Interview Evaluation
router.post("/interview/evaluate", authMiddleware, async (req, res) => {
  try {
    const { question, answer, targetRole, skills } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        error: "question and answer are required",
      });
    }

    const result = await evaluateInterviewAnswer(
      question,
      answer,
      targetRole || "General",
      skills || []
    );

    res.json(result);
  } catch (error) {
    console.error("AI Interview Evaluation Error:", error);

    res.status(500).json({
      error: error.message || "Failed to evaluate interview answer",
    });
  }
});

module.exports = router;
