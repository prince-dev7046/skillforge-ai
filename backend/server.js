const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { analyzeSkillGap } = require("./services/aiService");

const app = express();

app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "SkillForge AI Backend is running!"
  });
});

// AI Skill Gap route
app.post("/api/ai/skill-gap", async (req, res) => {
  try {
    const { resumeSkills, targetRole } = req.body;

    // Validate input
    if (!resumeSkills || !targetRole) {
      return res.status(400).json({
        error: "resumeSkills and targetRole are required"
      });
    }

    // Call Gemini AI
    const result = await analyzeSkillGap(resumeSkills, targetRole);

    res.json(result);

  } catch (error) {
    console.error("AI Skill Gap Error:", error);

    res.status(500).json({
      error: "Failed to analyze skill gap"
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});