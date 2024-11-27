import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './BASE_URL';
import './UserPage.css';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../LoginForm/PasswordInput';
import AlertModal from './AlertModal';

function UserPage() {
  const [data, setData] = useState({});

  // New Inputted Credentials initialized as null
  const [newFName, setNewFName] = useState(null);
  // const [id, setId] = useState('');
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
  const [isChangePass, setIsChangePass] = useState(false);
  const Navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmCallback, setModalConfirmCallback] = useState(null);
  const showAlertModal = (message, onConfirm) => {
    setModalMessage(message);
    setModalConfirmCallback(() => onConfirm);
    setIsModalOpen(true); 
  };

  const handleTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken === null) {
            console.log("Refresh token is missing.");
            // return Navigate("/");
            return 0;
        }
      
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ refresh: refreshToken }), 
        });
          
        if (!response.ok) {
            console.error('Failed to refresh token. Status:', response.status);
            // return Navigate("/");
            return 0;
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        return 1;
    } catch (error) {
        console.error('Token refresh error:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/get_faculty_by_id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id: user_id }),
      });
      
      if(response.status === 401){
        const failedRefresh = await handleTokenRefresh();
        console.error(failedRefresh);

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return fetchUserData();
        } 
      }

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
    setIsChangePass(false);
    setNewPassword('');
    setConfirmPassword('');
    setOldPassword('');
  };

  const handleCancelPassClick = () => {
    setIsChangePass(false);
    setNewPassword('');
    setConfirmPassword('');
    setOldPassword('');
  };

  const handleUpdateFaculty = async () => {
    const accessToken = localStorage.getItem('accessToken');

    try {
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

      if(response.status === 401){
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleUpdateFaculty();
        }
      }

      if (response.ok) {
        showAlertModal('User updated successfully.', () => {
          setIsModalOpen(false);
          setIsEditing(false);
          fetchUserData();
        })
      }

      const data = await response.json();

      if (data.error_message) {
        return showAlertModal(data.error_message, ()=> setIsModalOpen(false)); 
      } 

      if (data.errors.length > 0) {
          console.log("0000000000000"); 
          var errorList = data.errors;
          var error_message = ""; 

          for (var i = 0; i < errorList.length; i++) {
              var error = errorList[i];
              console.log(error); 
              error_message += error + "\n";
          }
          return showAlertModal(error_message, ()=> {
              setIsModalOpen(false);
              fetchUserData(); 
          });
      }

      if (data.status_message){ 
        return showAlertModal(data.status_message, 
          () => {
              setIsModalOpen(false);
              setIsEditing(false);
              fetchUserData();
          });
      }


    } catch (error) {
      console.error('Error:', error);
      showAlertModal('Error updating user.', setIsModalOpen(false));
    }
  };

  const handleChangePassword = async () => {
    const accessToken = localStorage.getItem('accessToken');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        showAlertModal('Password must include:\n• Uppercase letters\n• Lowercase letters\n• At least 8 characters\n• A number',
            () => setIsModalOpen(false)
        );
        return;
    }

    try {
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

      if(response.status === 401){
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleChangePassword();
        }
      }

      const data = await response.json();

      if (data.error_message){
        return showAlertModal(data.error_message, ()=> setIsModalOpen(false));  // show alert for error message
      }

      if (response.ok) {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        return showAlertModal(data.status_message, () => setIsModalOpen(false));
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.status_message || 'Error changing password');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error changing password!');
    }
  };

 const openChangePassForm = async() => {
  setIsChangePass(true);
 }

  return (
    <>
      <div className="user-page">
        <div className="user-pic">
          <i className="fa-solid fa-user"></i>
        </div>
        <div className="user-info cont">
          <div className="username-row">
            <div className="user-L-side">
              <h3>{data.username}</h3>
            </div>
            <div className="user-R-side">
              <i
                className="fa-solid fa-pen edit-icon"
                onClick={handleEditClick}
              ></i>
              <button onClick={async() => {
                localStorage.clear();
                window.location.reload();
              }}>
                <i className="fa-solid fa-right-from-bracket logout-icon"></i>
              </button>
            </div>
          </div>

          {isEditing ? (
            <>
              <form onSubmit={(e) => {
                e.preventDefault();
                showAlertModal('Are you sure you want to update your profile?',
                  () => {
                    setIsModalOpen(false)
                    handleUpdateFaculty()
                  }
                );
              }}>
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
                  <button type='submit' className="update-button">
                    Update
                  </button>
                  <button className="cancel-button" onClick={handleCancelClick}>
                    Cancel
                  </button>
                </div>
              </form>
              {isChangePass ? (
                <>
                  <form onSubmit={
                    (e) => {
                      console.log('Confirm Password:', confirmPassword);
                      e.preventDefault();
                      if (newPassword !== confirmPassword) {
                        showAlertModal('Passwords do not match.', () => setIsModalOpen(false));
                        return;
                      } else {
                        return showAlertModal('Are you sure you want to update password?', () =>{
                          setIsModalOpen(false);
                          handleChangePassword();
                        });
                      }
                    }
                  }>
                    <div className="old-pass-row user-row">
                      <div className="user-label">Old Password</div>
                      <PasswordInput
                        placeholder="************"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="user-input"
                      />
                    </div>
                    <div className="new-pass-row user-row">
                      <div className="user-label">New Password</div>
                      <PasswordInput
                        placeholder="************"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="user-input"
                      />
                    </div>
                    <div className="new-pass-row user-row">
                      <div className="user-label">Confirm Password</div>
                      <PasswordInput
                        placeholder="************"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="user-input"
                        />
                      {passwordError && <div className="error-message">{passwordError}</div>}
                    </div>
                    <div className="action-btn">
                      <button type="submit" className="update-pass-button">
                        Update Password
                      </button>
                      <button className="cancel-button" onClick={handleCancelPassClick}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                  <>
                    <div className='open-pass-form'>
                      <button className='update-pass-button' onClick={openChangePassForm}>
                        Change Password
                      </button>
                    </div>
                  </>
                )}
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
      

        <AlertModal
        message={modalMessage}
        onConfirm={modalConfirmCallback} 
        onCancel={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
      />
    </>
  );
}

export default UserPage;
