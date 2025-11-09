import React from 'react';

const FormButton = ({ children, onClick, disabled }) => {
  return (
    <button
      type="submit"
      className="form-button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default FormButton;