import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './config';
import './FacultyRecord.css';
import { useNavigate } from 'react-router-dom';

function FacultyRecord() {
  const [first_name, setFirstname] = useState('');
  const [last_name, setLastname] = useState('');
  const [middle_initial, setMiddleinitial] = useState('');
  const [username, setUsername] = useState('');
  const [type, setType] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  // New Inputted Credentials 
  const [id, setId] = useState('');
  const [newFName, setNewFName] = useState('');
  const [newLName, setNewLName] = useState('');
  const [newMInit, setNewMInit] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newType, setNewType] = useState('');
  // const [newPass,setNewPass] = useState('');
  // const [newConfPass,setNewConfPass] = useState('');

  const [editFormVisible, setEditFormVisible] = useState(false);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [facultyData, setFacultyData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [availableRfids, setAvailableRfids] = useState([]);
  const [rfidBindings, setRfidBindings] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInput = useRef(null);
  const Navigate = useNavigate();

  useEffect(() => {
    setUsername(`${first_name}.${last_name}.${middle_initial}`);
  }, [first_name, last_name, middle_initial]);

  const handleTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken === null) {
        console.log("Refresh token is missing.");
        return Navigate('/'); 
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ refresh: refreshToken }), 
          });
          
          if (!response.ok) {
            console.error('Failed to refresh token. Status:', response.status);
            return Navigate('/'); 
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
    } catch (error) {
        console.error('Token refresh error:', error);
    }
  };

  const fetchFaculty = async () => { 
    const accessToken = localStorage.getItem('accessToken');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_faculty_and_rfid`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
         },
        body: JSON.stringify({ username }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setFacultyData(data.faculties);
        const rfids = data.rfid.map(r => r.rfid);
        setAvailableRfids(rfids);
      } else {
        setErrorMessage('Failed to fetch faculty data. Please try again later.');
      }
    } catch (error) {
      if (error.response.status === 401) {
        await handleTokenRefresh();
      }
      setErrorMessage('Error fetching faculty data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleAddFaculty = async (e) => {
    const accessToken = localStorage.getItem('accessToken');
    e.preventDefault();
    if (!first_name || !last_name || !type || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields correctly.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password does not matched. Try again.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/create_faculty`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({
          first_name,
          last_name,
          middle_initial,
          username: `${first_name}.${last_name}.${middle_initial}`,
          type,
          password,
        }),
      });

      if (response.ok) {
        fetchFaculty();
        handleCancelBtn();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to create faculty. Please try again.');
      }
    } catch (error) {
      if (error.response.status === 401) {
        await handleTokenRefresh();
      }
      setErrorMessage('An error occurred while creating faculty. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFaculty = async (e) => {
    const accessToken = localStorage.getItem('accessToken');
  
    if (!newFName || !newLName || !newMInit || !newUsername || !newType) {
      setErrorMessage('Please fill in all fields correctly.');
      return;
    }
  
    setLoading(true);
    setErrorMessage('');
  
    try {
      const response = await fetch(`${API_BASE_URL}/update_faculty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          id : id,
          username: newUsername,
          first_name: newFName,
          last_name: newLName,
          middle_initial: newMInit,
          type: newType,
        }),
      });
  
      if (response.ok) {
        fetchFaculty(); // Refresh faculty data
        setEditFormVisible(false);
        const data = await response.json();
        console.log(data);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to update faculty. Please try again.');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        await handleTokenRefresh();
        handleEditFaculty(e);
      } else {
        setErrorMessage('An error occurred while updating faculty. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (faculty) => {
    setId(faculty.id);
    setNewFName(faculty.first_name);
    setNewLName(faculty.last_name);
    setNewMInit(faculty.middle_initial);
    setNewUsername(faculty.username);
    setSelectedFaculty(faculty);
    setNewType(faculty.type);
    setEditFormVisible(true);
    setAddFormVisible(false);
  };

  const handleChangePassword = async (faculty, newPassword) => {
    const accessToken = localStorage.getItem('accessToken');
    console.log('Attempting to change password for faculty:', faculty);
    console.log('New password:', newPassword);
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/change_password_faculty_by_admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          id: id,
          new_password: newPassword,
        }),
        
      })
    } catch (error) {
    
    }
  }


  const handleDeleteFaculty = async (facultyUsername) => { 
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/delete_faculty`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ username: facultyUsername }),
      });
      if (response.ok) {
        fetchFaculty();
      } else {
        setErrorMessage('Failed to delete faculty. Please try again later.');
      }
    } catch (error) {
      if (error.response.status === 401) {
        await handleTokenRefresh();
      }
      setErrorMessage('An error occurred while deleting faculty. Please check your connection.');
    }
  };

  const handleDeleteRFID = async (rfid) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/delete_rfid`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ rfid }),
      });
      if (response.ok) {
        fetchFaculty();
      } else {
        setErrorMessage('Failed to delete RFID. Please try again later.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while deleting RFID. Please check your connection.');
    }
  };

  const handleBindRFID = async (username, rfid) => {
    const accessToken = localStorage.getItem('accessToken');
    const facultyUsername = rfidBindings[rfid];
    if (facultyUsername !== 'none') {
      try {
        const response = await fetch(`${API_BASE_URL}/bind_rfid`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ username: facultyUsername, rfid }),
        });
        if (response.ok) {
          fetchFaculty();
        } else {
          setErrorMessage('Failed to bind RFID. Please try again later.');
        }
      } catch (error) {
        if (error.response.status === 401) {
          await handleTokenRefresh();
        }
        setErrorMessage('An error occurred while binding RFID. Please check your connection.');
      }
    }
  };

  const handleUnbindRFID = async (facultyUsername, rfid) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/bind_rfid`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ username: '', rfid: '' }),
      });
      if (response.ok) {
        fetchFaculty();
      } else {
        setErrorMessage('Failed to unbind RFID. Please try again later.');
      }
    } catch (error) {
      if (error.response.status === 401) {
        await handleTokenRefresh();
      }
      setErrorMessage('An error occurred while unbinding RFID. Please check your connection.');
    }
  };

  const handleCancelBtn = () => {
    setFirstname('');
    setLastname('');
    setMiddleinitial('');
    setType('');
    setPassword('');
    setConfirmPassword('');
    setEditFormVisible(false);
    setAddFormVisible(false);
    setErrorMessage('');
  };

  const handleToggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleFacultyFileUpload = async () => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/upload_faculty`, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ file: fileInput.current.files[0] }),
      })
    } catch (error) {
      if (error.response.status === 401) {
        await handleTokenRefresh();
      }
      setErrorMessage('Failed to upload faculty. Please check your connection.');

    }
  }

  return (
    <>
      <div className='faculty-record'>
        <div className='add-faculty-form cont'>
          {!addFormVisible && (
            <div className='adding-section-btn'>
               <div className='adding-btn-section'>
                <button onClick={() => {
                  setAddFormVisible(true);
                  setEditFormVisible(false);
                }}>
                  Add Faculty
                </button>
                <div className='adding-file-section'>
                    <input 
                        className='file-batch-input'
                        type='file'
                        ref={fileInput}
                        accept=".xlsx, .xls"
                    />
                    <button className="add-section-btn" onClick={handleFacultyFileUpload}>
                        Upload
                    </button>
                </div>
              </div>
            </div>
          )}

          {addFormVisible && (
            <form className="faculty-form">
              <input
                type="text"
                placeholder="First Name"
                value={first_name}
                onChange={(e) => setFirstname(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Middle Initial"
                value={middle_initial}
                onChange={(e) => setMiddleinitial(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={last_name}
                onChange={(e) => setLastname(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="">Choose user type</option>
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
              </select>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" onClick={handleAddFaculty} disabled={loading}>
                {loading ? 'Adding...' : 'Add Faculty'}
              </button>
              <button type="button" onClick={handleCancelBtn}>Cancel</button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
          )}
        </div>

        <div className="edit-faculty-form cont">
          {editFormVisible && (
            <form className="faculty-form">
              <input
                type="text"
                placeholder="First Name"
                value={newFName}
                onChange={(e) => setNewFName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Middle Initial"
                value={newMInit}
                onChange={(e) => setNewMInit(e.target.value)}
              />
              <input
                type="text"
                placeholder="Last Name"
                value={newLName}
                onChange={(e) => setNewLName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                required
              >
                <option value="">Choose user type</option>
                <option value="admin">Admin</option>
                <option value="faculty">Faculty</option>
              </select>
              <button type="button" onClick={handleEditFaculty} disabled={loading}>
                {loading ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={handleCancelBtn}>Cancel</button>
              {errorMessage && <p className="error-message">{errorMessage}</p>}

              <div className="change-pass-div">
                <label htmlFor="password">New Password: </label>
                <input
                  type="password"
                  placeholder="**********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="password">Confirm Password: </label>
                <input
                  type="password"
                  placeholder="**********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => handleChangePassword(selectedFaculty, password)}>
                  Change Password
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="faculty-list cont">
          {Array.isArray(facultyData) && facultyData.length > 0 ? (
            facultyData.map((faculty, index) => (
              <div key={index} className="faculty-item">
                <div className="faculty-header" onClick={() => handleToggleExpand(index)}>
                  <span>{expandedIndex === index ? '-' : '+'}</span>
                  <strong>{`${faculty.username}`}</strong>
                  <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                    <button onClick={() => handleDeleteFaculty(faculty.username)}>
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                    <button onClick={() => {
                      handleEditClick(faculty);
                    }}>
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                  </div>
                </div>
                {expandedIndex === index && (
                  <div className="faculty-details">
                    <ul>
                      {faculty.rfid && faculty.rfid.length > 0 ? (
                        faculty.rfid.map((rfid, rfidIndex) => (
                          <li key={rfidIndex} style={{ display: 'flex', alignItems: 'center' }}>
                            {rfid}
                            <button 
                              style={{ marginLeft: '8px', cursor: 'pointer' }} 
                              onClick={() => handleUnbindRFID(faculty.username, faculty.rfid)}
                            >
                              -
                            </button>
                          </li>
                        ))
                      ) : (
                        <li>No RFID allocated</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No faculty records found.</p>
          )}
        </div>

        <div className="rfid-list cont" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3>Available RFIDs</h3>
          {availableRfids.length > 0 ? (
            availableRfids.map((rfid, index) => (
              <div key={index} className="rfid-item" style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginLeft: '8px' }}>{rfid}</span>
                <select 
                  value={rfidBindings[rfid] || 'none'} 
                  onChange={(e) => setRfidBindings({ ...rfidBindings, [rfid]: e.target.value })}
                >
                  <option value="none">None</option>
                  {facultyData.map((faculty, facultyIndex) => (
                    <option key={facultyIndex} value={faculty.username}>
                      {`${faculty.first_name} ${faculty.last_name}`}
                    </option>
                  ))}
                </select>
                <button 
                  style={{ marginLeft: '8px', cursor: 'pointer' }} 
                  onClick={() => handleBindRFID(rfidBindings[rfid], rfid)} // Pass the selected username and RFID
                >
                  Add
                </button>
                <button 
                  style={{ marginLeft: '8px', cursor: 'pointer' }} 
                  onClick={() => handleDeleteRFID(rfid)}
                >
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            ))
          ) : (
            <p>No available RFIDs.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default FacultyRecord;
