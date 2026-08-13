const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { roleSkills } = require("../utils/roleUtils");

const router = express.Router();

// GET user progress analytics
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const targetRole = user.targetRole || "No Target Role Selected";
    
    // Skills counts
    const flatResumeSkills = user.resumeSkills
      ? (Array.isArray(user.resumeSkills) ? user.resumeSkills : Object.values(user.resumeSkills).flat())
      : [];

    const completedRoadmapSkills = (user.roadmap || [])
      .filter((item) => item.status === "Completed")
      .map((item) => item.skill);

    // Unique skills mastered/learned (resume skills + completed roadmap modules)
    const masteredSkillsSet = new Set([
      ...flatResumeSkills.map((s) => s.toLowerCase()),
      ...completedRoadmapSkills.map((s) => s.toLowerCase())
    ]);

    const totalMasteredCount = masteredSkillsSet.size;

    // Roadmap Progress
    const roadmapTotalCount = user.roadmap ? user.roadmap.length : 0;
    const roadmapCompletedCount = completedRoadmapSkills.length;
    const roadmapInProgressCount = (user.roadmap || []).filter((item) => item.status === "In Progress").length;
    const roadmapCompletionRate = roadmapTotalCount > 0 
      ? Math.round((roadmapCompletedCount / roadmapTotalCount) * 100) 
      : 0;

    // Skill Gap Reduction
    let skillGapReduction = 0;
    let matchPercentage = user.aiSkillAnalysis?.skillMatchPercentage || 0;

    if (user.targetRole && roleSkills[user.targetRole]) {
      const required = roleSkills[user.targetRole];
      const matched = required.filter(skill => 
        masteredSkillsSet.has(skill.toLowerCase())
      );
      skillGapReduction = required.length > 0 
        ? Math.round((matched.length / required.length) * 100)
        : 0;
      
      if (!matchPercentage) {
        matchPercentage = skillGapReduction;
      }
    }

    // Projects Progress
    const projectsTotalCount = user.projects ? user.projects.length : 0;
    const projectsCompletedCount = (user.projects || []).filter((p) => p.status === "Completed").length;
    const projectsInProgressCount = (user.projects || []).filter((p) => p.status === "In Progress").length;

    // Interview Performance
    let totalScore = 0;
    let totalQuestionsEvaluated = 0;
    
    (user.interviewHistory || []).forEach((session) => {
      (session.questions || []).forEach((q) => {
        if (q.score) {
          totalScore += q.score;
          totalQuestionsEvaluated++;
        }
      });
    });

    const averageInterviewScore = totalQuestionsEvaluated > 0 
      ? parseFloat((totalScore / totalQuestionsEvaluated).toFixed(1)) 
      : 0;

    // Compile analytics object
    const analytics = {
      targetRole,
      careerReadiness: user.aiSkillAnalysis?.careerReadiness || "Beginner",
      skillsMasteredCount: totalMasteredCount,
      resumeSkillsCount: flatResumeSkills.length,
      skillGapReduction,
      skillMatchPercentage: matchPercentage,
      roadmap: {
        total: roadmapTotalCount,
        completed: roadmapCompletedCount,
        inProgress: roadmapInProgressCount,
        completionRate: roadmapCompletionRate
      },
      projects: {
        total: projectsTotalCount,
        completed: projectsCompletedCount,
        inProgress: projectsInProgressCount
      },
      interviews: {
        questionsAnswered: totalQuestionsEvaluated,
        averageScore: averageInterviewScore
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error("Progress Analytics Error:", error);
    res.status(500).json({ error: "Failed to generate progress analytics" });
  }
});

module.exports = router;
