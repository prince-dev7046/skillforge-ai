import { useState, useEffect } from "react";
import {
  getSkillForgeData,
  updateSkillForgeData,
  generateInterviewQuestionsAI,
  evaluateInterviewAnswerAI,
} from "../services/api";

const interviewTypes = ["Technical", "HR", "Behavioral", "Mixed"];
const difficultyLevels = ["Entry-Level", "Mid-Level", "Senior"];
const supportedRoles = [
  "Full Stack Developer",
  "Machine Learning Engineer",
  "Data Scientist",
  "Backend Developer",
];

function Interview() {
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [interviewType, setInterviewType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Mid-Level");
  const [skills, setSkills] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [evaluatingIndex, setEvaluatingIndex] = useState(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("practice"); // "practice" or "history"
  const [error, setError] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  // Load user data & past interview history from MongoDB
  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        const data = await getSkillForgeData();

        if (data) {
          if (data.targetRole) {
            setTargetRole(data.targetRole);
          }

          const rawSkills = data.resumeSkills || {};
          const skillsArr = Array.isArray(rawSkills)
            ? rawSkills
            : Object.values(rawSkills).flat();
          setSkills(skillsArr);

          if (Array.isArray(data.interviewHistory)) {
            setInterviewHistory(data.interviewHistory);
          }
        }
      } catch (err) {
        console.error("Error loading interview data from MongoDB:", err);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, []);

  const handleGenerateQuestions = async () => {
    try {
      setLoadingQuestions(true);
      setError("");
      setAnswers({});
      setEvaluations({});

      const result = await generateInterviewQuestionsAI(
        targetRole,
        interviewType,
        difficulty,
        skills
      );

      if (result && Array.isArray(result.questions)) {
        setQuestions(result.questions);
      } else {
        throw new Error("Failed to parse interview questions from AI.");
      }
    } catch (err) {
      console.error("Error generating interview questions:", err);
      setError(err.message || "Failed to generate interview questions. Please try again.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleEvaluateAnswer = async (qIndex, questionObj) => {
    const userAnswer = answers[qIndex] || "";

    if (!userAnswer.trim()) {
      setError(`Please type your answer for Question ${qIndex + 1} before submitting.`);
      return;
    }

    try {
      setEvaluatingIndex(qIndex);
      setError("");

      const result = await evaluateInterviewAnswerAI(
        questionObj.question,
        userAnswer,
        targetRole,
        skills
      );

      const updatedEvaluations = {
        ...evaluations,
        [qIndex]: result,
      };

      setEvaluations(updatedEvaluations);

      // Save to interview history in MongoDB
      const historyItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        targetRole,
        interviewType,
        difficulty,
        question: questionObj.question,
        userAnswer,
        score: result.score || 0,
        feedback: result.overallFeedback || "",
      };

      const updatedHistory = [historyItem, ...interviewHistory];
      setInterviewHistory(updatedHistory);

      await updateSkillForgeData({
        interviewHistory: updatedHistory,
      });

      window.dispatchEvent(new CustomEvent("skillforge-refresh"));
    } catch (err) {
      console.error("Evaluation error:", err);
      setError(err.message || "Evaluation failed. Please try again.");
    } finally {
      setEvaluatingIndex(null);
    }
  };

  const averageScore =
    interviewHistory.length > 0
      ? (
          interviewHistory.reduce((acc, curr) => acc + (curr.score || 0), 0) /
          interviewHistory.length
        ).toFixed(1)
      : null;

  if (pageLoading) {
    return (
      <div className="loading-state" style={{ minHeight: "50vh" }}>
        <div className="spinner"></div>
        <p>Loading AI interview preparation simulator...</p>
      </div>
    );
  }

  return (
    <div className="interview-page">
      <div className="page-header">
        <div>
          <h1>AI Mock Interview Coach</h1>
          <p>
            Simulate realistic technical and behavioral interview scenarios with AI scoring and personalized feedback.
          </p>
        </div>

        <div className="tab-buttons" style={{ display: "flex", gap: "10px" }}>
          <button
            className={activeTab === "practice" ? "primary-btn" : "secondary-btn"}
            onClick={() => setActiveTab("practice")}
          >
            🎯 Practice Session
          </button>
          <button
            className={activeTab === "history" ? "primary-btn" : "secondary-btn"}
            onClick={() => setActiveTab("history")}
          >
            📜 Past Sessions ({interviewHistory.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="status-banner error" style={{ marginBottom: "20px" }}>
          <span>❌</span>
          <p>{error}</p>
        </div>
      )}

      {activeTab === "practice" ? (
        <>
          {/* Configuration Card */}
          <div className="dashboard-card" style={{ marginBottom: "30px" }}>
            <h2>Configure Your Mock Interview</h2>

            <div className="interview-config-grid">
              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Target Role
                </label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                >
                  {supportedRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Interview Format
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                >
                  {interviewTypes.map((t) => (
                    <option key={t} value={t}>
                      {t} Interview
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>
                  Seniority Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                >
                  {difficultyLevels.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              className="primary-btn"
              style={{ marginTop: "20px", padding: "12px 25px" }}
              onClick={handleGenerateQuestions}
              disabled={loadingQuestions}
            >
              {loadingQuestions ? "✨ Generating Questions with Gemini..." : "🚀 Start New Mock Session"}
            </button>
          </div>

          {/* Question List */}
          {questions.length > 0 ? (
            <div className="interview-questions-list">
              <h2>Interview Questions ({questions.length})</h2>

              {questions.map((q, idx) => {
                const evalData = evaluations[idx];
                const isEvaluating = evaluatingIndex === idx;

                return (
                  <div key={idx} className="dashboard-card" style={{ marginBottom: "25px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                      <div>
                        <span className="badge-difficulty" style={{ marginRight: "10px" }}>
                          Question {idx + 1}
                        </span>
                        <span style={{ fontSize: "13px", color: "#6b7280" }}>
                          Category: {q.category || interviewType}
                        </span>
                      </div>

                      {evalData && (
                        <div
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontWeight: "bold",
                            background: evalData.score >= 7 ? "#dcfce7" : evalData.score >= 5 ? "#fef3c7" : "#fee2e2",
                            color: evalData.score >= 7 ? "#166534" : evalData.score >= 5 ? "#92400e" : "#991b1b",
                          }}
                        >
                          Score: {evalData.score} / 10
                        </div>
                      )}
                    </div>

                    <h3 style={{ fontSize: "18px", lineHeight: "1.5", marginBottom: "12px" }}>
                      {q.question}
                    </h3>

                    {q.expectedTopics && q.expectedTopics.length > 0 && (
                      <div style={{ marginBottom: "15px", fontSize: "13px", color: "#6b7280" }}>
                        <strong>💡 Key Focus Areas: </strong>
                        {q.expectedTopics.join(" • ")}
                      </div>
                    )}

                    <div style={{ marginTop: "15px" }}>
                      <label style={{ display: "block", fontWeight: "600", fontSize: "14px", marginBottom: "6px" }}>
                        Your Answer:
                      </label>
                      <textarea
                        rows="5"
                        placeholder="Type your structured answer here (use STAR method for behavioral questions)..."
                        value={answers[idx] || ""}
                        onChange={(e) =>
                          setAnswers({ ...answers, [idx]: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          fontFamily: "inherit",
                          fontSize: "14px",
                          lineHeight: "1.6",
                        }}
                      />
                    </div>

                    <button
                      className="primary-btn"
                      style={{ marginTop: "12px" }}
                      disabled={isEvaluating}
                      onClick={() => handleEvaluateAnswer(idx, q)}
                    >
                      {isEvaluating ? "🤖 Evaluating Answer with AI..." : "📝 Submit & Evaluate Answer"}
                    </button>

                    {/* AI Evaluation Results Card */}
                    {evalData && (
                      <div className="interview-feedback-box">
                        <h4>🎯 AI Evaluation Feedback</h4>
                        <p style={{ color: "#374151", margin: "8px 0 15px", fontStyle: "italic" }}>
                          "{evalData.overallFeedback}"
                        </p>

                        {Array.isArray(evalData.strengths) && evalData.strengths.length > 0 && (
                          <div style={{ marginBottom: "12px" }}>
                            <strong style={{ color: "#166534" }}>✅ Strengths:</strong>
                            <ul style={{ margin: "5px 0 0 20px" }}>
                              {evalData.strengths.map((s, i) => (
                                <li key={i} style={{ color: "#374151" }}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {Array.isArray(evalData.weaknesses) && evalData.weaknesses.length > 0 && (
                          <div style={{ marginBottom: "12px" }}>
                            <strong style={{ color: "#991b1b" }}>⚠️ Areas for Improvement:</strong>
                            <ul style={{ margin: "5px 0 0 20px" }}>
                              {evalData.weaknesses.map((w, i) => (
                                <li key={i} style={{ color: "#374151" }}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {evalData.improvedAnswer && (
                          <div style={{ marginTop: "15px", background: "#ffffff", padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                            <strong style={{ color: "#4338ca", display: "block", marginBottom: "6px" }}>
                              ⭐ High-Scoring Benchmark Answer:
                            </strong>
                            <p style={{ color: "#334155", fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                              {evalData.improvedAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-card">
              <span className="empty-icon">💼</span>
              <h3>No Active Mock Session</h3>
              <p>
                Configure your interview preferences above and click "Start New Mock Session" to generate customized AI questions.
              </p>
            </div>
          )}
        </>
      ) : (
        /* History Tab */
        <div>
          {averageScore && (
            <div className="dashboard-card" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ margin: 0 }}>Performance Summary</h3>
                  <p style={{ color: "#6b7280", margin: "4px 0 0" }}>Average across {interviewHistory.length} evaluated questions</p>
                </div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#4f46e5" }}>
                  {averageScore} / 10
                </div>
              </div>
            </div>
          )}

          {interviewHistory.length === 0 ? (
            <div className="empty-state-card">
              <span className="empty-icon">📜</span>
              <h3>No Past Interview History</h3>
              <p>Complete mock interview questions to track your answers and AI evaluations here.</p>
            </div>
          ) : (
            interviewHistory.map((item) => (
              <div key={item.id} className="dashboard-card" style={{ marginBottom: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "bold" }}>
                      {item.date} • {item.targetRole} ({item.interviewType})
                    </span>
                    <h4 style={{ margin: "6px 0", fontSize: "16px" }}>{item.question}</h4>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      fontSize: "13px",
                      background: item.score >= 7 ? "#dcfce7" : "#fee2e2",
                      color: item.score >= 7 ? "#166534" : "#991b1b",
                    }}
                  >
                    Score: {item.score}/10
                  </span>
                </div>

                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", fontSize: "13px", color: "#475569" }}>
                  <strong>Your Answer: </strong> {item.userAnswer}
                </div>

                {item.feedback && (
                  <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
                    💡 <strong>Feedback:</strong> {item.feedback}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Interview;