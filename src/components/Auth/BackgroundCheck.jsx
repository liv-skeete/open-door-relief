import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';
import Form from '../Form/Form';
import FormInput from '../Form/FormInput';
import FormButton from '../Form/FormButton';
import ErrorDisplay from '../Form/ErrorDisplay';
import './Auth.css';

const BackgroundCheck = ({ onComplete }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [ssn, setSsn] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const functions = getFunctions();
      const initiateBackgroundCheck = httpsCallable(functions, 'initiateBackgroundCheck');
      
      await initiateBackgroundCheck({
        userId: user.uid,
        firstName,
        lastName,
        dob,
        ssn,
        email: user.email,
        phone: user.phoneNumber || ''
      });

      setSuccess(true);
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Background check error:', err);
      setError(err.message || 'Failed to initiate background check');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background-check-container">
      <h2>Background Check</h2>
      <p className="description">
        For the safety of our community, we require a background check for all users offering shelter.
        This check is performed by our verified partner Checkr.
      </p>
      
      {success ? (
        <div className="success-message">
          <h3>Background Check Initiated</h3>
          <p>
            Your background check has been successfully initiated.
            This process typically takes 1-2 business days.
            You'll receive an email when your results are available.
          </p>
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <ErrorDisplay error={error} />

          <FormInput
            label="First Name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <FormInput
            label="Last Name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <FormInput
            label="Date of Birth (MM/DD/YYYY)"
            type="text"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            placeholder="MM/DD/YYYY"
            required
          />

          <FormInput
            label="Last 4 Digits of SSN"
            type="text"
            value={ssn}
            onChange={(e) => setSsn(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Last 4 digits"
            required
          />

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            <label>
              I authorize Open Door Relief to perform a background check and certify that
              the information provided is accurate. I understand this is required for
              the safety of our community.
            </label>
          </div>

          <FormButton disabled={loading || !consent}>
            {loading ? 'Processing...' : 'Submit Background Check'}
          </FormButton>
        </Form>
      )}
    </div >
  );
};

export default BackgroundCheck;