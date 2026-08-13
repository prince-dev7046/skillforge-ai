import "../App.css";
import { useState } from "react";
import { extractTextFromPDF } from "../utils/pdfExtractor";
import { extractSkills } from "../utils/skillExtractor";

function Resume() {
  const [extractedSkills, setExtractedSkills] = useState({});
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const droppedFile = event.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please select a resume first.");
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log("Starting PDF extraction...");

      const text = await extractTextFromPDF(file);
      console.log("Extracted Resume Text:", text);

      const skills = extractSkills(text);
      console.log("Extracted Skills:", skills);

      setExtractedSkills(skills);
      setExtractedText(text);

      localStorage.setItem(
        "resumeSkills",
        JSON.stringify(skills)
      );
    } catch (error) {
      console.error("Resume analysis failed:", error);
      alert("Could not analyze the resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const categoryColors = [
    "badge-cyan",
    "badge-yellow",
    "badge-pink",
    "badge-green",
  ];

  return (
    <div className="resume-page">
      {/* Header Banner */}
      <div className="page-header neo-card card-cyan">
        <div className="header-content">
          <div>
            <span className="badge badge-yellow">PDF Parser & Skill Extractor</span>
            <h1>Resume Analyzer</h1>
            <p>
              Upload your resume and let SkillForge AI identify your core skills, experience, and domain strengths.
            </p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        className={`upload-box ${isDragging ? "dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon-badge">
          📄
        </div>

        <h2>Upload your Resume</h2>

        <p className="upload-subtext">
          Drag and drop your PDF resume file here, or click to browse
        </p>

        <label className="btn btn-primary upload-btn">
          <span>📁 Choose PDF File</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            hidden
          />
        </label>

        <p className="upload-info text-muted">
          Supported format: <strong>PDF</strong> (Maximum size: 5 MB)
        </p>
      </div>

      {/* Selected File Summary Card */}
      {file && (
        <div className="selected-file neo-card card-yellow">
          <div className="file-info">
            <div className="file-icon-badge">
              📄
            </div>

            <div>
              <h3>{file.name}</h3>
              <p className="text-muted text-mono">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            className="btn btn-green analyze-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "🔄 Analyzing..." : "✨ Analyze Resume"}
          </button>
        </div>
      )}

      {/* Extracted Resume Text Card */}
      {extractedText && (
        <div className="extracted-text-box neo-card">
          <div className="card-header-row">
            <h2>Extracted Resume Text</h2>
            <span className="badge badge-yellow">Parsed Output</span>
          </div>

          <pre>{extractedText}</pre>
        </div>
      )}

      {/* Detected Skills Section */}
      {Object.keys(extractedSkills).length > 0 && (
        <div className="skills-section neo-card card-green">
          <div className="card-header-row">
            <h2>🎯 Detected Skills</h2>
            <span className="badge badge-pink">Extracted</span>
          </div>

          <div className="categories-grid">
            {Object.entries(extractedSkills).map(([category, skills], index) => (
              <div key={category} className="skill-category-card">
                <h3>{category}</h3>

                <div className="skill-list">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className={`badge ${
                        categoryColors[index % categoryColors.length]
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Resume;