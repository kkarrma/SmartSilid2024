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
  const [newLName, setNewLName] = useState(null);
  const [newMInit, setNewMInit] = useState(null);
  const [newUsername, setNewUsername] = useState(null);
  const [newType, setNewType] = useState(null);

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
              <input
                type="text"
                placeholder={data.type}
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onBlur={() => newType === '' && setNewType(data.type)}
                className="user-input"
              />
            </div>
            <div className="action-btn">
              <button className="update-button" onClick={handleUpdateClick}>
                Update
              </button>
              <button className="cancel-button" onClick={handleCancelClick}>
                Cancel
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
    </div>
  );
}

export default UserPage;
