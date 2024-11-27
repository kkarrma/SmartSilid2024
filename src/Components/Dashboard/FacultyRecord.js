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
    setUsername(`${first_name}.${last_name}.${middle_initial.toUpperCase()  }`.slice(0, 20));
}, [first_name, last_name, middle_initial]);

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
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return fetchFaculty();
        }
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
      showAlertModal('Password does not matched. Try again.', () => setIsModalOpen(false));
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
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleAddFaculty();
        }
      }

      const data = await response.json();

      if (data.error_message) {
        showAlertModal(data.error_message, () => setIsModalOpen(false));
        return;
      }

      if (response.ok) {
        fetchFaculty();
        handleCancelBtn();
        showAlertModal('Faculty created successfully', () => setIsModalOpen(false));
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Failed to create faculty. Please try again.');
        showAlertModal(errorData.message || 'Failed to create faculty. Please try again.', 
          () => setIsModalOpen(false)
        );
      }
    } catch (error) {
      showAlertModal('An error occurred while creating faculty. Please check your connection.', () => setIsModalOpen(false));
    } finally {
      setLoading(false);
    }
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
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleEditFaculty(e);
        }
      } 

      const data = await response.json();
      console.log(1); 

      if (data.error_message) {
        return showAlertModal(data.error_message, ()=> setIsModalOpen(false)); 
      } 


      console.log(2); 
      if (data.errors.length > 0) {
        var error_message = ""; 

        for (var error in data.errors){
            error_message += error + "\n";
        }

        return showAlertModal(error_message, ()=> setIsModalOpen(false));
      }
      console.log(3); 
      console.log(data.status_message); 
  
      showAlertModal(data.status_message, () => setIsModalOpen(false));
      fetchFaculty(); // Refresh faculty data
      setEditFormVisible(false);
      
    } catch (error) {
      showAlertModal('An error occurred while updating faculty. Please check your connection.', () => setIsModalOpen(false));
      
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

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return showAlertModal('Password must include:\n• Uppercase letters\n• Lowercase letters\n• At least 8 characters\n• A number',
            () => setIsModalOpen(false)
        ); 
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
      
      if (response.status === 401) {
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleChangePassword(faculty, newPassword);
        }
      }
      
      if (response.ok) {
        showAlertModal('Password changed successfully!', 
          () => {
            setPassword('');
            setConfirmPassword('');
            setEditFormVisible(false);
            fetchFaculty();
            setIsModalOpen(false)
          }
        );
      } else {
        const errorData = await response.json();
        showAlertModal(`Failed to change password: ${errorData.status_message || 'Error changing password'}`, () => setIsModalOpen(false));
      }
    } catch (error) {
      showAlertModal('An error occurred while changing password. Please check your connection.', () => setIsModalOpen(false));
    }
  };

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
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleDeleteFaculty(facultyUsername);
        }
      }

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        showAlertModal('Faculty deleted successfully!', () => setIsModalOpen(false));
        fetchFaculty();
      } else {
        showAlertModal('Failed to delete faculty. Please try again later.',
          () => setIsModalOpen(false)
        );
      }
    } catch (error) {
      showAlertModal('An error occurred while deleting faculty. Please check your connection.', () => setIsModalOpen(false));
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

      if (response.status === 401) {
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleDeleteRFID(rfid);
        }
      }

      if (response.ok) {
        fetchFaculty();
        showAlertModal(`RFID with value ${rfid} has been deleted successfully.`, () => setIsModalOpen(false));
      } else {
        const errorData = await response.json();
        showAlertModal(`Failed to delete RFID: ${errorData.status_message || 'Error deleting RFID'}`, () => setIsModalOpen(false));
      }
    } catch (error) {
      showAlertModal('An error occurred while deleting RFID. Please check your connection.', () => setIsModalOpen(false));
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
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleBindRFID(username, rfid);
        }
      }
      
      if (response.ok) {
        showAlertModal(`RFID with value ${rfid} has been bound to ${username} successfully.`, 
          () => {
            fetchFaculty();
            setIsModalOpen(false)
          }
        );
      } else {
        const errorData = await response.json();
        console.errorX(`Failed to bind RFID: ${errorData.status_message || 'Error binding RFID'}`);
        showAlertModal(`Failed to bind RFID: ${errorData.status_message || 'Error binding RFID'}`, 
          () => setIsModalOpen(false)
        );
      }
    } catch (error) {
      showAlertModal('An error occurred while binding RFID. Please check your connection.', () => setIsModalOpen(false));
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
        body: JSON.stringify({ 
          username: '',
          rfid: rfid,
        }),
      });

      if (response.status === 401) {
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleUnbindRFID(facultyUsername, rfid);
        }
      }

      if (response.ok) {
        showAlertModal(`RFID with value ${rfid} has been unbound from ${facultyUsername} successfully.`,
          () => {
            fetchFaculty();
            setIsModalOpen(false)
          }
        );
        setRfidBindUser('');
        setSelectedFaculty({...selectedFaculty, rfid: null});
      } else {
        const errorData = await response.json();
        showAlertModal(`Failed to unbind RFID: ${errorData.status_message || 'Error unbinding RFID'}`,
          () => setIsModalOpen(false)
        );
      }
    } catch (error) {
      showAlertModal('An error occurred while unbinding RFID. Please check your connection.', () => setIsModalOpen(false));
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
          const failedRefresh = await handleTokenRefresh();
  
          if ( failedRefresh === 0){
            Navigate("/");
            window.location.reload();
          }
          else {
            return handleFacultyFileUpload();
          }
        }

        const requiredFields = ['username',	'password',	'first_name',	'last_name',	'middle_initial',	'type']; // Add fields as necessary
        const invalidInput = [];
        const validInput = jsonData.filter((row, index) => {
          const missingFields = requiredFields.filter((field) => !row[field]);
          if (missingFields.length > 0) {
            invalidInput.push({
              row: index + 1,
              missingFields,
            });
            return false; // Exclude invalid rows
          }
          return true;
        });

        if (invalidInput.length > 0) {
          const errorDetails = invalidInput
          .map(
            (entry) =>
              `Row ${entry.row}: Missing fields - ${entry.missingFields.join(', ')}`
          ).join('\n');
          showAlertModal(`The following rows have missing fields and will not be uploaded:\n${errorDetails}`, 
              () => setIsModalOpen(false)
          );
        } 
    
        // Check if there are valid entries to upload
        if (validInput.length === 0) {
            showAlertModal('No valid data to upload.', () => setIsModalOpen(false));
            return;
        }

        const data = await response.json();
        console.log(data);

        const success_count = data.status_message.success_count; 

        const message = " "; 

        const success_message = `<p>${success_count} users have been successfully added to the database </p> <br>`;
        var error_message = " "; 

        const failed_entries = data.status_message.failed_entries;
        
        for (var i = 0; i < failed_entries.length; i++) {
          console.log(i); 
          const entry = failed_entries[i];

          const username = entry.username;
          const error = entry.error; 

          console.log(i, username, error); 

          const single_message = `<p> ${username} : ${error}<br>`
          error_message += single_message;
        }

        showAlertModal(`${success_message} <br> ${error_message}`, () => setIsModalOpen(false));

        return fetchFaculty();
      } catch (error) {
        console.error('Error uploading file:', error);
        showAlertModal(`${error.message}`, () => setIsModalOpen(false));
      }
    };

    reader.readAsArrayBuffer(file);
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
                    () => {
                      setIsModalOpen(false);
                      handleFacultyFileUpload();
                    }
                  )
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
                  () => {
                    setIsModalOpen(false);
                    handleAddFaculty();
                  }
                )
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
                      value={middle_initial.toUpperCase()}
                      onChange={(e) => setMiddleinitial(e.target.value.slice(0, 1))}
                      maxLength={1}
                      required
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
                showAlertModal('Are you sure you want to update this faculty?', 
                  () => {
                    setIsModalOpen(false);
                    handleEditFaculty();
                  }
                );
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
                    <label htmlFor="username">Username: <span>*</span></label>
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
                              () => {
                                setIsModalOpen(false);
                                handleChangePassword(selectedFaculty, password);
                              }
                            );
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

                {selectedFaculty?.rfid !== null ? (
                    <button type="button" onClick={() => {
                      showAlertModal('Are you sure you want to unbind this RFID?', 
                        () => {
                          setIsModalOpen(false);
                          handleUnbindRFID(selectedFaculty.username, selectedFaculty.rfid)
                        }
                      );
                    }}>
                        Unbind RFID
                    </button>
                ) : (
                  <></>
                )}
                
              </form>
            </div>
          </div>
        )}

        <div className="faculty-list-label cont">
          <h3>Faculty List</h3>
          <div className="faculty-table">
            {Array.isArray(facultyData) && facultyData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Faculty Name</th>
                    <th>RFID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyData.map((faculty, index) => (
                    <tr key={index}>
                      <td>
                        <strong>{`${faculty.first_name} ${faculty.middle_initial}. ${faculty.last_name}`}</strong>
                      </td>
                      <td>
                        {faculty.rfid ? (
                          <div>
                            <span>{faculty.rfid}</span>
                          </div>
                        ) : (
                          <span>N/A</span>
                        )}
                      </td>
                      <td>
                        {localStorage.getItem('id') !== faculty.id.toString() ? (
                          <div>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEditClick(faculty);
                              }}
                              >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              className="del-btn"
                              onClick={(event) => {
                                event.stopPropagation();
                                showAlertModal(
                                  `Are you sure you want to delete ${faculty.username}?`,
                                  () => {
                                    setIsModalOpen(false);
                                    handleDeleteFaculty(faculty.username)
                                  }
                                );
                              }}
                              >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        ) :  (
                          <>
                            {faculty.rfid !== null ? (
                              <button type="button" onClick={() => {
                                  {console.log(faculty);}
                                  showAlertModal('Are you sure you want to unbind this RFID?', 
                                    () => {
                                      setIsModalOpen(false);
                                      handleUnbindRFID(faculty.username, faculty.rfid)
                                    }
                                  );
                                }}>
                                  Unbind RFID
                              </button>
                            ) : (
                              <span>Current User</span>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-fetch-msg">No faculty records found.</p>
            )}
          </div>
        </div>

        <div className="rfid-list cont">
          <h3>Available RFIDs</h3>
          <div className="available-list">
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
                  <div>
                    <button 
                      style={{ marginLeft: '8px', cursor: 'pointer' }} 
                      onClick={(e) => {
                        e.preventDefault();
                        if (rfidBindUser[rfid] === '' || rfidBindUser[rfid] === undefined) {
                          showAlertModal(`Please choose a faculty to assign the RFID with value ${rfid}.`, () => setIsModalOpen(false));
                        } else {
                          showAlertModal(`Are you sure you want to bind RFID with value ${rfid} to ${rfidBindUser[rfid]}?`,
                          () => {
                            setIsModalOpen(false);  
                            handleBindRFID(rfidBindUser[rfid], rfid)
                          })
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
                          () => {
                            setIsModalOpen(false);
                            handleDeleteRFID(rfid)
                          }
                        )
                      }
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className='no-fetch-msg'>No available RFIDs.</p>
            )}
          </div>
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
