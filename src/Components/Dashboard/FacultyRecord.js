import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './config';
import './FacultyRecord.css';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import PasswordInput from '../LoginForm/PasswordInput';

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
  const [changePassFormVisible, setChangePassFormVisible] = useState(false);
  const [facultyData, setFacultyData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [availableRfids, setAvailableRfids] = useState([]);
  const [rfidBindUser, setRfidBindUser] = useState({});
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
    console.log("Bading");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_faculty_and_rfid_and_computer`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
         },
        body: JSON.stringify({ username }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchFaculty();
      }

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

    const confirm = window.confirm('Are you sure you want to add this faculty?');
    if (!confirm) return;

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

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleAddFaculty(e);
      }

      if (response.ok) {
        fetchFaculty();
        handleCancelBtn();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to create faculty. Please try again.');
      }
    } catch (error) {
      
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
  
    const confirm = window.confirm(`Are you sure you want to edit the faculty details of ${selectedFaculty.first_name} ${selectedFaculty.last_name}?`);
    if (!confirm) return;

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

      if (response.status === 401) {
        await handleTokenRefresh();
        handleEditFaculty(e);
      } 
  
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
      
      setErrorMessage('An error occurred while updating faculty. Please check your connection.');
      
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
    
    const confirm = window.confirm(`Are you sure you want to change the password of ${faculty.first_name} ${faculty.last_name}?`);
    if (!confirm) return;

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
      
      if (response.status === 401) {
        await handleTokenRefresh();
        return handleChangePassword(faculty, newPassword);
      }
      
      if (response.ok) {
        alert('Password changed successfully!');
        setEditFormVisible(false);
        fetchFaculty();
      } else {
        const errorData = await response.json();
        alert(`Failed to change password: ${errorData.status_message || 'Error changing password'}`);
      }
    } catch (error) {
    
    }
  }


  const handleDeleteFaculty = async (facultyUsername) => { 
    const accessToken = localStorage.getItem('accessToken');
    const confirmDelete = window.confirm(`Are you sure you want to delete the faculty with username ${facultyUsername}?`);
    if (!confirmDelete) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/delete_faculty`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ username: facultyUsername }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleDeleteFaculty(facultyUsername);
      }

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        fetchFaculty();
      } else {
        setErrorMessage('Failed to delete faculty. Please try again later.');
      }
    } catch (error) {
      
      setErrorMessage('An error occurred while deleting faculty. Please check your connection.');
    }
  };




  const handleDeleteRFID = async (rfid) => {
    const accessToken = localStorage.getItem('accessToken');
    const confirmDelete = window.confirm(`Are you sure you want to delete RFID with value ${rfid}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/delete_rfid`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ rfid }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleDeleteRFID(rfid);
      }

      if (response.ok) {
        fetchFaculty();
        alert(`RFID with value ${rfid} has been deleted successfully.`);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete RFID: ${errorData.status_message || 'Error deleting RFID'}`);
      }
    } catch (error) {
      setErrorMessage('An error occurred while deleting RFID. Please check your connection.');
    }
  };

  const handleBindRFID = async (username, rfid) => {
    if (!username) {
      alert('Please choose a faculty to assign the RFID.');
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    const confirmBind = window.confirm(`Are you sure you want to bind RFID with value ${rfid} to ${username}?`);
    if (!confirmBind) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bind_rfid`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          username, 
          rfid 
        }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleBindRFID(username, rfid);
      }
      
      if (response.ok) {
        fetchFaculty();
        alert(`RFID with value ${rfid} has been bound to ${username} successfully.`);
      } else {
        const errorData = await response.json();
        alert(`Failed to bind RFID: ${errorData.status_message || 'Error binding RFID'}`);
      }
    } catch (error) {
      
      setErrorMessage('An error occurred while binding RFID. Please check your connection.');
    }
  };

  const handleUnbindRFID = async (facultyUsername, rfid) => {
    const accessToken = localStorage.getItem('accessToken');
    const confirmUnbind = window.confirm(`Are you sure you want to unbind RFID with value ${rfid} from ${facultyUsername}?`);
    if (!confirmUnbind) return;

    try {
      const response = await fetch(`${API_BASE_URL}/bind_rfid`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          username: '',
          rfid: rfid,
        }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleUnbindRFID(facultyUsername, rfid);
      }

      if (response.ok) {
        fetchFaculty();
        alert(`RFID with value ${rfid} has been unbound from ${facultyUsername} successfully.`);
      } else {
        const errorData = await response.json();
        alert(`Failed to unbind RFID: ${errorData.status_message || 'Error unbinding RFID'}`);
      }
    } catch (error) {
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
    setChangePassFormVisible(false);
  };

  const handleCloseChangePassForm = () => {
    setChangePassFormVisible(false);
    setPassword('');
    setConfirmPassword('');
  };

  const handleToggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleFacultyFileUpload = async () => {
    const accessToken = localStorage.getItem('accessToken');

    // Check if a file is selected
    if (!fileInput.current || !fileInput.current.files[0]) {
        alert('Please select an Excel file to upload');
        return;
    }

    const file = fileInput.current.files[0];
    const fileType = file.name.split('.').pop().toLowerCase();

    // Validate file type
    if (fileType !== 'xlsx' && fileType !== 'xls') {
        alert('Please upload a valid Excel file (.xlsx or .xls)');
        return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
        const data = e.target.result;

        // Parse the Excel file using xlsx
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        // Prepare the request payload
        const payload = { faculty_list: jsonData };

        // Send the request to the server
        
        await fetchUploadFaculty(); 

    };

    // Read the file as an ArrayBuffer
    reader.readAsArrayBuffer(file);
};

  const fetchUploadFaculty = async (payload) => {
    const accessToken = localStorage.getItem('accessToken');

    try {
        const response = await fetch(`${API_BASE_URL}/upload_faculty`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        if(response.status === 401) {
            await handleTokenRefresh();
            return fetchUploadFaculty(payload);
          }

        const data = await response.json();

        if (data.status_message && !data.status_message.failed_entries.length) {
            alert('File uploaded successfully!');
        } else {
            console.error('Errors:', data.status_message.failed_entries);
            alert('Some errors occurred while uploading. Check console for details.');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert(`An error occurred: ${error.message}`);
    }
  }

  return (
    <>
      <div className='faculty-record'>  
        <div className='add-faculty-form cont'>
          {!addFormVisible ? (
            <>
              <div className='adding-section'>
                <div className='adding-btn-section'>
                  <button className="add-section-btn" onClick={() => {
                    setAddFormVisible(true);
                    setEditFormVisible(false);
                  }}>
                    Add Faculty
                  </button>
                </div>
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
            </>
          ) : (
            <>
              <h3 classame="cont-title">Faculty Entry Form</h3>
              <form onSubmit={handleAddFaculty}>
                <div className='faculty-form-inner'>
                  <div className='user-form'>
                    <label htmlFor="firstname">First Name: <span>*</span></label>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={first_name}
                      onChange={(e) => setFirstname(e.target.value)}
                      required
                    />
                  </div>
                  <div className='user-form'>
                    <label htmlFor="mid-initial">Middle Initial: <span>*</span></label>
                    <input
                      type="text"
                      placeholder="Middle Initial"
                      value={middle_initial}
                      onChange={(e) => setMiddleinitial(e.target.value)}
                    />
                  </div>
                  <div className='user-form'>
                    <label htmlFor="lastname">Last Name: <span>*</span></label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={last_name}
                      onChange={(e) => setLastname(e.target.value)}
                      required
                    />
                  </div>
                  <div className='user-form'>
                    <label htmlFor="username">Username: <span>*</span></label>
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className='user-form'>
                    <label htmlFor="type">Role: <span>*</span></label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      required
                    >
                      <option value="">Choose user type</option>
                      <option value="admin">Admin</option>
                      <option value="faculty">Faculty</option>
                    </select>
                  </div>
                  <div className='user-form'>
                    <label htmlFor="password">Password: <span>*</span></label>
                    <PasswordInput
                      className='password-input'  
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className='user-form'>
                    <label htmlFor="conf-password">Confirm Password: <span>*</span></label>
                    <PasswordInput
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className='reg-div'>
                    <button type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Faculty'}
                    </button>
                    <button type="button" onClick={handleCancelBtn}>Cancel</button>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                  </div>
                </div>
              </form>
            </>
          )}
        </div>

        {editFormVisible && (
          <div className="edit-faculty-form cont">
            <div className="edit-faculty-form-inner">
              <form onSubmit={handleEditFaculty}>
                <div className='name-faculty-edit'>
                  <div className="user-form">
                    <label htmlFor="firstname">First Name: </label>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={newFName}
                      onChange={(e) => setNewFName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="user-form">
                    <label htmlFor="mmiddlename">Middle Name: </label>
                    <input
                      type="text"
                      placeholder="Middle Initial"
                      value={newMInit}
                      onChange={(e) => setNewMInit(e.target.value)}
                    />
                  </div>
                  <div className="user-form">
                    <label htmlFor="lastname">Last Name: <span>*</span></label>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={newLName}
                      onChange={(e) => setNewLName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="user-form">
                    <label htmlFor="username">Useraname: <span>*</span></label>
                    <input
                      type="text"
                      placeholder="Username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="user-form">
                    <label htmlFor="type">Role: <span>*</span></label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      required
                      >
                      <option value="">Choose user role</option>
                      <option value="admin">Admin</option>
                      <option value="faculty">Faculty</option>
                    </select>
                  </div>
                  <div className="reg-div">
                    <button type="submit" disabled={loading}>
                      {loading ? 'Updating...' : 'Update'}
                    </button>
                    <button type="button" onClick={handleCancelBtn}>
                      Cancel
                    </button>
                  </div>
                </div>
                {errorMessage && <p className="error-message">{errorMessage}</p>}

                {changePassFormVisible ? (<div className="change-pass-div">
                  <div className="user-form">
                    <label htmlFor="password">New Password: </label>
                    <PasswordInput
                      placeholder="**********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="user-form">
                    <label htmlFor="password">Confirm Password: </label>
                    <PasswordInput
                      placeholder="**********"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    </div>
                  <div className='reg-div'>
                    <button type="button" onClick={() => handleChangePassword(selectedFaculty, password)}>
                      Change Password
                    </button>
                    <button type="button" onClick={handleCloseChangePassForm}>
                      Cancel
                    </button>
                  </div>
                </div>
                ) : (
                  <div className='reg-div'>
                    <button type="button" onClick={() => setChangePassFormVisible(true)}>
                      Change Password
                    </button>
                  </div>
                )}

              </form>
            </div>
          </div>
        )}

        <div className="faculty-list-label cont">
          <h3>Faculty List</h3>
          <div className='faculty-list'>
            {Array.isArray(facultyData) && facultyData.length > 0 ? (
              facultyData.map((faculty, index) => (
                <div key={index} className="faculty-item">
                  <div className="faculty-header" onClick={() => handleToggleExpand(index)}>
                    <span>{expandedIndex === index ? '-' : '+'}</span>
                    <strong>{`${faculty.username}`}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                      <button onClick={(event) => {
                        event.stopPropagation(); // Prevent toggle when deleting
                        handleDeleteFaculty(faculty.username);
                      }}>
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                      <button onClick={(event) => {
                        event.stopPropagation(); // Prevent toggle when editing
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
                              <div className='rfid-unbind-label'>
                                {rfid}
                              </div>
                              <div className='rfid-unbind-btn'>
                                <button 
                                  className='unbind-btn'
                                  style={{ marginLeft: '8px', cursor: 'pointer' }} 
                                  onClick={() => handleUnbindRFID(faculty.username, rfid)} // Pass specific RFID
                                >
                                  -
                                </button>
                              </div>
                            </li>
                          ))
                        ) : (
                          <li className='no-fetch-msg'>No RFID allocated.</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className='no-fetch-msg'>No faculty records found.</p>
            )}
          </div>
        </div>


        <div className="rfid-list cont" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3>Available RFIDs</h3>
          {availableRfids.length > 0 ? (
            availableRfids.map((rfid, index) => (
              <div key={index} className="rfid-item" style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginLeft: '8px' }}>{rfid}</span>
                <select 
                  value={rfidBindUser[rfid] || 'none'} 
                  onChange={(e) => {
                    setRfidBindUser({ ...rfidBindUser, [rfid]: e.target.value });
                    console.log("USERNAME", rfidBindUser[rfid]);
                  }
                }
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
                  onClick={() => {
                    handleBindRFID(rfidBindUser[rfid], rfid)
                    console.log(rfidBindUser[rfid] + rfid)
                  }
                  } // Pass the selected username and RFID
                >
                  Assign
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
            <p className='no-fetch-msg'>No available RFIDs.</p>
          )}
        </div>
      </div>
    </>
  );
}

export default FacultyRecord;
