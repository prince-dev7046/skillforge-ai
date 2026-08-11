const skillsDatabase = {
  programming: [
    "Java",
    "Python",
    "C",
    "C++",
    "C#",
    "JavaScript",
    "TypeScript",
    "Go",
    "Rust",
    "PHP",
    "Ruby"
  ],

  frontend: [
    "HTML",
    "CSS",
    "React",
    "Angular",
    "Vue",
    "Next.js",
    "Bootstrap",
    "Tailwind CSS"
  ],

  backend: [
    "Node.js",
    "Express.js",
    "Django",
    "Flask",
    "Spring Boot",
    "REST API"
  ],

  database: [
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "SQLite",
    "Redis",
    "Oracle"
  ],

  dataScience: [
    "NumPy",
    "Pandas",
    "Matplotlib",
    "Scikit-learn",
    "TensorFlow",
    "PyTorch",
    "Machine Learning",
    "Deep Learning"
  ],

  cloud: [
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes"
  ],

  tools: [
    "Git",
    "GitHub",
    "Linux",
    "VS Code",
    "Jenkins"
  ]
};

export function extractSkills(text) {
  const extractedSkills = {};

  const normalizedText = text.toLowerCase();

  for (const category in skillsDatabase) {
    extractedSkills[category] = [];

    for (const skill of skillsDatabase[category]) {
      if (normalizedText.includes(skill.toLowerCase())) {
        extractedSkills[category].push(skill);
      }
    }
  }

  return extractedSkills;
}