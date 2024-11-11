    import React, { useState, useEffect, useRef } from 'react';
    import { API_BASE_URL } from './config';
    import './StudentRecord.css';
    import { useNavigate } from 'react-router-dom';
    import * as XLSX from 'xlsx';
    import PasswordInput from '../LoginForm/PasswordInput';

    function StudentRecord() {
        const type = "Student";
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [first_name, setFirstname] = useState('');
        const [middle_initial, setMiddlename] = useState('');
        const [last_name, setLastname] = useState('');
        const [username, setUsername] = useState('');
        
        // New Inputted Credentials for UpdateStudent
        const [id, setId] = useState('');
        const [newFName, setNewFName] = useState('');
        const [newLName, setNewLName] = useState('');
        const [newMInit, setNewMInit] = useState('');
        const [newUsername, setNewUsername] = useState('');
        const [newType, setNewType] = useState('');

        const [section, setSection] = useState('');
        const [loading, setLoading] = useState(false);
        const [errorMessage, setErrorMessage] = useState('');
        const [sections, setSections] = useState([]);
        const [newSectionName, setNewSectionName] = useState('');
        const [isAddingSection, setIsAddingSection] = useState(false);
        const [selectedSection, setSelectedSection] = useState(null);
        const [selectedStudent, setSelectedStudent] = useState(null);
        const [students, setStudents] = useState([]);
        const [formVisible, setFormVisible] = useState(false);
        const [editFormVisible, setEditFormVisible] = useState(false);
        const fileInput = useRef(null);
        const Navigate = useNavigate();

        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

        const formatMiddleInitials = (middleInitials) =>
            middleInitials
                .split('')
                .map(initial => initial.toUpperCase())
                .join('');

        const formatStudentName = (student) => ({
            ...student,
            first_name: capitalize(student.first_name),
            last_name: capitalize(student.last_name),
            middle_initial: formatMiddleInitials(student.middle_initial)
        });

        const sortStudents = (students) => students.sort((a, b) => {
            if (a.last_name < b.last_name) return -1;
            if (a.last_name > b.last_name) return 1;
            if (a.first_name < b.first_name) return -1;
            if (a.first_name > b.first_name) return 1;
            return 0;
        });

        
        useEffect(() => {
            if (!username) {
                setUsername(`${first_name}.${last_name}.${middle_initial}`);
            } else {
                setUsername(username);
            }
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

        const handleEditStudent = async (student) => {
            setId(student.id);
            setNewFName(student.first_name)
            setNewLName(student.last_name)
            setNewMInit(student.middle_initial)
            setNewUsername(student.username)
            setSelectedStudent(student);
            setPassword('')
            setConfirmPassword('')
            setFormVisible(false)
            setEditFormVisible(true)
        };

        const handleDeleteStudent = async (student) => { 
            const accessToken = localStorage.getItem('accessToken');
            const confirmDelete = window.confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`);
            if (!confirmDelete) return;
        
            console.log('Deleting student with username:', student.username);
            
            try {
                const response = await fetch(`${API_BASE_URL}/delete_student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 
                        Authorization: `Bearer ${accessToken}`, 
                    },
                    body: JSON.stringify({
                        username: student.username,
                    }),
                });

        
                if (response.ok) {
                    // Update the students state to remove the deleted student
                    setStudents((prevStudents) => prevStudents.filter((s) => username !== username));
                    alert(`${student.first_name} ${student.last_name} has been deleted successfully.`);
                } else {
                    const text = await response.text();
                    console.error('Failed to delete student:', text);
                    alert(`Failed to delete student: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                if (error.response.status === 401) {
                  await handleTokenRefresh();
                }
                console.error('Error deleting student:', error);
                alert(`An error occurred: ${error.message}`);
            }
        };
        
        const fetchSections = async () => {
            const accessToken = localStorage.getItem('accessToken');
            try {
                const response = await fetch(`${API_BASE_URL}/get_all_sections`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setSections(data.sections.map(sec => sec.name));
                } else {
                    console.error('Failed to fetch sections');
                }
            } catch (error) {
                if (error.response.status === 401) {
                  await handleTokenRefresh();
                }
                console.error('Error fetching sections:', error);
            }
        };

        const handleStudentList = async (sectionName) => {
            const accessToken = localStorage.getItem('accessToken');
            try {
                const response = await fetch(`${API_BASE_URL}/get_all_students`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log(data.students);
                    const filteredStudents = data.students.filter(student => student.section === sectionName);
                    const formattedStudents = filteredStudents.map(formatStudentName);
                    setStudents(sortStudents(formattedStudents));
                } else {
                    console.error('Failed to fetch students');
                }
            } catch (error) {
                if (error.response.status === 401) {
                  await handleTokenRefresh();
                }
                console.error('Error fetching students:', error);
            }
        };

        useEffect(() => {
            fetchSections();
        }, []);

        useEffect(() => {
            if (selectedSection) {
                handleStudentList(selectedSection);
            } else {
                setStudents([]); // Clear students list when no section is selected
            }
        }, [selectedSection]);

        const handleSubmit = async (e) => {
            const accessToken = localStorage.getItem('accessToken');
            e.preventDefault();

            if (!password || !confirmPassword || !first_name || !last_name) {
                alert('Please fill in all required fields');
                return;
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            setLoading(true);

            try {
                const response = await fetch(`${API_BASE_URL}/create_student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        type,
                        password,
                        first_name,
                        middle_initial,
                        last_name,
                        section: selectedSection
                    }),
                });

                if (!response.ok) {
                    const text = await response.text();
                    console.error('Response text:', text);
                    alert(`Signup failed: ${response.status} ${response.statusText}`);
                    return;
                }

                const data = await response.json();
                if (data.status_message) {
                    alert(data.status_message);
                } else {
                    alert('Signup successful');
                    const newStudent = formatStudentName({
                        first_name,
                        middle_initial,
                        last_name,
                        section: selectedSection,
                        username: data.username 
                    });
                    setStudents((prevStudents) => sortStudents([...prevStudents, newStudent]));
                }
                handleCancelClick();
            } catch (error) {
                console.error('Error:', error);
                alert(`An error occurred: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        const handleAddClick = () => {
            setFormVisible(true);
            setEditFormVisible(false)
        };

        const handleCancelClick = () => {
            setFormVisible(false);
            setEditFormVisible(false)
            setPassword('');
            setConfirmPassword('');
            setFirstname('');
            setMiddlename('');
            setLastname('');
            setSection('');
        };

        const handleAddSection = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (newSectionName.trim()) {
                try {
                    const response = await fetch(`${API_BASE_URL}/add_section`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ name: newSectionName.trim() }),
                    });

                    if (response.ok) {
                        await fetchSections(); // Fetch updated sections after adding a new section
                    } else {
                        console.error('Failed to add section');
                    }
                } catch (error) {
                    if (error.response.status === 401) {
                      await handleTokenRefresh();
                    }
                    console.error('Error adding section:', error);
                }
                setNewSectionName('');
                setIsAddingSection(false);
                setFirstname('')
                setMiddlename('')
                setLastname('')
                setPassword('')
                setConfirmPassword('')
            }
        };

        const handleCancelAddSection = () => {
            setIsAddingSection(false);
            setNewSectionName('');
        };

        const handleNewSectionChange = (e) => {
            setNewSectionName(e.target.value);
        };

        const handleSectionClick = (sectionToToggle) => {
            if (selectedSection === sectionToToggle) {
                setSelectedSection(null); // Deselect if already selected
            } else {
                setSelectedSection(sectionToToggle); // Select the new section
            }
        };

        const handleUpdateStudent = async () => {
            const accessToken = localStorage.getItem('accessToken');
    
            try {
                const response = await fetch(`${API_BASE_URL}/update_student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        id: id,  
                        first_name: newFName, 
                        middle_initial: newMInit,
                        last_name: newLName, 
                        username: newUsername
                    }),  
                });
    
                if (response.ok) {
                    const responseData = await response.json();
                    console.log("Student updated successfully", responseData);
                    // Optionally handle success, e.g., refresh student data or show success message
                } else {
                    const errorData = await response.json();
                    console.error("Failed to update student:", errorData);
                    // Handle the error based on the backend response
                }
            } catch (error) {
                console.error('Error updating student:', error);
                if (error.response?.status === 401) {
                    await handleTokenRefresh();
                } else {
                    setErrorMessage('An error occurred while updating student. Please check your connection.');
                }
            } finally {
                setLoading(false);
            }
        };

        const handleRemoveSection = async (sectionToRemove) => {
            const accessToken = localStorage.getItem('accessToken');
            try {
                if (!window.confirm(`Are you sure you want to remove the section "${sectionToRemove}"?`)) {
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/delete_section`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ name: sectionToRemove }),
                });

                if (response.ok) {
                    await fetchSections(); // Fetch updated sections after removing a section
                    if (selectedSection === sectionToRemove) {
                        setSelectedSection(null);
                    }
                } else {
                    const text = await response.text();
                    console.error('Failed to remove section:', text);
                    alert(`Failed to remove section: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                if (error.response.status === 401) {
                    await handleTokenRefresh();
                }
                console.error('Error removing section:', error);
                alert(`An error occurred: ${error.message}`);
            }
        };

        const handleMoveSection = async (student, newSection) => {
            const  accessToken = localStorage.getItem('accessToken');
            console.log('Attempting to move section for student:', student);
            console.log('New section:', newSection);
            
            const username = `${student.first_name}.${student.last_name}.${student.middle_initial}`; 
            console.log('Username being sent to server:', username);
        
            try {
                const response = await fetch(`${API_BASE_URL}/move_section`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        username: student.username,
                        new_section: newSection,
                    }),
                });
        
                console.log('Response status:', response.status);
                
                if (response.ok) {
                    setStudents((prevStudents) =>
                        prevStudents.map((s) =>
                            s.username === username ? { ...s, section: newSection } : s
                        )
                    );
                    alert(`Moved ${student.first_name} to section ${newSection} successfully!`);
                } else {
                    const text = await response.text();
                    console.error('Failed to move student:', text);
                    alert(`Failed to move student: ${response.status} ${response.statusText}`);
                }
                setEditFormVisible(false);
            } catch (error) {
                if (error.response.status === 401) {
                    await handleTokenRefresh();
                }
                console.error('Error moving student:', error);
                alert(`An error occurred: ${error.message}`);
            }
        };
        
        const handleChangePassword = async (student, newPassword) => {
            const accessToken = localStorage.getItem('accessToken');
            console.log('Attempting to change password for student:', student);
            console.log('New password:', newPassword);
            

            if (newPassword !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/change_password_student`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        AUthorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        username: student.username,
                        new_password: newPassword,
                    }),
                });
                
                const data = await response.json();
                console.log(data);
        
                if (response.ok) {
                    alert('Password changed successfully!');
                } else {
                    const text = await response.text();
                    console.error('Failed to change password:', text);
                    alert(`Failed to change password: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                if (error.response.status === 401) {
                    await handleTokenRefresh();
                }
                console.error('Error changing password:', error);
                alert(`An error occurred: ${error.message}`);
            }
            setEditFormVisible(false)
        };

        const handleStudentFileUpload = async () => {
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
        
            // Read the Excel file and convert it to JSON
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const data = e.target.result;
                
                // Parse the Excel file using xlsx
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0]; // Assuming first sheet is the target
                const sheet = workbook.Sheets[sheetName];
                
                // Convert sheet to JSON
                const jsonData = XLSX.utils.sheet_to_json(sheet);
        
                // Log the JSON data
                console.log('Excel File Data:', jsonData);
        
                // Proceed with file upload
                const formData = new FormData();
                formData.append('file', file);
        
                // Send the request to the server
                fetch(`${API_BASE_URL}/upload_students`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: formData,
                })
                .then(response => response.json())
                .then(data => {
                    if (!data.errors) {
                        alert('File uploaded successfully!');
                    } else {
                        console.error('Errors:', data.errors);
                        alert('Some errors occurred while uploading.');
                    }
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                    alert(`An error occurred: ${error.message}`);
                });
            };
        
            // Read the file as an ArrayBuffer
            reader.readAsArrayBuffer(file);
        };

        return (
            <>
                <div className='student-record'>
                    <div className="section-form cont">
                        {isAddingSection ? (
                            <div className="new-section-form">
                                <input
                                    className="sect-input"
                                    type="text"
                                    value={newSectionName}
                                    onChange={handleNewSectionChange}
                                    placeholder="Enter section name"
                                />
                                <button className="confirm-btn" onClick={handleAddSection}>
                                    Confirm
                                </button>
                                <button className="cancel-btn" onClick={handleCancelAddSection}>
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className='adding-section'>
                                <div className='adding-btn-section'>
                                    <button className="add-section-btn" onClick={() => setIsAddingSection(true)}>
                                        Add Section
                                    </button>
                                </div>
                                <div className='adding-file-section'>
                                    <input 
                                        className='file-batch-input'
                                        type='file'
                                        ref={fileInput}
                                        accept=".xlsx, .xls"
                                    />
                                    <button className="add-section-btn" onClick={handleStudentFileUpload}>
                                        Upload
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="sections-container cont">
                        {sections.length === 0 ? (
                            <p className='no-fetch-msg'>No sections available</p>
                        ) : (
                            sections.map((sec, index) => (
                                <div key={index} className="section-item">
                                    <button
                                        className={`section-btn ${selectedSection === sec ? 'selected' : ''}`}
                                        onClick={() => handleSectionClick(sec)}
                                    >
                                        {sec}
                                        {selectedSection === sec && (
                                            <button
                                                className="remove-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveSection(sec);
                                                }}
                                            >
                                                <b>–</b>
                                            </button>
                                        )}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedSection ? (
                        <>
                            <div className="student-form cont">
                                {formVisible ? (
                                    <div className='student-form-inner'>
                                        <form onSubmit={handleSubmit}>
                                            <div className="name-div">
                                                <div className='user-form'>
                                                    <label htmlFor="firstname">First Name: <span>*</span></label>
                                                    <input
                                                        type="text"
                                                        id="firstname"
                                                        value={first_name}
                                                        onChange={(e) => setFirstname(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="middlename">Middle Initial: <span>*</span></label>
                                                    <input
                                                        type="text"
                                                        id="middlename"
                                                        value={middle_initial}
                                                        onChange={(e) => setMiddlename(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="lastname">Last Name: <span>*</span></label>
                                                    <input
                                                        type="text"
                                                        id="lastname"
                                                        value={last_name}
                                                        onChange={(e) => setLastname(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="username">Username: <span>*</span></label>
                                                    <input
                                                        type="text"
                                                        id="username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="creds-div">
                                                <input type="hidden" id="type" />
                                                <div>
                                                    <label htmlFor="section">Section: <span>*</span></label>
                                                    <select
                                                        id="section"
                                                        value={section || selectedSection}
                                                        onChange={(e) => setSection(e.target.value)}
                                                        required
                                                    >
                                                        <option value=""></option>
                                                        {sections.map((sec) => (
                                                            <option key={sec} value={sec}>{sec}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="password-div">
                                                <label htmlFor="password">Password: <span>*</span></label>
                                                <PasswordInput
                                        
                                                    id="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                
                                                />
                                            </div>
                                            <div className="password-div">
                                                <label htmlFor="confirmPassword">Confirm Password: <span>*</span></label>
                                                <PasswordInput
                                                
                                                    id="confirmPassword"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                
                                                />
                                            </div>
                                            <div className="reg-div">
                                                <button type="submit" disabled={loading}>
                                                    {loading ? 'Registering...' : 'Add Student'}
                                                </button>
                                                <button className="cancel-btn" type="button" onClick={handleCancelClick}>
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <button className="adds-btn" type="button" onClick={handleAddClick}>
                                        {/* <i className="fa-solid fa-plus"></i>  */}
                                        Add Student
                                    </button>
                                )}
                            </div>

                            {editFormVisible && (
                                <div className="edit-form cont">
                                    <form>
                                        <div className="name-div">
                                            <div>
                                                <label htmlFor="firstname">First Name: <span>*</span></label>
                                                <input
                                                    type="text"
                                                    id="firstname"
                                                    value={newFName}
                                                    onChange={(e) => setNewFName(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="middlename">Middle Initial: <span>*</span></label>
                                                <input
                                                    type="text"
                                                    id="middlename"
                                                    value={newMInit}
                                                    onChange={(e) => setNewMInit(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="lastname">Last Name: <span>*</span></label>
                                                <input
                                                    type="text"
                                                    id="lastname"
                                                    value={newLName}
                                                    onChange={(e) => setNewLName(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="username">Username: <span>*</span></label>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    value={newUsername}
                                                    onChange={(e) => setNewUsername(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <button  type="button" onClick={handleUpdateStudent} disabled={loading}>
                                                    {loading ? 'Updating...' : 'Update'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="creds-div">
                                            <input type="hidden" id="type" />
                                            <div>
                                                <label htmlFor="section">Section: <span>*</span></label>
                                                <select
                                                id="section"
                                                value={section || selectedSection}
                                                onChange={(e) => setSection(e.target.value)} // Update section state
                                            >
                                                <option value=""></option>
                                                {sections.map((sec) => (
                                                    <option key={sec} value={sec}>{sec}</option>
                                                ))}
                                            </select>
                                            </div>
                                        </div>
                                        <div className="password-div">
                                            <label htmlFor="password">Password: <span>*</span></label>
                                            <PasswordInput
                                    
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="password-div">
                                            <label htmlFor="confirmPassword">Confirm Password: <span>*</span></label>
                                            <PasswordInput
                                        
                                                id="confirmPassword"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>
                                        <div className="reg-div">
                                            <button type="button" onClick={() => handleMoveSection(selectedStudent, section)}>
                                                Move Section
                                            </button>
                                            <button type="button" onClick={() => handleChangePassword(selectedStudent, password)}>
                                                Change Password
                                            </button>
                                            <button className="cancel-btn" type="button" onClick={handleCancelClick}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="student-table cont">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Surname</th>
                                            <th>First Name</th>
                                            <th>Initial</th>
                                            <th>Section</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className='no-fetch-msg'>No students found</td>
                                            </tr>
                                        ) : (
                                            students.map((student, index) => (
                                                <tr key={index}>
                                                    <td className="username">{student.username}</td>
                                                    <td className="last-name">{student.last_name}</td>
                                                    <td className="first-name">{student.first_name}</td>
                                                    <td className="mid-init">{student.middle_initial}</td>
                                                    <td className="section">{student.section}</td>
                                                    <td className="action">
                                                        {!formVisible && (
                                                            <button type="button" onClick={() => handleEditStudent(student)}>
                                                                Edit
                                                            </button>
                                                        )}
                                                        <button type="button" className="del-btn" onClick={() => handleDeleteStudent(student)}>
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <p className='no-fetch-msg'>Please select a section</p>
                    )}
                </div>
            </>
        );
    }

    export default StudentRecord;
