import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.css';
// import './SignForm.css';
import { API_BASE_URL } from '../Dashboard/config';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [first_name, setFirstname] = useState('');
  const [middle_initial, setMiddlename] = useState('');
  const [last_name, setLastname] = useState('');
  const [OU, setOU] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Function to get the CSRF token from a meta tag
  const getCSRFToken = () => {
    const tokenElement = document.querySelector('meta[name="csrf-token"]');
    return tokenElement ? tokenElement.getAttribute('content') : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password || !confirmPassword || !first_name || !last_name) {
      alert('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/sign_up_admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(), // Include the CSRF token
        },
        body: JSON.stringify({
          username,
          password,
          first_name,
          last_name,
          middle_initial,
          type: 'admin',
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Response text:', text);
        alert(`Signup failed: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      console.log(`TYPE: `, data);
      if (data.status_message) {
        alert(data.status_message);
      } else {
        alert('Signup successful');
      }
      navigate('/');

    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="sign-up">
      <div className="page-container">
        <div className="logo-cont">
          <div className="logo"></div>
          <h2>Smart<span>Silid</span></h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className=' log-input'>
            <label htmlFor="firstname">First Name:</label>
            <input
              type="text"
              id="firstname"
              value={first_name}
              onChange={(e) => setFirstname(e.target.value)}
              required
            />
          </div>
          <div className=' log-input'>
            <label htmlFor="middlename">Middle Initial:</label>
            <input
              type="text"
              id="middlename"
              value={middle_initial}
              onChange={(e) => setMiddlename(e.target.value)}
            />
          </div>
          <div className=' log-input'>
            <label htmlFor="lastname">Last Name:</label>
            <input
              type="text"
              id="lastname"
              value={last_name}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
          </div>
          <div className="creds-div log-input">
            <div>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="password-div">
            <label htmlFor="password">Password:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="see-pass-btn"
                onClick={togglePasswordVisibility}
              >
                <i className={`fa ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </button>
            </div>
          </div>
          <div className="password-div">
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="see-pass-btn"
                onClick={toggleConfirmPasswordVisibility}
              >
                <i className={`fa ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </button>
            </div>
          </div>
          <div className="btn-div">
            <button type="submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>
        </form>
        <div className="link-div">
          <Link to="/" className="link">Cancel</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
