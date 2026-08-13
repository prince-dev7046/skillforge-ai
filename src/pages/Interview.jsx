import { useState, useEffect } from "react";
import {
  getSkillForgeData,
  updateSkillForgeData,
  generateInterviewQuestionsAI,
  evaluateInterviewAnswerAI,
} from "../services/api";
import StatCard from "../components/StatCard";

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
      <div className="interview-page">
        <div className="loading-state" style={{ minHeight: "50vh" }}>
          <div className="spinner"></div>
          <p>Loading AI interview preparation simulator...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page">
      {/* Header Banner */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-role-badge">
            🎯 TARGET CAREER: <strong>{targetRole}</strong>
          </div>
          <h1>AI Mock Interview Coach</h1>
          <p className="dashboard-header-sub">
            Simulate realistic technical and behavioral interview scenarios with AI scoring and feedback.
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

      {/* Error Banner */}
      {error && (
        <div className="status-banner error" style={{ marginBottom: "20px" }}>
          <span>❌</span>
          <p>{error}</p>
        </div>
      )}

      {activeTab === "practice" ? (
        <>
          {/* Configuration Card */}
          <div className="dashboard-card" style={{ marginBottom: "28px" }}>
            <div className="dashboard-card-title-row">
              <div>
                <h2>Configure Mock Interview</h2>
                <p className="dashboard-card-sub">Select format and difficulty for tailored question generation</p>
              </div>
              <span className="badge-saved">AI POWERED</span>
            </div>

            <div className="interview-config-grid">
              <div className="config-control-group">
                <label className="config-label">Target Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="role-selector-select"
                  style={{ width: "100%" }}
                >
                  {supportedRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="config-control-group">
                <label className="config-label">Interview Format</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="role-selector-select"
                  style={{ width: "100%" }}
                >
                  {interviewTypes.map((t) => (
                    <option key={t} value={t}>
                      {t} Interview
                    </option>
                  ))}
                </select>
              </div>

              <div className="config-control-group">
                <label className="config-label">Seniority Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="role-selector-select"
                  style={{ width: "100%" }}
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
              style={{ marginTop: "24px", padding: "12px 28px" }}
              onClick={handleGenerateQuestions}
              disabled={loadingQuestions}
            >
              {loadingQuestions ? "✨ Generating Questions with Gemini..." : "🚀 Start New Mock Session"}
            </button>
          </div>

          {/* Questions List */}
          {questions.length > 0 ? (
            <div className="interview-questions-list">
              <div className="roadmap-section-header">
                <h2>Interview Questions ({questions.length})</h2>
                <span className="badge-saved">{interviewType.toUpperCase()} FORMAT</span>
              </div>

              {questions.map((q, idx) => {
                const evalData = evaluations[idx];
                const isEvaluating = evaluatingIndex === idx;

                return (
                  <div key={idx} className="dashboard-card interview-question-card" style={{ marginBottom: "28px" }}>
                    <div className="question-card-header">
                      <div className="question-meta-left">
                        <span className="question-number-badge">
                          Question {idx + 1}
                        </span>
                        <span className="question-category-tag">
                          Category: {q.category || interviewType}
                        </span>
                      </div>

                      {evalData && (
                        <div
                          className={`score-badge-pill ${
                            evalData.score >= 7
                              ? "score-high"
                              : evalData.score >= 5
                              ? "score-mid"
                              : "score-low"
                          }`}
                        >
                          Score: {evalData.score} / 10
                        </div>
                      )}
                    </div>

                    <h3 className="question-title-text">{q.question}</h3>

                    {q.expectedTopics && q.expectedTopics.length > 0 && (
                      <div className="question-focus-box">
                        <strong>💡 Key Focus Areas: </strong>
                        {q.expectedTopics.map((topic) => (
                          <span key={topic} className="focus-topic-tag">
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="answer-section">
                      <div className="answer-label-row">
                        <label className="answer-label">Your Response:</label>
                        <span className="star-tip">💡 Tip: Use STAR method (Situation, Task, Action, Result)</span>
                      </div>
                      <textarea
                        rows="5"
                        placeholder="Type your structured response here..."
                        value={answers[idx] || ""}
                        onChange={(e) =>
                          setAnswers({ ...answers, [idx]: e.target.value })
                        }
                        className="interview-textarea"
                      />
                    </div>

                    <button
                      className="primary-btn"
                      style={{ marginTop: "16px" }}
                      disabled={isEvaluating}
                      onClick={() => handleEvaluateAnswer(idx, q)}
                    >
                      {isEvaluating ? "🤖 Evaluating Answer with AI..." : "📝 Submit & Evaluate Answer"}
                    </button>

                    {/* AI Evaluation Feedback Box */}
                    {evalData && (
                      <div className="interview-feedback-box">
                        <div className="feedback-header-row">
                          <h4>🎯 AI Evaluation Feedback</h4>
                          <span className="score-summary-tag">Score: {evalData.score}/10</span>
                        </div>

                        <p className="overall-feedback-text">
                          "{evalData.overallFeedback}"
                        </p>

                        {Array.isArray(evalData.strengths) && evalData.strengths.length > 0 && (
                          <div className="feedback-group strengths-group">
                            <strong>✅ Key Strengths:</strong>
                            <ul>
                              {evalData.strengths.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {Array.isArray(evalData.weaknesses) && evalData.weaknesses.length > 0 && (
                          <div className="feedback-group weaknesses-group">
                            <strong>⚠️ Areas for Improvement:</strong>
                            <ul>
                              {evalData.weaknesses.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {evalData.improvedAnswer && (
                          <div className="benchmark-answer-box">
                            <strong>⭐ High-Scoring Benchmark Answer:</strong>
                            <p>{evalData.improvedAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-card" style={{ border: "var(--nb-border-dashed)" }}>
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
            <div className="stats-grid" style={{ marginBottom: "28px" }}>
              <StatCard
                title="Average Score"
                value={`${averageScore} / 10`}
                subtitle={`Across ${interviewHistory.length} evaluated responses`}
                badgeText={averageScore >= 7 ? "High Competency" : "Developing"}
                badgeVariant={averageScore >= 7 ? "mint" : "orange"}
                variant="yellow"
                icon="📊"
              />
              <StatCard
                title="Questions Answered"
                value={interviewHistory.length}
                subtitle="Historical evaluated responses"
                badgeText="History Recorded"
                badgeVariant="default"
                variant="violet"
                icon="📜"
              />
            </div>
          )}

          {interviewHistory.length === 0 ? (
            <div className="empty-state-card" style={{ border: "var(--nb-border-dashed)" }}>
              <span className="empty-icon">📜</span>
              <h3>No Past Interview History</h3>
              <p>Complete mock interview questions to track your responses and AI evaluations here.</p>
            </div>
          ) : (
            <div className="history-list">
              {interviewHistory.map((item) => (
                <div key={item.id} className="dashboard-card history-card" style={{ marginBottom: "20px" }}>
                  <div className="history-card-header">
                    <div>
                      <span className="history-meta-tag">
                        {item.date} • {item.targetRole} ({item.interviewType})
                      </span>
                      <h3 className="history-question-title">{item.question}</h3>
                    </div>
                    <span
                      className={`score-badge-pill ${
                        item.score >= 7 ? "score-high" : "score-low"
                      }`}
                    >
                      Score: {item.score}/10
                    </span>
                  </div>

                  <div className="history-answer-box">
                    <strong>Your Response:</strong> {item.userAnswer}
                  </div>

                  {item.feedback && (
                    <div className="history-feedback-snippet">
                      <strong>💡 AI Feedback:</strong> {item.feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Interview;