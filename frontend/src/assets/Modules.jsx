import React from "react";
import { useNavigate } from "react-router-dom";
import "./Modules.css";

function Modules() {
  const navigate = useNavigate();

  const handleViewTopics = (level) => {
    navigate(`/topics/${level.toLowerCase().replace(" ", "-")}`);
  };

  const renderCard = (level, summary, extraInfo) => (
    <div className="module-card-large">
      <h2>{level}</h2>
      <p className="summary">{summary}</p>
      <p className="extra-info">{extraInfo}</p>
      <button onClick={() => handleViewTopics(level)} className="view-btn">
        View Topics
      </button>
    </div>
  );

  return (
    <div className="modules-three-cards">
      {renderCard(
        "Level 1",
        "Introduction to financial markets, basic concepts, and beginner-level understanding.",
        "This level is designed for absolute beginners looking to build a strong foundation."
      )}
      {renderCard(
        "Level 2",
        "Intermediate knowledge including risk, asset types, and basic investment strategies.",
        "Build upon your foundation with deeper insights into financial strategies."
      )}
      {renderCard(
        "Level 3",
        "Advanced skills including portfolio management, analysis, and real-world applications.",
        "Master advanced techniques to confidently manage investments and portfolios."
      )}
    </div>
  );
}

export default Modules;
