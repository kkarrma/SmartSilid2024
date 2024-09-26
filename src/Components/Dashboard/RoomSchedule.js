import React, { useState, useEffect } from 'react';
import './RoomSchedule.css';

function RoomSchedule() {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newDay, setNewDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [schedFormVisible, setSchedFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editSubject, setEditSubject] = useState({});
  
  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://192.168.10.112:8000/get_subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddSubject = async () => {
    const newEntry = { 
      subj: newSubject, 
      day: newDay, 
      start_time: startTime, 
      end_time: endTime 
    };
    
    try {
      await fetch('http://192.168.10.112:8000/add_subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      setSubjects([...subjects, newEntry]);
      setNewSubject('');
      setNewDay('');
      setStartTime('');
      setEndTime('');
      setSchedFormVisible(false);
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject. Please try again.');
    }
  };

  const handleEditSubject = (subject) => {
    setEditSubject(subject);
    setEditFormVisible(true);
  };

  const handleEditSched = async () => {
    try {
      await fetch('http://192.168.10.112:8000/edit_schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editSubject),
      });
      setSubjects(subjects.map(subj => (subj.subj === editSubject.subj ? editSubject : subj)));
      setEditFormVisible(false);
    } catch (error) {
      console.error('Error editing subject:', error);
      alert('Failed to edit subject. Please try again.');
    }
  };

  const handleDeleteSubject = async (subj) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${subj.subj}?`);
    if (!confirmDelete) return;

    try {
      await fetch('http://192.168.10.112:8000/delete_subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subj: subj.subj }),
      });
      setSubjects(subjects.filter(item => item.subj !== subj.subj));
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  return (
    <>
      <div className="subj-form">
        {schedFormVisible ? (
          <div className="new-subj-form">
            <input
              className="subj-input"
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter a subject"
              required
            />
            <select
              className="day-select"
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              required
            >
              <option value="" disabled>Select a day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
            </select>
            <input
              className="start-time-input"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <input
              className="end-time-input"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
            <button className="confirm-btn" onClick={handleAddSubject}>
              Confirm
            </button>
            <button className="cancel-btn" onClick={() => setSchedFormVisible(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="add-url-btn" onClick={() => setSchedFormVisible(true)}>
            <i className="fa-solid fa-plus"></i> Add Subject
          </button>
        )}
      </div>

      {editFormVisible && (
        <div className="edit-subj-form">
          <input
            className="subj-input"
            type="text"
            value={editSubject.subj || ''}
            onChange={(e) => setEditSubject({ ...editSubject, subj: e.target.value })}
            placeholder="Enter a subject"
            required
          />
          <select
            className="day-select"
            value={editSubject.day || ''}
            onChange={(e) => setEditSubject({ ...editSubject, day: e.target.value })}
            required
          >
            <option value="" disabled>Select a day</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
          </select>
          <input
            className="start-time-input"
            type="time"
            value={editSubject.start_time || ''}
            onChange={(e) => setEditSubject({ ...editSubject, start_time: e.target.value })}
            required
          />
          <input
            className="end-time-input"
            type="time"
            value={editSubject.end_time || ''}
            onChange={(e) => setEditSubject({ ...editSubject, end_time: e.target.value })}
            required
          />
          <button className="update-btn" onClick={handleEditSched}>
            Update
          </button>
          <button className="cancel-btn" onClick={() => setEditFormVisible(false)}>
            Cancel
          </button>
        </div>
      )}

      <div className="subj-table">
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Day</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan="5">No subjects found</td>
              </tr>
            ) : (
              subjects.map((subs, index) => (
                <tr key={index}>
                  <td className="sub">{subs.subj}</td>
                  <td className="day">{subs.day}</td>
                  <td className="start-time">{subs.start_time}</td>
                  <td className="end-time">{subs.end_time}</td>
                  <td className="action">
                    <button type="button" className="edit-btn" onClick={() => handleEditSubject(subs)}>
                      Edit
                    </button>
                    <button type="button" className="del-btn" onClick={() => handleDeleteSubject(subs)}>
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
  );
}

export default RoomSchedule;
