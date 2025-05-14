import React from "react";

const ErrorDisplay = ({ message }) => {
  if (!message) return null;

  return <p style={{ color: "red" }}>{message}</p>;
};

export default ErrorDisplay;