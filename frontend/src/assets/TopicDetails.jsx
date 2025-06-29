import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import CommentSection from "./CommentSection";
import Swal from "sweetalert2";
import "./TopicDetails.css";

const TopicDetails = () => {
  const { levelId, topicId } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const userEmail = JSON.parse(localStorage.getItem("user"))?.email || "guest@example.com";

  const numericLevel = parseInt(levelId.replace(/[^0-9]/g, ""));
  const topicNumber = parseInt(topicId.split("-")[2], 10);
  const topicPrefix = topicId.split("-").slice(0, 2).join("-");
  const isFirstTopic = topicNumber === 1;
  const isLastTopic = topicNumber === 10;

  const getPreviousLink = () => {
    if (numericLevel === 1 && isFirstTopic) return "/modules";
    if (numericLevel > 1 && isFirstTopic) {
      const prevLevel = numericLevel - 1;
      return `/levels/${prevLevel}/topics/level${prevLevel}-topic-010`;
    }
    return `/levels/${levelId}/topics/${topicPrefix}-${String(topicNumber - 1).padStart(3, "0")}`;
  };

  const nextLink = isLastTopic
    ? null
    : `/levels/${levelId}/topics/${topicPrefix}-${String(topicNumber + 1).padStart(3, "0")}`;

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        setTopic(null);
        setSelectedAnswers({});
        setSubmitted(false);
        setScore(null);

        const levelNumber = levelId.replace(/[^0-9]/g, "");
        const res = await axios.get(`http://localhost:2100/api/levels/${levelNumber}/topics/${topicId}`);
        setTopic(res.data);
        window.scrollTo(0, 0);

        if (!sessionStorage.getItem("visitedTopic")) {
          sessionStorage.setItem("visitedTopic", "true");
        } else {
          navigate(`/levels/${levelId}/topics/${topicId}`, { replace: true });
        }
      } catch (err) {
        setError("Could not load topic details.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [levelId, topicId, navigate]);

  const formatContent = (text) => {
    return text.split("\n").map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  const handleSubmit = async () => {
    const totalQuestions = topic.quiz.length;
    const answered = Object.keys(selectedAnswers).length;
    const unansweredCount = totalQuestions - answered;

    if (answered === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Answers Selected",
        text: "Please answer at least one question before submitting.",
      });
      return;
    }

    if (unansweredCount > 0) {
      const result = await Swal.fire({
        title: "Some Questions Unanswered",
        text: `You have left ${unansweredCount} question(s) unanswered. Do you still want to submit?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Submit Anyway",
        cancelButtonText: "No, Go Back",
      });

      if (!result.isConfirmed) return;
    }

    let correct = 0;
    topic.quiz.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      const selectedText = q.options[selected];
      if (selectedText === q.correctAnswer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    Swal.fire({
      title: "Quiz Submitted!",
      text: `You scored ${correct} out of ${totalQuestions}.`,
      icon: "success",
    });

    try {
      await axios.post("http://localhost:2100/api/quiz-scores/submit", {
        userEmail,
        levelId: numericLevel,
        topicId: topic.customId,
        score: correct,
        total: totalQuestions,
      });
    } catch (err) {
      if (err.response?.status === 409) {
        Swal.fire("⚠️ Duplicate", "You have already submitted this quiz.", "info");
      } else {
        console.error("Quiz submission error", err);
        Swal.fire("Error", "There was an error submitting your quiz.", "error");
      }
    }
  };

  if (loading) return <div className="loading">Loading topic...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!topic) return <div className="error">Topic not found</div>;

  return (
    <div className="topic-details-container">
      <div className="topic-header">
        <div className="series-title">{topic.seriesTitle || topic.title}</div>
        <h1>{topic.title || topic.topic}</h1>
        <Link to={`/topics/level-${numericLevel}`} className="back-link">
          ← Back to Topics
        </Link>
      </div>

      <div className="topic-content">
        {topic.image && (
          <div className="topic-image" style={{ margin: "20px 0", textAlign: "center" }}>
            <img
              src={topic.image}
              alt={topic.title || topic.topic}
              style={{
                maxWidth: "100%",
                maxHeight: 300,
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(25, 118, 210, 0.10)",
              }}
            />
          </div>
        )}

        <div className="topic-main-content">{formatContent(topic.content || "")}</div>

        {topic.quiz?.length > 0 && (
          <div className="topic-quiz">
            <h2>Prove Yourself</h2>
            {topic.quiz.map((q, idx) => (
              <div
                key={idx}
                className={`quiz-question ${submitted && selectedAnswers[idx] === undefined ? "unanswered-highlight" : ""
                  }`}
              >
                <h4>Question {idx + 1}</h4>
                <p>{q.question}</p>
                <div className="quiz-options">
                  {q.options.map((opt, i) => {
                    const isSelected = selectedAnswers[idx] === i;
                    const isCorrect = q.correctAnswer === opt;

                    let optionClass = "";
                    let symbol = "";

                    if (submitted) {
                      if (isCorrect) {
                        optionClass = "correct";
                        symbol = "✔";
                      } else if (isSelected) {
                        optionClass = "wrong";
                        symbol = "❌";
                      }
                    }

                    return (
                      <label
                        key={i}
                        className={`quiz-option ${optionClass}`}
                        style={{
                          pointerEvents: submitted ? "none" : "auto",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="radio"
                            name={`question-${idx}`}
                            value={i}
                            checked={selectedAnswers[idx] === i}
                            onChange={() =>
                              setSelectedAnswers((prev) => ({ ...prev, [idx]: i }))
                            }
                            disabled={submitted}
                          />
                          <span>{opt}</span>
                        </div>
                        {submitted && <span className="feedback-icon">{symbol}</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            {!submitted && (
              <button className="submit-btn" onClick={handleSubmit}>
                Submit Quiz
              </button>
            )}

            {submitted && (
              <div className="quiz-score-result">
                ✅ You scored {score} out of {topic.quiz.length}
              </div>
            )}
          </div>
        )}

        <div className="topic-navigation-buttons" style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
          <button className="nav-button" onClick={() => navigate(getPreviousLink(), { replace: true })}>
            ← Previous
          </button>
          <Link to="/modules" className="nav-button">Module Page</Link>
          {nextLink && (
            <button className="nav-button" onClick={() => navigate(nextLink, { replace: true })}>
              Next →
            </button>
          )}
        </div>

        <hr className="comment-divider" />
        <div className="comment-section">
          <h2 className="discussion-title">💬 Discussion</h2>
          <CommentSection topicId={topic.customId} userEmail={userEmail} />
        </div>
      </div>
    </div>
  );
};

export default TopicDetails;