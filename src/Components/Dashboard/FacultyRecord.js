import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './BASE_URL';
import './FacultyRecord.css';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import PasswordInput from '../LoginForm/PasswordInput';
import AlertModal from './AlertModal';

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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmCallback, setModalConfirmCallback] = useState(null);
  const showAlertModal = (message, onConfirm) => {
    setModalMessage(message);
    setModalConfirmCallback(() => onConfirm);
    setIsModalOpen(true); 
  };

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

  const handleAddFaculty = async () => {
    const accessToken = localStorage.getItem('accessToken');

    if (password !== confirmPassword) {
      showAlertModal('Password does not matched. Try again.', setIsModalOpen(false));
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

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleAddFaculty();
      }

      if (response.ok) {
        fetchFaculty();
        handleCancelBtn();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to create faculty. Please try again.');
      }
    } catch (error) {
      showAlertModal('An error occurred while creating faculty. Please check your connection.', setIsModalOpen(false));
    } finally {
      setLoading(false);
    }

    setIsModalOpen(false);
  };

  const handleEditFaculty = async (e) => {
    const accessToken = localStorage.getItem('accessToken');


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
        showAlertModal(errorData.message || 'Failed to update faculty. Please try again.', setIsModalOpen(false));
      }
    } catch (error) {
      
      showAlertModal('An error occurred while updating faculty. Please check your connection.', setIsModalOpen(false));
      
    } finally {
      setLoading(false);
    }

    setIsModalOpen(false);
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
        showAlertModal('Password changed successfully!', () => setIsModalOpen(false));
        setEditFormVisible(false);
        fetchFaculty();
        setPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.json();
        showAlertModal(`Failed to change password: ${errorData.status_message || 'Error changing password'}`, () => setIsModalOpen(false));
      }
    } catch (error) {
      showAlertModal('An error occurred while changing password. Please check your connection.', () => setIsModalOpen(false));
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
      
      showAlertModal('An error occurred while deleting faculty. Please check your connection.', setIsModalOpen(false));
    }
    
    setIsModalOpen(false);
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
      showAlertModal('Please choose a faculty to assign the RFID.', () => setIsModalOpen(false));
      return;
    }

    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/bind_rfid`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          username, 
          rfid,
          type: "faculty" 
        }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleBindRFID(username, rfid);
      }
      
      if (response.ok) {
        fetchFaculty();
        showAlertModal(`RFID with value ${rfid} has been bound to ${username} successfully.`, () => setIsModalOpen(false));
      } else {
        const errorData = await response.json();
        console.error(`Failed to bind RFID: ${errorData.status_message || 'Error binding RFID'}`);
      }
    } catch (error) {
      showAlertModal('An error occurred while binding RFID. Please check your connection.', () => setIsModalOpen(false));
    }

    setIsModalOpen(false);
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

    const file = fileInput.current.files[0];
    const fileType = file.name.split('.').pop().toLowerCase();

    // Validate file type
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      showAlertModal('Please upload a valid Excel file (.xlsx or .xls)', () => setIsModalOpen(false));
      return;
    }

    // Read the Excel file and convert it to JSON
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target.result;

      // Parse the Excel file using xlsx
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Assuming first sheet is the target
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log('Excel File Data:', jsonData);

      const formData = new FormData();
      formData.append('faculty_list', JSON.stringify(jsonData)); // Send the data as JSON

      try {
        const response = await fetch(`${API_BASE_URL}/upload_faculty`, {
          method: 'POST',
          headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',  // Ensure content type is application/json
          },
          body: JSON.stringify({ faculty_list: jsonData }), // Send data as JSON in the body
        });

        if (response.status === 401) {
          await handleTokenRefresh();
          return handleFacultyFileUpload();
        }

        const requiredFields = ['username',	'password',	'first_name',	'last_name',	'middle_initial',	'type']; // Add fields as necessary
        const invalidEntries = [];
        const validEntries = jsonData.filter((row, index) => {
          const missingFields = requiredFields.filter((field) => !row[field]);
          if (missingFields.length > 0) {
            invalidEntries.push({
              row: index + 1,
              missingFields,
            });
            return false; // Exclude invalid rows
          }
          return true;
        });

        if (invalidEntries.length > 0) {
          const errorDetails = invalidEntries
          .map(
            (entry) =>
              `Row ${entry.row}: Missing fields - ${entry.missingFields.join(', ')}`
          ).join('\n');
          showAlertModal(`The following rows have missing fields and will not be uploaded:\n${errorDetails}`, 
              () => setIsModalOpen(false)
          );
        } 
    
        // Check if there are valid entries to upload
        if (validEntries.length === 0) {
            showAlertModal('No valid data to upload.', () => setIsModalOpen(false));
            return;
        }

        const data = await response.json();
        if (response.ok) {
          showAlertModal('File uploaded successfully!', () => setIsModalOpen(false));
          fetchFaculty();
        } else {
          console.error('Errors:', data.errors);
          showAlertModal('Faculties in the file already exists.', () => setIsModalOpen(false));
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        showAlertModal(`${error.message}`, () => setIsModalOpen(false));
      }
    };

    reader.readAsArrayBuffer(file);
    setIsModalOpen(false);
  };

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
                <form onSubmit={(e) => { 
                  e.preventDefault();
                  showAlertModal(`Are you sure you want to upload this file?`, 
                  handleFacultyFileUpload)
                }}>
                  <div className='adding-file-section'>
                    <input 
                      className='file-batch-input'
                      type='file'
                      ref={fileInput}
                      accept=".xlsx, .xls"
                      required
                    />
                    <button type="submit" className="add-section-btn" disabled={loading}>
                      {loading ? 'Uploading..' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <>
              <h3 classame="cont-title">Faculty Entry Form</h3>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                showAlertModal('Are you sure you want to add this faculty?', 
                handleAddFaculty)
              }}>
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
                    <label htmlFor="type">User Type: <span>*</span></label>
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
            <h3 classame="cont-title">Faculty Edit Form</h3>
            <div className="edit-faculty-form-inner">
              <form onSubmit={ (e) => {
                e.preventDefault();
                showAlertModal('Are you sure you want to update this faculty?', handleEditFaculty);
              }}>
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

                {changePassFormVisible ? (
                  <div className="change-pass-div">
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
                      <button type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (password !== confirmPassword) {
                            showAlertModal('Passwords do not match.', () => setIsModalOpen(false));
                            return;
                          } else if (password === '') {
                            showAlertModal('Password cannot be empty.', () => setIsModalOpen(false));
                          } else {
                            showAlertModal('Are you sure you want to change this faculty password?', 
                            () => handleChangePassword(selectedFaculty, password));
                          }
                        }}
                      >
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
              <div className='faculty-rows'>
                {facultyData.map((faculty, index) => (
                  <div key={index} className="faculty-item">
                    <div className="faculty-header" onClick={() => handleToggleExpand(index)}>
                      <span>{expandedIndex === index ? '-' : '+'} &nbsp;</span>
                      <strong>{`${faculty.username}`}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto'}}>
                        {localStorage.getItem('id') !== faculty.id.toString() ? (
                          <div>
                            <button onClick={(event) => {
                              event.stopPropagation(); // Prevent toggle when editing
                              handleEditClick(faculty);
                            }}>
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button 
                              className='del-btn'
                              onClick={(event) => {
                                event.stopPropagation(); 
                                showAlertModal(`Are you sure you want to delete ${faculty.username}?`, 
                                () => handleDeleteFaculty(faculty.username));
                              }}
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        ) : (
                          <div style={{ padding: '17px'}}></div>
                        )}
                      </div>
                    </div>
                    {expandedIndex === index && (
                      <div className="faculty-details">
                        <ul>
                          {faculty.rfid ? ( // Check if the RFID is present
                            <li>
                              <div className='rfid-unbind-label'>
                                {faculty.rfid}
                              </div>
                              <div className='rfid-unbind-btn'>
                                <button 
                                  className='del-btn'
                                  style={{ marginLeft: '8px', cursor: 'pointer' }} 
                                  onClick={() => handleUnbindRFID(faculty.username, faculty.rfid)} // Pass specific RFID
                                >
                                  {/* remove */}
                                  <i className="fa-solid fa-minus"></i>
                                </button>
                              </div>
                            </li>
                          ) : (
                            <li className='no-fetch-msg'>No RFID allocated</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className='no-fetch-msg'>No faculty records found.</p>
            )}
          </div>
        </div>


        <div className="rfid-list cont">
          <h3>Available RFIDs</h3>
          {availableRfids.length > 0 ? (
            availableRfids.map((rfid, index) => (
              <div key={index} className="rfid-item">
                <label className='rfid-name'>{rfid}</label>
                <select 
                  value={rfidBindUser[rfid] || 'none'} 
                  onChange={(e) => {
                    setRfidBindUser({ ...rfidBindUser, [rfid]: e.target.value });
                    console.log("USERNAME", rfidBindUser[rfid]);
                  }}
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
                  onClick={(e) => {
                    e.preventDefault();
                    if (rfidBindUser[rfid] === '' || rfidBindUser[rfid] === undefined) {
                      showAlertModal(`Please choose a faculty to assign the RFID with value ${rfid}.`, () => setIsModalOpen(false));
                    } else {
                      showAlertModal(`Are you sure you want to bind RFID with value ${rfid} to ${rfidBindUser[rfid]}?`,
                      () => handleBindRFID(rfidBindUser[rfid], rfid))
                    }
                  }}
                >
                  Assign
                </button>
                <button 
                  className='del-btn'  
                  style={{ marginLeft: '8px', cursor: 'pointer' }} 
                  onClick={
                    () => showAlertModal(`Are you sure you want to delete ${rfid}?`,
                    () => handleDeleteRFID(rfid))
                  }
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

      <AlertModal
        message={modalMessage}
        onConfirm={modalConfirmCallback} 
        onCancel={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
      />
    </>
  );
}

export default FacultyRecord;
