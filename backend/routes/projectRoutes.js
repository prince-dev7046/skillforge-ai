const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { generateProjectRecommendations } = require("../services/aiService");

const router = express.Router();

// GET all projects for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.projects || []);
  } catch (error) {
    console.error("Fetch Projects Error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// POST to add a new project or generate recommendations
router.post("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { generate, title, description, difficulty, duration, requiredSkills, whyProject, features, suggestedStack } = req.body;

    if (generate) {
      // Generate recommendations using Gemini
      const flatSkills = user.resumeSkills 
        ? (Array.isArray(user.resumeSkills) ? user.resumeSkills : Object.values(user.resumeSkills).flat())
        : [];
      
      const missingSkills = user.skillGap?.missingSkills || [];
      const learningPriorities = user.aiSkillAnalysis?.learningPriorities?.map(p => p.skill) || [];

      if (!user.targetRole) {
        return res.status(400).json({ error: "Please select a target role first." });
      }

      console.log("Generating projects via Gemini for user:", user._id);
      const recommendations = await generateProjectRecommendations(
        flatSkills,
        user.targetRole,
        missingSkills,
        learningPriorities
      );

      // Map recommendations to user project schema
      const projectItems = recommendations.map(proj => ({
        title: proj.title,
        description: proj.description,
        difficulty: proj.difficulty,
        duration: proj.duration,
        requiredSkills: proj.requiredSkills || [],
        whyProject: proj.whyProject,
        features: proj.features,
        suggestedStack: proj.suggestedStack,
        status: "Not Started"
      }));

      // Set user projects (overwrite or append? Let's overwrite so the user gets a fresh set of AI recommendations, but keep custom ones if they exist? Let's just set the projects list or append. Overwriting is usually preferred for a fresh set of recommendation cards, or we can replace the AI ones. Let's overwrite to keep it simple and clean).
      user.projects = projectItems;

      // Log notification
      user.notifications.unshift({
        text: `New AI project recommendations generated for ${user.targetRole}.`,
        type: "project",
        date: new Date(),
        read: false
      });

      await user.save();
      return res.status(201).json(user.projects);
    } else {
      // Add custom manual project
      if (!title || !description) {
        return res.status(400).json({ error: "Title and description are required for a custom project." });
      }

      const newProject = {
        title,
        description,
        difficulty: difficulty || "Intermediate",
        duration: duration || "2 weeks",
        requiredSkills: requiredSkills || [],
        whyProject: whyProject || "Personal practice project.",
        features: features || "",
        suggestedStack: suggestedStack || "",
        status: "Not Started"
      };

      user.projects.push(newProject);
      await user.save();

      return res.status(201).json(user.projects[user.projects.length - 1]);
    }
  } catch (error) {
    console.error("Add/Generate Projects Error:", error);
    res.status(500).json({ error: "Failed to process projects request" });
  }
});

// PUT to update project progress/status
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !["Not Started", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ error: "Valid status ('Not Started', 'In Progress', 'Completed') is required" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const project = user.projects.id(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const oldStatus = project.status;
    project.status = status;

    if (status === "Completed" && oldStatus !== "Completed") {
      // Log milestone notification
      user.notifications.unshift({
        text: `Congratulations! You completed the project: "${project.title}".`,
        type: "roadmap",
        date: new Date(),
        read: false
      });
    }

    await user.save();
    res.json(project);
  } catch (error) {
    console.error("Update Project Error:", error);
    res.status(500).json({ error: "Failed to update project status" });
  }
});

// DELETE to remove a project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const project = user.projects.id(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    project.deleteOne();
    await user.save();
    res.json({ message: "Project deleted successfully", projectId: req.params.id });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

module.exports = router;
