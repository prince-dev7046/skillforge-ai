import { useState } from "react";
import { extractTextFromPDF } from "../utils/pdfExtractor";
import { extractSkills } from "../utils/skillExtractor";

function Resume() {
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

      console.log("Extracted Resume Text:");
      console.log(text);

      // Extract skills from resume
      const skills = extractSkills(text);

      console.log("Extracted Skills:");
      console.log(skills);

      setExtractedText(text);
    } catch (error) {
      console.error("Resume analysis failed:", error);
      alert("Could not analyze the resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="resume-page">

      <div className="page-header">
        <div>
          <h1>Resume Analyzer</h1>

          <p>
            Upload your resume and let SkillForge AI identify
            your skills, projects, and experience.
          </p>
        </div>
      </div>

      <div
        className={`upload-box ${isDragging ? "dragging" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >

        <div className="upload-icon">
          📄
        </div>

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

        <p className="upload-info">
          Maximum file size: 5 MB
        </p>

      </div>

      {file && (
        <div className="selected-file">

          <div className="file-info">

            <div className="file-icon">
              📄
            </div>

            <div>
              <h3>{file.name}</h3>

              <p>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

          </div>

          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
          </button>

        </div>
      )}

      {extractedText && (
        <div className="extracted-text-box">
          <h2>Extracted Resume Text</h2>

          <pre>{extractedText}</pre>
        </div>
      )}

    </div>
  );
}

export default Resume;