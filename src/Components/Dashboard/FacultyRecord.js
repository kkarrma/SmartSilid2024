import React, { useState, useEffect } from 'react';
import './FacultyRecord.css';

function FacultyRecord() {
  const [first_name, setFirstname] = useState('');
  const [last_name, setLastname] = useState('');
  const [middle_initial, setMiddleinitial] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [addFormVisible, setAddFormVisible] = useState(false);
  const [facultyData, setFacultyData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [availableRfids, setAvailableRfids] = useState([]); // State for available RFIDs
  const [selectedRfid, setSelectedRfid] = useState('none'); // State for selected RFID

  const fetchFaculty = async () => {
    try {
      const response = await fetch('http://192.168.10.112:8000/get_all_faculty_and_rfid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched faculty data:', data);
        setFacultyData(data.faculties);

        // Extract available RFIDs from the response
        const rfids = data.rfid.map(r => r.rfid); // Adjust to match your JSON structure
        setAvailableRfids(rfids);
      } else {
        console.error('Failed to fetch the faculty.');
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const formatFacultyName = (faculty) => ({
    ...faculty,
    first_name: capitalize(faculty.first_name),
    last_name: capitalize(faculty.last_name),
    middle_initial: capitalize(faculty.middle_initial.replace('.', '').trim()),
  });

  const formatUserName = (faculty) => {
    setUsername(`${faculty.first_name}.${faculty.last_name}.${faculty.middle_initial}`);
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      const response = await fetch('http://192.168.10.112:8000/create_faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          last_name,
          middle_initial,
          username,
          password,
        }),
      });
      if (response.ok) {
        fetchFaculty(); // Refresh faculty list
        handleCancelBtn();
      } else {
        console.error('Failed to create faculty.');
      }
    } catch (error) {
      console.error('Error creating faculty', error);
      alert(`An error occurred: ${error.message}`);
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
        fetchFaculty(); // Refresh faculty list
      } else {
        console.error('Failed to delete faculty.');
      }
    } catch (error) {
      console.error('Error deleting faculty', error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  const handleEditFaculty = async () => {
    setFirstname('');
    setLastname('');
    setMiddleinitial('');
    setPassword('');
    setConfirmPassword('');
    setEditFormVisible(true);
    setAddFormVisible(false);
  };

  const handleCancelBtn = async () => {
    setFirstname('');
    setLastname('');
    setMiddleinitial('');
    setPassword('');
    setConfirmPassword('');
    setEditFormVisible(false);
    setAddFormVisible(false);
  };

  const handleToggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleDeleteRFID = (rfid) => {
    // Logic to delete the RFID from the database goes here
    console.log(`Delete RFID: ${rfid}`);
    // After deletion, you may want to refresh the available RFIDs list
  };

  return (
    <>
      {!addFormVisible && (
        <button onClick={() => setAddFormVisible(true)}>Add Faculty</button>
      )}

      {addFormVisible && (
        <form onSubmit={handleAddFaculty} className="faculty-form">
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
          <button type="submit">Add Faculty</button>
          <button type="button" onClick={handleCancelBtn}>Cancel</button>
        </form>
      )}

      <div className="faculty-list">
        {Array.isArray(facultyData) && facultyData.length > 0 ? (
          facultyData.map((faculty, index) => (
            <div key={index} className="faculty-item">
              <div className="faculty-header" onClick={() => handleToggleExpand(index)}>
                <span>{expandedIndex === index ? '-' : '+'}</span> {/* Move + / - here */}
                <strong>{`${faculty.username}`}</strong>
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                  <button onClick={() => {
                    setFirstname(faculty.first_name);
                    setLastname(faculty.last_name);
                    setMiddleinitial(faculty.middle_initial);
                    setEditFormVisible(true);
                    setAddFormVisible(false);
                  }}>
                    <i className="fa-solid fa-pen"></i> {/* Edit icon */}
                  </button>
                  <button onClick={() => handleDeleteFaculty(faculty.username)}>
                    <i className="fa-solid fa-trash-can"></i> {/* Delete icon */}
                  </button>
                </div>
              </div>
              {expandedIndex === index && (
                <div className="faculty-details">
                  <p>RFID Access:</p>
                  <ul>
                    {faculty.rfid && faculty.rfid.length > 0 ? (
                      faculty.rfid.map((rfid, rfidIndex) => (
                        <li key={rfidIndex} style={{ display: 'flex', alignItems: 'center' }}>
                          {rfid}
                          <button 
                            style={{ marginLeft: '8px', cursor: 'pointer' }} 
                            onClick={() => handleDeleteRFID(rfid)}
                          >
                            <i className="fa-solid fa-trash-can"></i> {/* Trash icon for RFID */}
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
                value={selectedRfid} 
                onChange={(e) => setSelectedRfid(e.target.value)}
              >
                <option value="none">None</option>
                {/* Assuming you have faculty names available in the data */}
                {facultyData.map((faculty, facultyIndex) => (
                  <option key={facultyIndex} value={faculty.username}>
                    {`${faculty.first_name} ${faculty.last_name}`}
                  </option>
                ))}
              </select>
              <button 
                style={{ marginLeft: '8px', cursor: 'pointer' }} 
                onClick={() => handleDeleteRFID(rfid)}
              >
                <i class="fa-solid fa-trash-can"></i>
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
