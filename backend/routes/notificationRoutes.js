const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET all notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.notifications || []);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// PUT to mark a specific notification as read
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const notification = user.notifications.id(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    notification.read = true;
    await user.save();

    res.json(notification);
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// PUT to mark all notifications as read
router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    (user.notifications || []).forEach((notification) => {
      notification.read = true;
    });

    await user.save();
    res.json(user.notifications || []);
  } catch (error) {
    console.error("Mark All Read Error:", error);
    res.status(500).json({ error: "Failed to update all notifications" });
  }
});

module.exports = router;
