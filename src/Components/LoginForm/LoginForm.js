import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.modules.css';
import { API_BASE_URL } from '../Dashboard/config';

function LoginForm() {
  const [username, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!username || !password) {
      alert('Please fill in both fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        // Handle non-JSON responses
        const text = await response.text();
        console.error('Response text:', text);
        alert(`Login failed: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      if (data.access && data.refresh) {
        // Store tokens in local storage
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        alert('Login successful!');
        navigate('/dashboard'); // Redirect to the dashboard or home page
      } else {
        alert('Login failed: No access token received');
      }

    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchProtectedData = async () => {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetch(`${API_BASE_URL}/api/protected`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      await handleTokenRefresh(); // Refresh token if unauthorized
    } else if (!response.ok) {
      throw new Error('Failed to fetch protected data');
    }

    return response.json(); // Return the protected data
  };

  const handleTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const tokens = await response.json();
    localStorage.setItem('accessToken', tokens.access);
  };

  return (
    <div className='login'>
      <div className="page-container">
        <div className='logo'></div>
        <h2>SmartSilid</h2>
        <form onSubmit={handleSubmit}>
          <div className="username-div">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUser(e.target.value)}
              required
            />
          </div>
          <div className="password-div">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="btn-div">
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <Link to="/signup" className='link'>Sign Up</Link>
          </div>
        </form>
        <div className="links">
          <Link to="/forgot-password" className='link'>Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
