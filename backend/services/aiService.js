const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function analyzeSkillGap(resumeSkills, targetRole) {
  const prompt = `
You are an AI career assistant for SkillForge AI.

Analyze the user's skill gap.

Target Role:
${targetRole}

Skills found in the user's resume:
${resumeSkills.join(", ")}

Return ONLY valid JSON in this exact structure:

{
  "targetRole": "${targetRole}",
  "matchedSkills": [],
  "missingSkills": [],
  "skillMatchPercentage": 0,
  "recommendation": ""
}

Rules:
- matchedSkills = skills relevant to the target role that the user already has.
- missingSkills = important skills needed for the target role that are not present.
- skillMatchPercentage = percentage of required skills already matched.
- recommendation = short practical advice for the user.
- Do not use markdown.
- Return only JSON.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
  });

  return JSON.parse(response.text);
}

module.exports = {
  analyzeSkillGap,
};