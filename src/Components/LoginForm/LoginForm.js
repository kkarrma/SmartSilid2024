import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.css';
import { API_BASE_URL } from '../Dashboard/BASE_URL';
import AlertModal from '../Dashboard/AlertModal';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmCallback, setModalConfirmCallback] = useState(null);
  const showAlertModal = (message, onConfirm) => {
    setModalMessage(message);
    setModalConfirmCallback(() => onConfirm);
    setIsModalOpen(true); 
  };

  const handleSubmit = async () => {

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
        const text = await response.text();
        console.error('Response text:', text);
        return;
      }

      const data = await response.json();
      if (data.access && data.refresh) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        localStorage.setItem('id', data.user_id);
        localStorage.setItem('type', data.type);
        showAlertModal('Login successful!', () => {
          setIsModalOpen(false);
          navigate('/dashboard');
        });
      } else {
        console.error('Response text:', data.detail);
        showAlertModal(`Login failed: ${data.detail}`, () => setIsModalOpen(false));
      }

    } catch (error) {
      console.error('Error:', error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login">
      <div className="page-container">
        <div className="logo-cont">
          <div className="logo"></div>
          <h2>Smart<span>Silid</span></h2>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault(); 
          
          if (!username || !password) {
            showAlertModal('Please fill in both fields.', () => setIsModalOpen(false));
            return;
          }
          handleSubmit();
        }}>
          <div className="username-div log-input">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              className="username-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="password-div log-input">
            <label htmlFor="password">Password:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="pass-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="see-pass-btn"
              >
                <i className={`fa ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </button>
            </div>
          </div>
          <div className="btn-div">
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <div className="link-div">
          <Link to="/signup" className="link sign">Set up Admin →</Link>
        </div>
      </div>

      <AlertModal
        message={modalMessage}
        onConfirm={modalConfirmCallback} 
        onCancel={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
      />
    </div>
  );
}

export default LoginForm;
