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

    roadmap: {
      type: [
        {
          id: Number,
          skill: String,
          priority: Number,
          difficulty: String,
          duration: String,
          reason: String,
          topics: [String],
          miniProject: String,
          prerequisites: [String],
          status: {
            type: String,
            enum: ["Not Started", "In Progress", "Completed"],
            default: "Not Started",
          },
        }
      ],
      default: [],
    },

    projects: {
      type: [
        {
          title: String,
          description: String,
          difficulty: String,
          duration: String,
          requiredSkills: [String],
          whyProject: String,
          features: String,
          suggestedStack: String,
          status: {
            type: String,
            enum: ["Not Started", "In Progress", "Completed"],
            default: "Not Started",
          },
        }
      ],
      default: [],
    },

    interviewHistory: {
      type: [
        {
          targetRole: String,
          interviewType: String,
          difficulty: String,
          date: {
            type: Date,
            default: Date.now,
          },
          questions: [
            {
              question: String,
              userAnswer: {
                type: String,
                default: "",
              },
              score: {
                type: Number,
                default: 0,
              },
              feedback: {
                strengths: { type: String, default: "" },
                weaknesses: { type: String, default: "" },
                improvedAnswer: { type: String, default: "" },
                tips: { type: String, default: "" },
              },
            }
          ],
        }
      ],
      default: [],
    },

    notifications: {
      type: [
        {
          text: String,
          type: {
            type: String,
            default: "info",
          },
          date: {
            type: Date,
            default: Date.now,
          },
          read: {
            type: Boolean,
            default: false,
          },
        }
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);