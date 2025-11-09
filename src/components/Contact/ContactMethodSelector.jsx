import React from 'react';

const ContactMethodSelector = ({ 
  contactMethods, 
  onChange, 
  onVerify,
  verificationInProgress,
  verificationCode,
  setVerificationCode
}) => {
  const handleChange = (method, field, value) => {
    onChange(method, field, value);
  };

  return (
    <div className="contact-methods">
      {['email', 'phone', 'other'].map(method => (
        <div key={method} className="contact-method">
          <div className="contact-header">
            <label>
              <input
                type="checkbox"
                checked={contactMethods[method]?.share || false}
                onChange={e => handleChange(method, 'share', e.target.checked)}
                disabled={!contactMethods[method]?.verified && method !== 'other'}
              />
              Share {method.charAt(0).toUpperCase() + method.slice(1)}
            </label>
            
            {contactMethods[method]?.verified ? (
              <span className="verified-badge">Verified</span>
            ) : method !== 'other' && (
              <button 
                className="verify-button"
                onClick={() => onVerify(method)}
                disabled={!contactMethods[method]?.value || verificationInProgress}
              >
                Verify
              </button>
            )}
          </div>

          <input
            type={method === 'email' ? 'email' : 'text'}
            value={contactMethods[method]?.value || ''}
            onChange={e => handleChange(method, 'value', e.target.value)}
            placeholder={`Enter your ${method}`}
            required={method !== 'other'}
          />

          {verificationInProgress === method && (
            <div className="verification-code">
              <input
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
              />
              <button 
                onClick={() => verifyContactMethod(method)}
                disabled={verificationCode.length !== 6}
              >
                Submit Code
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ContactMethodSelector;