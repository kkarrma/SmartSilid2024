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
    const [sections, setSections] = useState([]);
    const [newSectionName, setNewSectionName] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);
    const [students, setStudents] = useState([]);
    const [formVisible, setFormVisible] = useState(false);
    const [editFormVisible, setEditFormVisible] = useState(false);
    const navigate = useNavigate();

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

    const formatMiddleInitials = (middleInitials) =>
        middleInitials.split('').map(initial => initial.toUpperCase()).join('');

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

    const handleEditStudent = (student) => {
        setFirstname(student.first_name);
        setLastname(student.last_name);
        setMiddlename(student.middle_initial);
        setPassword('');
        setConfirmPassword('');
        setFormVisible(false);
        setEditFormVisible(true);
    };

    const handleDeleteStudent = async (student) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`);
        if (!confirmDelete) return;

        const username = `${student.first_name}.${student.last_name}.${student.middle_initial}`;
        try {
            const response = await fetch('http://192.168.10.112:8000/delete_student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ username }),
            });

            if (response.ok) {
                setStudents((prevStudents) => prevStudents.filter((s) => `${s.first_name}.${s.last_name}.${s.middle_initial}` !== username));
                alert(`${student.first_name} ${student.last_name} has been deleted successfully.`);
            } else {
                const text = await response.text();
                alert(`Failed to delete student: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    const fetchSections = async () => {
        try {
            const response = await fetch('http://192.168.10.112:8000/get_all_sections');
            if (response.ok) {
                const data = await response.json();
                setSections(data.sections.map(sec => sec.name));
            } else {
                alert('Failed to fetch sections');
            }
        } catch (error) {
            alert('Error fetching sections:', error);
        }
    };

    const handleStudentList = async (sectionName) => {
        try {
            const response = await fetch('http://192.168.10.112:8000/get_all_students');
            if (response.ok) {
                const data = await response.json();
                const filteredStudents = data.students.filter(student => student.section === sectionName);
                const formattedStudents = filteredStudents.map(formatStudentName);
                setStudents(sortStudents(formattedStudents));
            } else {
                alert('Failed to fetch students');
            }
        } catch (error) {
            alert('Error fetching students:', error);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    useEffect(() => {
        if (selectedSection) {
            handleStudentList(selectedSection);
        } else {
            setStudents([]);
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
        const endpoint = editFormVisible ? 'http://192.168.10.112:8000/edit_student' : 'http://192.168.10.112:8000/create_user';
        const studentData = {
            type,
            password,
            first_name,
            middle_initial,
            last_name,
            section: selectedSection
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify(studentData),
            });

            if (!response.ok) {
                const text = await response.text();
                alert(`Operation failed: ${response.status} ${response.statusText}`);
                return;
            }

            const data = await response.json();
            if (data.status_message) {
                alert(data.status_message);
            } else {
                alert(editFormVisible ? 'Student updated successfully' : 'Signup successful');
                const newStudent = formatStudentName({ first_name, middle_initial, last_name, section: selectedSection });
                setStudents((prevStudents) => {
                    if (editFormVisible) {
                        return prevStudents.map((s) => (s.username === data.username ? newStudent : s));
                    } else {
                        return sortStudents([...prevStudents, newStudent]);
                    }
                });
            }
            setFormVisible(false);
            setEditFormVisible(false);
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setFormVisible(true);
        setEditFormVisible(false);
    };

    const handleCancelClick = () => {
        setFormVisible(false);
        setEditFormVisible(false);
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
                    await fetchSections();
                } else {
                    alert('Failed to add section');
                }
            } catch (error) {
                alert('Error adding section:', error);
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
        setSelectedSection(selectedSection === sectionToToggle ? null : sectionToToggle);
    };

    const handleRemoveSection = async (sectionToRemove) => {
        if (!window.confirm(`Are you sure you want to remove the section "${sectionToRemove}"?`)) return;

        try {
            const response = await fetch('http://192.168.10.112:8000/delete_section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ name: sectionToRemove }),
            });

            if (response.ok) {
                await fetchSections();
                if (selectedSection === sectionToRemove) {
                    setSelectedSection(null);
                }
            } else {
                alert('Failed to remove section');
            }
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        }
    };
    
    const handleMoveSection = async (students, newSection) => {
        try {
            const response = await fetch('http://192.168.10.112:8000/move_section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ username: students.username, new_section: newSection }),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            console.log('Move section response:', data);
            // Update state to reflect the new section
            setStudents((prevStudents) =>
                prevStudents.map((s) =>
                    s.username === student.username ? { ...s, section: newSection } : s
                )
            );
        } catch (error) {
            console.error('Error moving section:', error);
        }
    };
    
    const handleChangePassword = async (username, newPassword) => {
        try {
            const response = await fetch('http://192.168.10.112:8000/change_password_student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                body: JSON.stringify({ username, new_password: newPassword }),
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const data = await response.json();
            console.log('Change password response:', data);
        } catch (error) {
            console.error('Error changing password:', error);
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

                    <div className="edit-form">
                        {editFormVisible && (
                            <form onSubmit={handleSubmit}>
                                <div className="name-div">
                                    <div>
                                        <label htmlFor="firstname">First Name: <span>*</span></label>
                                        <input
                                            type="text"
                                            id="firstname"
                                            value={first_name}
                                            onChange={(e) => setFirstname(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="middlename">Middle Initial: <span>*</span></label>
                                        <input
                                            type="text"
                                            id="middlename"
                                            value={middle_initial}
                                            onChange={(e) => setMiddlename(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="lastname">Last Name: <span>*</span></label>
                                        <input
                                            type="text"
                                            id="lastname"
                                            value={last_name}
                                            onChange={(e) => setLastname(e.target.value)}
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
                                    <input
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="password-div">
                                    <label htmlFor="confirmPassword">Confirm Password: <span>*</span></label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <div className="reg-div">
                                    <button type="button" onClick={() => handleMoveSection(students, newSection)} >
                                        Move Section
                                    </button>
                                    <button type="button" onClick={() => handleChangePassword(username, newPassword)}>
                                        Change Password
                                    </button>
                                    <button className="cancel-btn" type="button" onClick={handleCancelClick}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
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
                <p>Please select a section</p>
            )}
        </>
    );
}

export default StudentRecord;