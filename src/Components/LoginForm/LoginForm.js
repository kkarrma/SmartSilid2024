import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hardcoded credentials for testing
  const TEST_CREDENTIALS = {
    email: 'user@example.com',
    password: 'password123'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      alert('Please fill in both fields');
      return;
    }

    setLoading(true);

    // Simulate authentication with hardcoded credentials
    if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
      alert('Login successful!');
      navigate('/dashboard'); // Redirect to dashboard
    } else {
      alert('Invalid email or password');
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <h2>Login</h2>
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
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
