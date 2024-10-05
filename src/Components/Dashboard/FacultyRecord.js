import React, { useState, useEffect } from 'react';
import './FacultyRecord.css';

function FacultyRecord() {
  const [first_name, setFirstname] = useState('');
  const [last_name, setLastname] = useState('');
  const [middle_initial, setMiddleinitial] = useState('');
  const [username, setUsername] = useState('');
  const [type, setType] = useState('');
  const [password, setPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [facultyData, setFacultyData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [availableRfids, setAvailableRfids] = useState([]);
  const [rfidBindings, setRfidBindings] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setUsername(`${first_name}.${last_name}.${middle_initial}`);
  }, [first_name, last_name, middle_initial]);


  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.10.112:8000/get_all_faculty_and_rfid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (response.ok) {
        const data = await response.json();
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
    e.preventDefault();
    if (!first_name || !last_name || !type || !password || !confirm_password) {
      setErrorMessage('Please fill in all fields correctly.');
      return;
    }

    if (password !== confirm_password) {
      setErrorMessage('Password does not matched. Try again.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://192.168.10.112:8000/create_faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setErrorMessage('An error occurred while creating faculty. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (facultyUsername) => {
    try {
      const response = await fetch('http://192.168.10.112:8000/delete_faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: facultyUsername }),
      });
      if (response.ok) {
        fetchFaculty();
      } else {
        setErrorMessage('Failed to delete faculty. Please try again later.');
      }
    } catch (error) {
      setErrorMessage('An error occurred while deleting faculty. Please check your connection.');
    }
  };

  const handleDeleteRFID = async (rfid) => {
    try {
      const response = await fetch('http://192.168.10.112:8000/delete_rfid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    const facultyUsername = rfidBindings[rfid];
    if (facultyUsername !== 'none') {
      try {
        const response = await fetch('http://192.168.10.112:8000/bind_rfid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: facultyUsername, rfid }),
        });
        if (response.ok) {
          fetchFaculty();
        } else {
          setErrorMessage('Failed to bind RFID. Please try again later.');
        }
      } catch (error) {
        setErrorMessage('An error occurred while binding RFID. Please check your connection.');
      }
    }
  };

  const handleUnbindRFID = async (facultyUsername, rfid) => {
    try {
      const response = await fetch('http://192.168.10.112:8000/bind_rfid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '', rfid: '' }),
      });
      if (response.ok) {
        fetchFaculty();
      } else {
        setErrorMessage('Failed to unbind RFID. Please try again later.');
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
  };

  const handleToggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <>
      {!addFormVisible && (
        <button onClick={() => setAddFormVisible(true)}>Add Faculty</button>
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
            value={confirm_password}
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

      <div className="faculty-list">
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

      <div className="rfid-list" style={{ display: 'flex', flexDirection: 'column' }}>
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
    </>
  );
}

export default FacultyRecord;
