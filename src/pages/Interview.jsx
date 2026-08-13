import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { api } from "../services/api";

function Interview() {
  const { skillData, refreshData } = useContext(UserContext);
  
  const [type, setType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Intermediate");
  
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [answer, setAnswer] = useState("");
  const [evalLoading, setEvalLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [evalError, setEvalError] = useState("");

  // History view state
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const targetRole = skillData?.targetRole || "";
  const interviewHistory = skillData?.interviewHistory || [];

  const handleStartInterview = async () => {
    try {
      setLoading(true);
      setError("");
      setEvaluation(null);
      setAnswer("");
      setSelectedHistoryItem(null);
      
      const qList = await api.generateInterviewQuestions(type, difficulty);
      if (qList && qList.length > 0) {
        setQuestions(qList);
        setCurrentIdx(0);
      } else {
        throw new Error("No questions returned from AI.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate interview questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!answer.trim()) {
      alert("Please type your answer first.");
      return;
    }

    try {
      setEvalLoading(true);
      setEvalError("");
      setEvaluation(null);

      const activeQuestion = questions[currentIdx].question;
      const response = await api.evaluateInterviewAnswer(activeQuestion, answer, type, difficulty);
      setEvaluation(response);
      
      // Sync DB to add history and refresh context
      await refreshData();
    } catch (err) {
      console.error(err);
      setEvalError(err.message || "Failed to evaluate answer.");
    } finally {
      setEvalLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setAnswer("");
      setEvaluation(null);
      setEvalError("");
    }
  };

  const handleReset = () => {
    setQuestions([]);
    setCurrentIdx(0);
    setAnswer("");
    setEvaluation(null);
  };

  return (
    <div className="interview-page">
      <div className="page-header">
        <div>
          <h1>AI Interview Prep</h1>
          <p>
            Practice real technical or behavioral interview questions and get detailed, metrics-backed evaluation from Gemini AI.
          </p>
        </div>
      </div>

      {!targetRole ? (
        <div className="dashboard-card" style={{ textAlign: "center", padding: "var(--space-xl)" }}>
          <h3>🎯 Target Role Required</h3>
          <p>Select your Target Role in the Skill Gap page before starting interview practice.</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Main Panel */}
          <div className="dashboard-card" style={{ flex: 2 }}>
            {questions.length === 0 ? (
              /* Configuration View */
              <div>
                <h2>Start Mock Interview</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "var(--space-md)" }}>
                  Practice questions tailored for <strong>{targetRole}</strong>.
                </p>

                <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap", marginBottom: "var(--space-lg)" }}>
                  <div style={{ flex: 1, minWidth: "150px" }}>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "var(--space-2xs)" }}>Interview Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: "100%", padding: "var(--space-sm)", border: "var(--border-sm)", borderRadius: "var(--radius-sm)" }}>
                      <option value="Technical">Technical</option>
                      <option value="HR">HR</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>

                  <div style={{ flex: 1, minWidth: "150px" }}>
                    <label style={{ fontWeight: "700", display: "block", marginBottom: "var(--space-2xs)" }}>Difficulty Level</label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ width: "100%", padding: "var(--space-sm)", border: "var(--border-sm)", borderRadius: "var(--radius-sm)" }}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleStartInterview} disabled={loading} style={{ width: "100%", padding: "var(--space-md)" }}>
                  {loading ? "Generating Questions..." : "🚀 Start Practice Session"}
                </button>
                {error && <p style={{ color: "var(--neo-pink)", marginTop: "var(--space-md)" }}>❌ {error}</p>}
              </div>
            ) : (
              /* Active Interview View */
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Question <strong>{currentIdx + 1}</strong> of <strong>{questions.length}</strong></span>
                  <button onClick={handleReset} style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "#E2E8F0", boxShadow: "1px 1px 0 var(--border-color)" }}>
                    End Practice
                  </button>
                </div>

                {/* Question Box */}
                <div style={{ padding: "var(--space-md)", border: "var(--border-md)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--surface-cyan)", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>{questions[currentIdx].question}</h3>
                </div>

                {/* Answer Box */}
                <div>
                  <label style={{ fontWeight: "700", display: "block", marginBottom: "var(--space-2xs)" }}>Your Answer:</label>
                  <textarea
                    rows={6}
                    placeholder="Type your detailed answer here... (Explain your architecture, definitions, or steps)"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={evalLoading}
                    style={{
                      width: "100%",
                      padding: "var(--space-md)",
                      border: "var(--border-md)",
                      borderRadius: "var(--radius-sm)",
                      fontFamily: "var(--font-body)",
                      fontSize: "14px",
                      lineHeight: "1.6",
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)" }}>
                  <button onClick={handleEvaluate} disabled={evalLoading || evaluation} style={{ backgroundColor: "var(--neo-yellow)" }}>
                    {evalLoading ? "AI Evaluating..." : "✨ Evaluate Answer"}
                  </button>

                  {evaluation && currentIdx < questions.length - 1 && (
                    <button onClick={handleNext} style={{ backgroundColor: "var(--neo-green)" }}>
                      Next Question →
                    </button>
                  )}
                </div>

                {evalError && <p style={{ color: "var(--neo-pink)" }}>❌ {evalError}</p>}

                {/* Evaluation Results Card */}
                {evaluation && (
                  <div style={{ border: "var(--border-md)", borderRadius: "var(--radius-sm)", padding: "var(--space-lg)", backgroundColor: "var(--surface-yellow)", marginTop: "var(--space-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "var(--border-sm)", paddingBottom: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
                      <h3 style={{ margin: 0 }}>AI Feedback Results</h3>
                      <div style={{ padding: "var(--space-xs) var(--space-md)", backgroundColor: "var(--neo-orange)", border: "var(--border-sm)", borderRadius: "var(--radius-xs)", fontWeight: "800", fontSize: "18px" }}>
                        {evaluation.score} / 10
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                      <div>
                        <strong>✅ Strengths:</strong>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", whiteSpace: "pre-line" }}>{evaluation.strengths}</p>
                      </div>

                      <div>
                        <strong>❌ Areas to Improve (Weaknesses):</strong>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", whiteSpace: "pre-line" }}>{evaluation.weaknesses}</p>
                      </div>

                      <div>
                        <strong>🤖 Suggested Model Answer:</strong>
                        <div style={{ padding: "var(--space-sm)", backgroundColor: "var(--bg-card)", border: "var(--border-sm)", borderRadius: "var(--radius-xs)", fontSize: "13px", marginTop: "4px", lineHeight: "1.6" }}>
                          {evaluation.improvedAnswer}
                        </div>
                      </div>

                      <div>
                        <strong>💡 Practical Tips:</strong>
                        <p style={{ margin: "2px 0 0", fontSize: "13px", whiteSpace: "pre-line" }}>{evaluation.tips}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="dashboard-card" style={{ flex: 1, minWidth: "260px", maxHeight: "650px", overflowY: "auto" }}>
            <h2>Practice History</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "12px", marginBottom: "var(--space-sm)" }}>
              All interview evaluation records are saved to MongoDB.
            </p>

            {interviewHistory.length === 0 ? (
              <p style={{ fontSize: "12px", textAlign: "center", color: "var(--text-muted)", marginTop: "var(--space-lg)" }}>
                No past sessions recorded.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
                {interviewHistory.map((item, idx) => {
                  const qItem = item.questions?.[0];
                  return (
                    <div
                      key={item._id || idx}
                      onClick={() => setSelectedHistoryItem(item)}
                      style={{
                        padding: "var(--space-sm)",
                        border: "var(--border-sm)",
                        borderRadius: "var(--radius-xs)",
                        backgroundColor: selectedHistoryItem?._id === item._id ? "var(--surface-cyan)" : "white",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                        <span>{item.interviewType}</span>
                        <span style={{ color: "var(--neo-orange)" }}>{qItem?.score}/10</span>
                      </div>
                      <p style={{ margin: "4px 0", color: "var(--text-muted)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        Q: {qItem?.question}
                      </p>
                      <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Detail Modal */}
      {selectedHistoryItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-md)",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "600px",
              backgroundColor: "white",
              border: "var(--border-lg)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-lg)",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "var(--space-lg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "var(--border-sm)", paddingBottom: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
              <h3 style={{ margin: 0 }}>Past Evaluation Details</h3>
              <button onClick={() => setSelectedHistoryItem(null)} style={{ padding: "4px 8px", fontSize: "11px", backgroundColor: "var(--neo-pink)", color: "white" }}>
                Close
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              <strong>Type:</strong> {selectedHistoryItem.interviewType} | <strong>Difficulty:</strong> {selectedHistoryItem.difficulty} | <strong>Date:</strong> {new Date(selectedHistoryItem.date).toLocaleString()}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)", marginTop: "var(--space-md)" }}>
              <div>
                <strong>Question:</strong>
                <p style={{ margin: "4px 0", padding: "var(--space-sm)", backgroundColor: "var(--surface-cyan)", border: "var(--border-sm)", borderRadius: "var(--radius-xs)" }}>
                  {selectedHistoryItem.questions?.[0]?.question}
                </p>
              </div>

              <div>
                <strong>Your Answer:</strong>
                <p style={{ margin: "4px 0", padding: "var(--space-sm)", border: "var(--border-sm)", borderRadius: "var(--radius-xs)", fontSize: "13px", whiteSpace: "pre-line" }}>
                  {selectedHistoryItem.questions?.[0]?.userAnswer}
                </p>
              </div>

              <div style={{ padding: "var(--space-md)", backgroundColor: "var(--surface-yellow)", border: "var(--border-sm)", borderRadius: "var(--radius-xs)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", marginBottom: "8px" }}>
                  <span>AI Scoring Evaluation</span>
                  <span>{selectedHistoryItem.questions?.[0]?.score} / 10</span>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)", fontSize: "13px" }}>
                  <p><strong>✅ Strengths:</strong> {selectedHistoryItem.questions?.[0]?.feedback?.strengths}</p>
                  <p><strong>❌ Weaknesses:</strong> {selectedHistoryItem.questions?.[0]?.feedback?.weaknesses}</p>
                  <p><strong>🤖 Model Answer:</strong> {selectedHistoryItem.questions?.[0]?.feedback?.improvedAnswer}</p>
                  <p><strong>💡 Tips:</strong> {selectedHistoryItem.questions?.[0]?.feedback?.tips}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Interview;