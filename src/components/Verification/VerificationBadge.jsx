import React from 'react';

const VerificationBadge = ({ verified }) => {
  return verified ? (
    <span className="verified-badge">✓ Verified</span>
  ) : (
    <span className="unverified-badge">Unverified</span>
  );
};

export default VerificationBadge;