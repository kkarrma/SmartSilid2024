import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentRecord.css';

function StudentRecord() {
    const [username, setUsername] = useState('');
    const [type, setType] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [first_name, setFirstname] = useState('');
    const [middle_initial, setMiddlename] = useState('');
    const [last_name, setLastname] = useState('');
    const [section, setSection] = useState('');
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const navigate = useNavigate();

    const getCSRFToken = () => {
        const tokenElement = document.querySelector('meta[name="csrf-token"]');
        return tokenElement ? tokenElement.getAttribute('content') : '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        if (!section || !password || !confirmPassword || !first_name || !last_name) {
          alert('Please fill in all required fields');
          return;
        }
      
        if (password !== confirmPassword) {
          alert('Passwords do not match');
          return;
        }
      
        setLoading(true);
      
        try {
          const response = await fetch('http://192.168.10.118:8000/create_user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
              username,
              type,
              password,
              first_name,
              middle_initial,
              last_name,
              section
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
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setFirstname('');
        setMiddlename('');
        setLastname('');
        setSection('');
    };

    const [sections, setSections] = useState([]);
    const [newSectionName, setNewSectionName] = useState('');
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [selectedSection, setSelectedSection] = useState(null);

    const handleAddSection = () => {
        if (newSectionName.trim()) {
            setSections([...sections, newSectionName.trim()]);
            setNewSectionName(''); 
            setIsAddingSection(false); 
        }
    };

    const handleCancelAddSection = () => {
        setIsAddingSection(false);
        setNewSectionName(''); // Clear the input if canceled
    };

    const handleNewSectionChange = (e) => {
        setNewSectionName(e.target.value);
    };

    const handleSectionClick = (section) => {
        setSelectedSection(section);
    };

    const handleRemoveSection = (section) => {
        setSections(sections.filter(sec => sec !== section));
        if (selectedSection === section) {
            setSelectedSection(null);
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
                    {sections.map((section, index) => (
                        <div key={index} className="section-item">
                            <button
                                className={`section-btn ${selectedSection === section ? 'selected' : ''}`}
                                onClick={() => handleSectionClick(section)}
                            >
                                {section}
                                {selectedSection === section && (
                                    <button
                                        className="remove-btn"
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            handleRemoveSection(section);
                                        }}
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

  
           
            {/* <div className="student-form">
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
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            />
                            <div>
                                <label htmlFor="section">Section: <span>*</span></label>
                                <input
                                    type="section"
                                    id="section"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
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
                <form>
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
                            <tr>
                                <td className="last-name">Dimagiba</td>
                                <td className="first-name">John Doe</td>
                                <td className="mid-init">D</td>
                                <td className="section">Section 1</td>
                                <td className="action">
                                    <button type="submit">
                                        Edit
                                    </button>
                                    <button type="button" className="del-btn">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div> */}

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
                            <div>
                                <label htmlFor="section">Section: <span>*</span></label>
                                <input
                                    type="text"
                                    id="section"
                                    value={section}
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
                                required={!editMode}
                            />
                        </div>
                        <div className="password-div">
                            <label htmlFor="confirmPassword">Confirm Password: <span>*</span></label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required={!editMode}
                            />
                        </div>
                        <div className="reg-div">
                            <button type="submit">
                                {editMode ? 'Update Student' : 'Add Student'}
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
                <form>
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
                            <tr>
                                <td className="last-name">Dimagiba</td>
                                <td className="first-name">John Doe</td>
                                <td className="mid-init">D</td>
                                <td className="section">Section 1</td>
                                <td className="action">
                                    <button type="button" onClick={() => handleEditClick({
                                        first_name: 'John Doe',
                                        middle_initial: 'D',
                                        last_name: 'Dimagiba',
                                        section: 'Section 1',
                                    })}>
                                        Edit
                                    </button>
                                    <button type="button" className="del-btn">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </div>
                                    

        </>
    );
}

export default StudentRecord;
