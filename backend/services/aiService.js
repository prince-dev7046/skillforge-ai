const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function analyzeSkillGap(resumeSkills, targetRole) {
  const prompt = `
You are an expert AI career mentor for SkillForge AI.

Your job is to analyze a user's current technical skills against the requirements of their target career role and create a personalized learning roadmap.

Target Role:
${targetRole}

User's Current Skills:
${resumeSkills.join(", ")}

Analyze the user's profile carefully.

Return ONLY valid JSON.
Do NOT use markdown.
Do NOT include code fences.
Do NOT add any text before or after the JSON.

Use EXACTLY this structure:

{
  "targetRole": "${targetRole}",
  "overallAssessment": "",
  "matchedSkills": [],
  "missingSkills": [],
  "skillMatchPercentage": 0,
  "careerReadiness": "",
  "criticalGaps": [],
  "learningPriorities": [
    {
      "skill": "",
      "priority": "",
      "reason": ""
    }
  ],
  "recommendation": "",
  "nextSteps": [],
  "roadmap": [
    {
      "skill": "",
      "priority": 1,
      "difficulty": "",
      "duration": "",
      "reason": "",
      "topics": [],
      "miniProject": "",
      "prerequisites": []
    }
  ]
}

Rules:

1. targetRole

- Return the target role exactly as provided.

2. matchedSkills

- Include skills from the user's current skills that are genuinely relevant to the target role.
- Do not invent skills the user does not have.

3. missingSkills

- Include important technical skills commonly required for the target role that are missing from the user's current skills.
- Prioritize practical and industry-relevant skills.
- Do not create an unnecessarily huge list.
- Return approximately 4 to 8 important missing skills.

4. skillMatchPercentage

- Estimate the percentage of important skills the user already possesses.
- Return a number from 0 to 100.
- Do not add the % symbol.

5. overallAssessment

- Give a concise assessment of the user's current profile.
- Mention strengths and major areas that need improvement.
- Keep it practical and personalized.

6. careerReadiness

- Choose ONE of:
  "Beginner"
  "Developing"
  "Intermediate"
  "Job Ready"

7. criticalGaps

- List the most important missing skills that could significantly affect the user's ability to perform the target role.
- Return 3 to 6 skills.

8. learningPriorities

- Rank the most important skills the user should learn.
- Return 3 to 5 objects.
- Each object must contain:
  - skill
  - priority: "High", "Medium", or "Low"
  - reason

9. recommendation

- Give practical personalized career advice.
- Explain what the user should focus on next.
- Mention projects or hands-on practice when appropriate.

10. nextSteps

- Return 3 to 5 short actionable steps.
- Each step should be something the user can realistically do.

11. roadmap

Create a personalized learning roadmap based on the user's actual skill gaps and target role.

- Return 4 to 8 roadmap items.
- Only include skills that are missing or need significant improvement.
- Order the roadmap logically from foundational skills to advanced skills.
- "priority" must be a number starting from 1.
- "difficulty" must be one of:
  "Beginner"
  "Intermediate"
  "Advanced"
- "duration" should be a realistic estimate such as:
  "1 week"
  "2 weeks"
  "3 weeks"
  "1 month"
- "reason" should explain why this skill matters for the target role.
- "topics" should contain 3 to 6 important topics to learn.
- "miniProject" should contain one practical project that helps the user practice the skill.
- "prerequisites" should contain skills that should ideally be learned first.
- If there are no prerequisites, return an empty array.
- Make the roadmap progressive.
- Do not recommend advanced topics before their required fundamentals.
- Focus on skills that improve employability and practical ability.

12. Roadmap quality

The roadmap should NOT simply be a list of technologies.

It should represent a realistic learning journey.

For example:

Foundation
→ Core skill
→ Practical application
→ Advanced skill
→ Deployment
→ Industry practice

13. Accuracy

- Do not claim that the user has a skill unless it appears in their current skills.
- Do not assume experience that was not provided.
- Keep recommendations appropriate for the target role.
- Do not recommend unnecessary technologies just to make the roadmap longer.

Return ONLY the JSON object.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
  });

  const text = response.text.trim();

  // Remove accidental markdown code fences if Gemini adds them
  const cleanedText = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleanedText);
}

module.exports = {
  analyzeSkillGap,
};