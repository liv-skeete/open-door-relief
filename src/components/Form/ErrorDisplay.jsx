import React from 'react';

const ErrorDisplay = ({ error }) => {
  return (
    <>
      {error && <div className="error-message">{error}</div>}
    </>
  );
};

export default ErrorDisplay;