const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic user information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // SkillForge AI data
    targetRole: {
      type: String,
      default: "",
      trim: true,
    },

    resumeSkills: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    skillGap: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    aiSkillAnalysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    roadmapProgress: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    projects: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    interviewHistory: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    notifications: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    // Password reset fields
    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);