const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("Profile Error:", error);

    res.status(500).json({
      error: "Failed to fetch profile",
    });
  }
});

// Update logged-in user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, targetRole } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    const updateData = { name };

    // Only update targetRole if provided
    if (targetRole !== undefined) {
      updateData.targetRole = targetRole;
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      error: "Failed to update profile",
    });
  }
});

// Get user's SkillForge data
router.get("/skillforge-data", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "targetRole resumeSkills skillGap aiSkillAnalysis roadmapProgress projects interviewHistory notifications"
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    console.error("SkillForge Data Error:", error);

    res.status(500).json({
      error: "Failed to fetch SkillForge data",
    });
  }
});

// Update user's SkillForge data (partial update)
router.put("/skillforge-data", authMiddleware, async (req, res) => {
  try {
    const allowedFields = [
      "targetRole",
      "resumeSkills",
      "skillGap",
      "aiSkillAnalysis",
      "roadmapProgress",
      "projects",
      "interviewHistory",
      "notifications",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: "No valid fields to update",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      message: "SkillForge data updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update SkillForge Data Error:", error);

    res.status(500).json({
      error: "Failed to update SkillForge data",
    });
  }
});

module.exports = router;