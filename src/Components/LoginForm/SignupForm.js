import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginForm.css';
// import './SignForm.css';
import { API_BASE_URL } from '../Dashboard/BASE_URL';
import AlertModal from '../Dashboard/AlertModal';

function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [first_name, setFirstname] = useState('');
  const [middle_initial, setMiddlename] = useState('');
  const [last_name, setLastname] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      const response = await fetch(`${API_BASE_URL}/sign_up_admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        showAlertModal(`Signup failed: ${response.status} ${response.statusText}`, () => setIsModalOpen(false));
        return;
      }

      const data = await response.json();
      
      if(data.error_message){
        return showAlertModal(data.error_message, () => setIsModalOpen(false));
      }

      else if (data.status_message){
        return showAlertModal(data.status_message, () => {
          setIsModalOpen(false);
          navigate('/');
        });
      }

      

    } catch (error) {
      console.error('Error:', error);
      showAlertModal(`An error occurred: ${error.message}`, () => setIsModalOpen(false));
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={(e) => {
          e.preventDefault();
          if (password !== confirmPassword) {
            showAlertModal('Passwords do not match.', () => setIsModalOpen(false));
            return;
          }
          handleSubmit();
        }}>
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
            <div className="link-div">
              <Link to="/" className="link">Cancel</Link>
            </div>
          </div>
        </form>
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

export default SignupForm;
