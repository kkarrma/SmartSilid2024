import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.modules.css';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [first_name, setFirstname] = useState('');
  const [middle_initial, setMiddlename] = useState('');
  const [last_name, setLastname] = useState('');
  const [OU, setOU] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to get the CSRF token from a meta tag
  const getCSRFToken = () => {
    const tokenElement = document.querySelector('meta[name="csrf-token"]');
    return tokenElement ? tokenElement.getAttribute('content') : '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!username || !password || !confirmPassword || !first_name || !last_name || !OU) {
      alert('Please fill in all required fields');
      return;
    }
  
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch('http://192.168.10.118:8000/create_user', { // Update URL as needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()  // Include the CSRF token
        },
        body: JSON.stringify({
          username,
          password,
          first_name,
          middle_initial,
          last_name,
          OU
        }),
      });
  
      if (!response.ok) {
        // Handle non-JSON responses
        const text = await response.text();
        console.error('Response text:', text);
        alert(`Signup failed: ${response.status} ${response.statusText}`);
        return;
      }
  
      // Use data.then to handle the JSON response
      const data = await response.json();
      if (data.status_message) {
        alert(data.status_message); // Display the status_message from the response
      } else {
        alert('Signup successful'); // Fallback message if status_message is not present
      }
      // navigate('/loginform'); // Redirect to home page or login page
  
    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="page-container">
      <div className='logo'></div>
      <h2>SmartSilid</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstname">First Name:</label>
          <input
            type="text"
            id="firstname"
            value={first_name}
            onChange={(e) => setFirstname(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="middlename">Middle Initial:</label>
          <input
            type="text"
            id="middlename"
            value={middle_initial}
            onChange={(e) => setMiddlename(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="lastname">Last Name:</label>
          <input
            type="text"
            id="lastname"
            value={last_name}
            onChange={(e) => setLastname(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="ou">Section:</label>
          <input
            type="text"
            id="ou"
            value={OU}
            onChange={(e) => setOU(e.target.value)}
          />
        </div>
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
        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default SignupForm;
