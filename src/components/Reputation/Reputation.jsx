import React from 'react';
import './Reputation.css';

const Reputation = ({ userId }) => {
  const handleRateUp = () => {
    // User rated up
    alert("Thank you for your positive feedback!");
  };

  const handleRateDown = () => {
    // User rated down
    alert("Thank you for your feedback. We take this seriously.");
  };

  return (
    <div className="reputation-container">
      <h4>Reputation</h4>
      <button onClick={handleRateUp} className="thumb-up">
        👍
      </button>
      <button onClick={handleRateDown} className="thumb-down">
        👎
      </button>
    </div>
  );
};

export default Reputation;