const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const {
  analyzeSkillGap,
  generateProjectRecommendations,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} = require("../services/aiService");

const router = express.Router();

// AI Skill Gap & Roadmap generator
router.post("/skill-gap", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const targetRole = req.body.targetRole || user.targetRole;
    if (!targetRole) {
      return res.status(400).json({ error: "Target role is required" });
    }

    let resumeSkills = req.body.resumeSkills || user.resumeSkills;
    // Normalize user skills to array
    let flatSkills = [];
    if (Array.isArray(resumeSkills)) {
      flatSkills = resumeSkills;
    } else if (typeof resumeSkills === "object" && resumeSkills !== null) {
      flatSkills = Object.values(resumeSkills).flat();
    }

    if (flatSkills.length === 0) {
      return res.status(400).json({ error: "Please upload a resume and extract skills first." });
    }

    console.log("Requesting Gemini AI analysis for user:", user._id, "role:", targetRole);
    const result = await analyzeSkillGap(flatSkills, targetRole);

    // Save to user model
    user.aiSkillAnalysis = {
      targetRole: result.targetRole,
      overallAssessment: result.overallAssessment,
      matchedSkills: result.matchedSkills || [],
      missingSkills: result.missingSkills || [],
      skillMatchPercentage: result.skillMatchPercentage || 0,
      careerReadiness: result.careerReadiness || "Developing",
      criticalGaps: result.criticalGaps || [],
      learningPriorities: result.learningPriorities || [],
      recommendation: result.recommendation || "",
      nextSteps: result.nextSteps || [],
    };

    user.skillGap = {
      matchedSkills: result.matchedSkills || [],
      missingSkills: result.missingSkills || [],
    };

    // Convert AI roadmap items to user roadmap schema (retaining statuses if skills match, else setting to Not Started)
    const existingRoadmap = user.roadmap || [];
    const statusMap = {};
    existingRoadmap.forEach(item => {
      statusMap[item.skill] = item.status;
    });

    user.roadmap = (result.roadmap || []).map((item, index) => ({
      id: index + 1,
      skill: item.skill,
      priority: item.priority || index + 1,
      difficulty: item.difficulty || "Intermediate",
      duration: item.duration || "1 week",
      reason: item.reason || `Learn ${item.skill} for your target role.`,
      topics: item.topics || [],
      miniProject: item.miniProject || `Build a project using ${item.skill}`,
      prerequisites: item.prerequisites || [],
      status: statusMap[item.skill] || "Not Started",
    }));

    user.targetRole = targetRole;

    // Log notification
    user.notifications.unshift({
      text: `AI career analysis and personalized learning roadmap generated for ${targetRole}.`,
      type: "skill-gap",
      date: new Date(),
      read: false
    });

    await user.save();
    res.json(result);

  } catch (error) {
    console.error("AI Skill Gap Error:", error);
    res.status(500).json({ error: "Failed to analyze skill gap with Gemini AI" });
  }
});

// AI Career Analysis (for fetching or triggering same analysis)
router.post("/career-analysis", authMiddleware, async (req, res) => {
  // Direct mapping to skill gap endpoint or returning current analysis
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.aiSkillAnalysis && user.aiSkillAnalysis.overallAssessment) {
      return res.json(user.aiSkillAnalysis);
    }
    // If not generated yet, trigger it
    return res.status(400).json({ error: "AI analysis not generated yet. Please run skill gap analysis first." });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch career analysis" });
  }
});

// AI Projects generation helper
router.post("/projects", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const flatSkills = user.resumeSkills 
      ? (Array.isArray(user.resumeSkills) ? user.resumeSkills : Object.values(user.resumeSkills).flat())
      : [];
    
    const missingSkills = user.skillGap?.missingSkills || [];
    const learningPriorities = user.aiSkillAnalysis?.learningPriorities?.map(p => p.skill) || [];

    if (!user.targetRole) {
      return res.status(400).json({ error: "Please select a target role first." });
    }

    const projects = await generateProjectRecommendations(
      flatSkills,
      user.targetRole,
      missingSkills,
      learningPriorities
    );

    res.json(projects);
  } catch (error) {
    console.error("AI Projects Generation Error:", error);
    res.status(500).json({ error: "Failed to generate project recommendations" });
  }
});

// Generate Interview Questions
router.post("/interview/questions", authMiddleware, async (req, res) => {
  try {
    const { interviewType, difficulty } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.targetRole) {
      return res.status(400).json({ error: "Please select a target role before practicing interviews." });
    }

    const flatSkills = user.resumeSkills 
      ? (Array.isArray(user.resumeSkills) ? user.resumeSkills : Object.values(user.resumeSkills).flat())
      : [];

    console.log("Generating interview questions for user:", user._id);
    const questions = await generateInterviewQuestions(
      user.targetRole,
      interviewType || "Technical",
      difficulty || "Intermediate",
      flatSkills
    );

    res.json(questions);
  } catch (error) {
    console.error("AI Interview Questions Error:", error);
    res.status(500).json({ error: "Failed to generate interview questions" });
  }
});

// Evaluate Interview Answer
router.post("/interview/evaluate", authMiddleware, async (req, res) => {
  try {
    const { question, userAnswer, interviewType, difficulty } = req.body;
    if (!question || !userAnswer) {
      return res.status(400).json({ error: "Question and userAnswer are required for evaluation." });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const flatSkills = user.resumeSkills 
      ? (Array.isArray(user.resumeSkills) ? user.resumeSkills : Object.values(user.resumeSkills).flat())
      : [];

    console.log("Evaluating interview answer via Gemini...");
    const evaluation = await evaluateInterviewAnswer(
      question,
      userAnswer,
      user.targetRole || "Candidate",
      flatSkills
    );

    // Save mock session to interview history
    const session = {
      targetRole: user.targetRole || "Unknown Role",
      interviewType: interviewType || "Technical",
      difficulty: difficulty || "Intermediate",
      questions: [
        {
          question,
          userAnswer,
          score: evaluation.score || 0,
          feedback: {
            strengths: evaluation.strengths || "",
            weaknesses: evaluation.weaknesses || "",
            improvedAnswer: evaluation.improvedAnswer || "",
            tips: evaluation.tips || "",
          },
        },
      ],
    };

    user.interviewHistory.push(session);

    // Log notification if score is high
    if (evaluation.score >= 8) {
      user.notifications.unshift({
        text: `Great job! You scored ${evaluation.score}/10 on a mock interview question for ${user.targetRole}.`,
        type: "interview",
        date: new Date(),
        read: false
      });
    } else {
      user.notifications.unshift({
        text: `Completed interview practice question. Score: ${evaluation.score}/10. Keep practicing!`,
        type: "interview",
        date: new Date(),
        read: false
      });
    }

    await user.save();
    res.json(evaluation);

  } catch (error) {
    console.error("AI Interview Evaluation Error:", error);
    res.status(500).json({ error: "Failed to evaluate interview answer" });
  }
});

module.exports = router;
