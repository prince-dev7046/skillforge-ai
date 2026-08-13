const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { calculateSkillGap, generateDefaultRoadmap } = require("../utils/roleUtils");

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

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    let roleChanged = false;

    if (name) {
      user.name = name;
    }

    if (targetRole !== undefined && targetRole !== user.targetRole) {
      user.targetRole = targetRole;
      roleChanged = true;

      // Automatically recalculate gaps and update roadmap
      const { matchedSkills, missingSkills } = calculateSkillGap(user.resumeSkills, targetRole);
      user.skillGap = { matchedSkills, missingSkills };
      
      // Reset AI assessment and progress for the new role
      user.aiSkillAnalysis = {};
      user.roadmapProgress = {};
      user.roadmap = generateDefaultRoadmap(targetRole, user.resumeSkills);
      
      // Log notification
      user.notifications.unshift({
        text: `Target role changed to "${targetRole}". Skill gaps and roadmap reset.`,
        type: "info",
        date: new Date(),
        read: false
      });
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.json({
      message: roleChanged 
        ? "Profile and target role updated successfully. Learning roadmap regenerated." 
        : "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      error: "Failed to update profile",
    });
  }
});

// Get SkillForge specific application data
router.get("/skillforge-data", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "targetRole resumeSkills skillGap aiSkillAnalysis roadmapProgress roadmap projects interviewHistory notifications"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("SkillForge Data Error:", error);
    res.status(500).json({ error: "Failed to fetch SkillForge data" });
  }
});

// Update SkillForge specific application data
router.put("/skillforge-data", authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const allowedFields = [
      "resumeSkills",
      "skillGap",
      "aiSkillAnalysis",
      "roadmapProgress",
      "roadmap",
      "projects",
      "interviewHistory",
      "notifications",
      "targetRole",
    ];

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let roleChanged = false;

    // Apply updates
    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        if (field === "targetRole" && updates[field] !== user.targetRole) {
          roleChanged = true;
        }
        user[field] = updates[field];
      }
    });

    // If resumeSkills are updated or targetRole is updated, recalculate gaps and default roadmap
    if (updates.resumeSkills !== undefined || roleChanged) {
      const targetRole = user.targetRole;
      if (targetRole) {
        const { matchedSkills, missingSkills } = calculateSkillGap(user.resumeSkills, targetRole);
        user.skillGap = { matchedSkills, missingSkills };

        // Generate a new roadmap if we don't already have one or if the role changed
        if (roleChanged || !user.roadmap || user.roadmap.length === 0) {
          user.roadmap = generateDefaultRoadmap(targetRole, user.resumeSkills);
          user.roadmapProgress = {};
          user.aiSkillAnalysis = {}; // Wipe old analysis since skills/role updated
        }
      }
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    res.json({
      message: "SkillForge data updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update SkillForge Data Error:", error);
    res.status(500).json({ error: "Failed to update SkillForge data" });
  }
});

module.exports = router;