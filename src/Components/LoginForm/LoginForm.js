import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.modules.css';

function LoginForm() {
  const [username, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username || !password) {
      alert('Please fill in both fields');
      return;
    }

    setLoading(true);

    // Simulate authentication with hardcoded credentials
    const TEST_CREDENTIALS = {
      username: 'admin',
      password: 'password123'
    };

    if (username === TEST_CREDENTIALS.username && password === TEST_CREDENTIALS.password) {
      // alert('Login successful!');
      navigate('/dashboard'); // Redirect to home page
    } else {
      alert('Invalid email or password');
    }

    setLoading(false);
  };

  return (
    <div className="page-container">
      <div className='logo'></div>
      <h2>SmartSilid</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUser(e.target.value)}
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
      <div className="links">
        <Link to="/signup" className='link'>Sign Up</Link>
        <Link to="/forgot-password" className='link'>Forgot Password?</Link>
      </div>
    </div>
  );
}

export default LoginForm;
