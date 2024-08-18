import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.modules.css';

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
      const response = await fetch('http://192.168.10.118:8000/auth_user', { // Update URL as needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()  // Include the CSRF token
        },
        body: JSON.stringify({
          username,
          password
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
      if (data.success) {
        alert(data.status_message);
        navigate('/dashboard'); // Redirect to the dashboard or home page
      } else {
        alert(data.status_message);
      }

    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to get the CSRF token from a meta tag
  const getCSRFToken = () => {
    const tokenElement = document.querySelector('meta[name="csrf-token"]');
    return tokenElement ? tokenElement.getAttribute('content') : '';
  };

  return (
    <div className="page-container">
      <div className='logo'></div>
      <h2>SmartSilid</h2>
      <form onSubmit={handleSubmit}>
        <div class="username-div">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUser(e.target.value)}
            required
          />
        </div>
        <div class="password-div">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div class="btn-div">
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
  );
}

export default LoginForm;
