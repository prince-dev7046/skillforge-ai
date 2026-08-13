import "../App.css";
import { useState, useEffect } from "react";
import { extractTextFromPDF } from "../utils/pdfExtractor";
import { extractSkills } from "../utils/skillExtractor";
import { getSkillForgeData, updateSkillForgeData } from "../services/api";

function Resume() {
  const [extractedSkills, setExtractedSkills] = useState({});
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Load existing resume skills from MongoDB on mount
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const data = await getSkillForgeData();
        if (data && data.resumeSkills && Object.keys(data.resumeSkills).length > 0) {
          setExtractedSkills(data.resumeSkills);
        }
      } catch (error) {
        console.error("Failed to load saved resume skills:", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadSavedData();
  }, []);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf" && !selectedFile.name.endsWith(".pdf")) {
      setStatusMessage({ type: "error", text: "Please upload a valid PDF file." });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "File size exceeds 5MB limit. Please upload a smaller file." });
      return;
    }

    setStatusMessage({ type: "", text: "" });
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
      setStatusMessage({ type: "error", text: "Please select a resume file first." });
      return;
    }

    try {
      setIsAnalyzing(true);
      setStatusMessage({ type: "info", text: "Extracting text and analyzing skills from PDF..." });

      const text = await extractTextFromPDF(file);

      if (!text || text.trim().length === 0) {
        throw new Error("The uploaded PDF appears to be empty or contains scanned images without selectable text.");
      }

      // Extract skills from resume text
      const skills = extractSkills(text);
      const totalSkillsCount = Object.values(skills).flat().length;

      setExtractedSkills(skills);
      setExtractedText(text);

      // Save directly to MongoDB
      await updateSkillForgeData({
        resumeSkills: skills,
      });

      // Notify other components if needed
      window.dispatchEvent(new CustomEvent("skillforge-refresh"));

      setStatusMessage({
        type: "success",
        text: `Analysis complete! Detected ${totalSkillsCount} skills and saved to your profile.`,
      });
    } catch (error) {
      console.error("Resume analysis failed:", error);
      setStatusMessage({
        type: "error",
        text: error.message || "Could not analyze the resume. Please ensure it is a valid text-based PDF.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedText("");
    setStatusMessage({ type: "", text: "" });
  };

  const totalDetectedCount = Object.values(extractedSkills).flat().length;

  return (
    <div className="resume-page">
      <div className="page-header">
        <div>
          <h1>Resume Analyzer</h1>
          <p>
            Upload your resume and let SkillForge AI identify your skills, experience, and domain expertise.
          </p>
        </div>
      </div>

      {statusMessage.text && (
        <div className={`status-banner ${statusMessage.type}`}>
          <span>{statusMessage.type === "error" ? "❌" : statusMessage.type === "success" ? "✅" : "⏳"}</span>
          <p>{statusMessage.text}</p>
        </div>
      )}

      <div
        className={`upload-box ${isDragging ? "dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📄</div>
        <h2>Upload your resume</h2>
        <p>
          Drag and drop your PDF here
          <br />
          or
        </p>

        <label className="upload-btn">
          Choose PDF
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            hidden
          />
        </label>

        <p className="upload-info">Maximum file size: 5 MB (PDF format only)</p>
      </div>

      {file && (
        <div className="selected-file">
          <div className="file-info">
            <div className="file-icon">📄</div>
            <div>
              <h3>{file.name}</h3>
              <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button className="secondary-btn" onClick={handleReset} disabled={isAnalyzing}>
              Change File
            </button>
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing Resume..." : "Analyze Resume"}
            </button>
          </div>
        </div>
      )}

      {loadingInitial ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your saved profile skills...</p>
        </div>
      ) : totalDetectedCount > 0 ? (
        <div className="skills-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>Detected Skills ({totalDetectedCount})</h2>
            <span className="badge-saved">Saved to MongoDB Account</span>
          </div>

          {Object.entries(extractedSkills).map(([category, skills]) =>
            skills.length > 0 ? (
              <div key={category} className="skill-category">
                <h3>{category.replace(/([A-Z])/g, " $1")}</h3>
                <div className="skill-list">
                  {skills.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null
          )}
        </div>
      ) : (
        <div className="empty-state-card">
          <span className="empty-icon">📋</span>
          <h3>No Resume Analyzed Yet</h3>
          <p>Upload your PDF resume above to extract skills and enable personalized recommendations.</p>
        </div>
      )}

      {extractedText && (
        <div className="extracted-text-box">
          <h2>Extracted Resume Text Preview</h2>
          <pre>{extractedText}</pre>
        </div>
      )}
    </div>
  );
}

export default Resume;