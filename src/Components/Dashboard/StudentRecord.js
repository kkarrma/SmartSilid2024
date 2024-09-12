import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentRecord.css';

function StudentRecord() {
    const type = "Student";
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [first_name, setFirstname] = useState('');
    const [middle_initial, setMiddlename] = useState('');
    const [last_name, setLastname] = useState('');
    const [section, setSection] = useState('');
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [sections, setSections] = useState([]);
    const [newSectionName, setNewSectionName] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();

    // Helper functions
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const formatMiddleInitials = (middleInitials) =>
        middleInitials
            .split('')
            .map(initial => initial.toUpperCase() + '.')
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

    const handleEditStudent = async () => {}
    const handleDeleteStudent = async () => {}
    
    const fetchSections = async () => {
        try {
            const response = await fetch('http://192.168.10.112:8000/get_all_sections');
            if (response.ok) {
                const data = await response.json();
                setSections(data.sections.map(sec => sec.name)); 
            } else {
                console.error('Failed to fetch sections');
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const handleStudentList = async (sectionName) => {
        try {
            const response = await fetch(`http://192.168.10.112:8000/get_all_students`);
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched students:', data.students);

                // Filter, format, and sort students
                const filteredStudents = data.students.filter(student => student.section === sectionName);
                const formattedStudents = filteredStudents.map(formatStudentName);
                const sortedStudents = sortStudents(formattedStudents);

                setStudents(sortedStudents);
            } else {
                console.error('Failed to fetch students');
            }
        } catch (error) {
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

    const getCSRFToken = () => {
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        return tokenElement ? tokenElement.getAttribute('content') : '';
    };

    const handleSubmit = async (e) => {
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
            const response = await fetch('http://192.168.10.112:8000/create_user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
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
                // Refresh the student list for the selected section
                handleStudentList(selectedSection);
            }
            setFormVisible(false); 
        } catch (error) {
            console.error('Error:', error);
            alert(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => { 
        setFormVisible(true);
    };

    const handleCancelClick = () => {
        setFormVisible(false);
        setPassword('');
        setConfirmPassword('');
        setFirstname('');
        setMiddlename('');
        setLastname('');
        setSection('');
    };

    const handleAddSection = async () => {
        if (newSectionName.trim()) {
            try {
                const response = await fetch('http://192.168.10.112:8000/add_section', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: JSON.stringify({ name: newSectionName.trim() }),
                });

                if (response.ok) {
                    await fetchSections(); // Fetch updated sections after adding a new section
                } else {
                    console.error('Failed to add section');
                }
            } catch (error) {
                console.error('Error adding section:', error);
            }

            setNewSectionName('');
            setIsAddingSection(false);
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

    const handleRemoveSection = async (sectionToRemove) => {
        try {
            if (!window.confirm(`Are you sure you want to remove the section "${sectionToRemove}"?`)) {
                return;
            }
    
            const response = await fetch('http://192.168.10.112:8000/delete_section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
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
            console.error('Error removing section:', error);
            alert(`An error occurred: ${error.message}`);
        }
    };

    return (
        <>
            <div className="section-form">
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
                    <button className="add-section-btn" onClick={() => setIsAddingSection(true)}>
                        <i className="fa-solid fa-plus"></i> Section
                    </button>
                )}
                <div className="sections-container">
                    {sections.length === 0 ? (
                        <p>No sections available</p>
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
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedSection ? (
                <>
                    <div className="student-form">
                        {formVisible && (
                            <form onSubmit={handleSubmit}>
                                <div className="name-div">
                                    <div>
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
                                </div>
                                <div className="creds-div">
                                    <input
                                        type="hidden"
                                        id="type"
                                    />
                                    <div>
                                        <label htmlFor="section">Section: <span>*</span></label>
                                        <input
                                            type="text"
                                            id="section"
                                            value={selectedSection || 'Select a section'}
                                            onChange={(e) => setSection(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="password-div">
                                    <label htmlFor="password">Password: <span>*</span></label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="password-div">
                                    <label htmlFor="confirmPassword">Confirm Password: <span>*</span></label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
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
                        )}
                    </div>

                    <div className="reg-div">
                        {!formVisible && (
                            <button className="adds-btn" type="button" onClick={handleAddClick}>
                                <i className="fa-solid fa-plus"></i> Student
                            </button>
                        )}
                    </div>

                    <div className="student-table">
                        <table>
                            <thead>
                                <tr>
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
                                        <td colSpan="5">No students found</td>
                                    </tr>
                                ) : (
                                    students.map((student, index) => (
                                        <tr key={index}>
                                            <td className="last-name">{student.last_name}</td>
                                            <td className="first-name">{student.first_name}</td>
                                            <td className="mid-init">{student.middle_initial}</td>
                                            <td className="section">{student.section}</td>
                                            <td className="action">
                                                <button type="button" onClick={() => handleEditStudent(student)}>
                                                    Edit
                                                </button>
                                                <button type="button" className="del-btn" onClick={() => handleDeleteStudent(student.id)}>
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
                <p>Please select a section</p>
            )}
        </>
    );
}

export default StudentRecord;
