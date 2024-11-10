import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import './UserPage.css';
import { useNavigate } from 'react-router-dom';

function UserPage() {
  const [data, setData] = useState({
    firstName: 'John',
    middleInitial: 'D',
    lastName: 'Doe',
    type: 'Faculty',
  });

  // New Inputted Credentials initialized as null
  const [newFName, setNewFName] = useState(null);
  const [id, setId] = useState('');
  const [newLName, setNewLName] = useState(null);
  const [newMInit, setNewMInit] = useState(null);
  const [newUsername, setNewUsername] = useState(null);
  const [newType, setNewType] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const user_id = localStorage.getItem('id');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/get_faculty_by_id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ id: user_id }),
        });

        if (response.ok) {
          const userData = await response.json();
          setData(userData.faculty_info);
        } else {
          alert('Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('An error occurred while fetching user data.');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleEditClick = () => {
    setIsEditing(true);
    setNewUsername(data.new_username);
    setNewFName(data.first_name);
    setNewLName(data.last_name);
    setNewMInit(data.middle_initial);
    setNewType(data.type);
    setNewPassword('');
    setConfirmPassword('');
    setOldPassword('');
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  const handleUpdateClick = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/update_faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: user_id,
          username: newUsername,
          first_name: newFName,
          last_name: newLName,
          middle_initial: newMInit,
          type: newType,
        }),
      });

      if (response.ok) {
        alert('User updated successfully!');
        const data = await response.json();
        console.log(data);
        setIsEditing(false);
      } else {
        alert('Error updating user!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error updating user!');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/change_password_faculty_by_faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id: user_id,
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        alert('Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.status_message || 'Error changing password');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error changing password!');
    }
  };

  return (
    <div className="user-page">
      <div className="user-pic">
        <i className="fa-solid fa-user"></i>
      </div>
      <div className="user-info cont">
        <div className="username-row">
          <h3>{data.username}</h3>
          <i
            className="fa-solid fa-pen edit-icon"
            onClick={handleEditClick}
          ></i>
        </div>

        {isEditing ? (
          <>
            <div className="username-row user-row">
              <div className="user-label">Username</div>
              <input
                type="text"
                placeholder={data.username}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                onBlur={() => newUsername === '' && setNewUsername(data.username)}
                className="user-input"
              />
            </div>
            <div className="firstname-row user-row">
              <div className="user-label">First Name</div>
              <input
                type="text"
                placeholder={data.first_name}
                value={newFName}
                onChange={(e) => setNewFName(e.target.value)}
                onBlur={() => newFName === '' && setNewFName(data.first_name)}
                className="user-input"
              />
            </div>
            <div className="middleinit-row user-row">
              <div className="user-label">Middle Initial</div>
              <input
                type="text"
                placeholder={data.middle_initial}
                value={newMInit}
                onChange={(e) => setNewMInit(e.target.value)}
                onBlur={() => newMInit === '' && setNewMInit(data.middle_initial)}
                className="user-input"
              />
            </div>
            <div className="lastname-row user-row">
              <div className="user-label">Last Name</div>
              <input
                type="text"
                placeholder={data.last_name}
                value={newLName}
                onChange={(e) => setNewLName(e.target.value)}
                onBlur={() => newLName === '' && setNewLName(data.last_name)}
                className="user-input"
              />
            </div>
            <div className="role-row user-row">
              <div className="user-label">Role</div>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="user-input"
              >
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
            <div className="action-btn">
              <button className="update-button" onClick={handleUpdateClick}>
                Update
              </button>
              <button className="cancel-button" onClick={handleCancelClick}>
                Cancel
              </button>
            </div>

            <div className="change-pass-row user-row">
              <div className="user-label">Old Password</div>
              <input
                type="password"
                placeholder="************"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="user-input"
              />
              <div className="user-label">New Password</div>
              <input
                type="password"
                placeholder="************"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="user-input"
              />
              <div className="user-label">Confirm Password</div>
              <input
                type="password"
                placeholder="************"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="user-input"
              />
              {passwordError && <div className="error-message">{passwordError}</div>}
              <button className="update-button" onClick={handleChangePassword}>
                Change Password
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="firstname-row user-row">
              <div className="user-label">First Name</div>
              <div className="user-value">{data.first_name}</div>
            </div>
            <div className="middleinit-row user-row">
              <div className="user-label">Middle Initial</div>
              <div className="user-value">{data.middle_initial}</div>
            </div>
            <div className="lastname-row user-row">
              <div className="user-label">Last Name</div>
              <div className="user-value">{data.last_name}</div>
            </div>
            <div className="role-row user-row">
              <div className="user-label">Role</div>
              <div className="user-value">{data.type}</div>
            </div>
          </>
        )}
      </div>
      <div className="user-logout">
        <button onClick={async() => {
          localStorage.clear();
          window.location.reload();
        }}>
          <i className="fa-solid fa-right-from-bracket logout-icon"></i>
        </button>
      </div>
    </div>
  );
}

export default UserPage;
