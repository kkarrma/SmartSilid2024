import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Please enter your email');
      return;
    }

    setLoading(true);

    // Simulate forgot password logic here
    // Assume email is sent successfully
    alert('Password reset email sent!');
    navigate('/reset-password');

    setLoading(false);
  };

  return (
    <div className="page-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending email...' : 'Send Reset Email'}
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
