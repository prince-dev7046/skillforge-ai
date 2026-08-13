const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const { analyzeSkillGap } = require("./services/aiService");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "SkillForge AI Backend is running!"
  });
});

// Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated!",
    userId: req.user.userId,
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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });