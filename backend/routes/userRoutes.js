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
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({
        error: "Name is required",
      });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name,
      },
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

module.exports = router;