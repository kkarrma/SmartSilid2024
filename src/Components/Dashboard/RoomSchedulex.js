import React, { useState, useEffect } from 'react';
import './RoomSchedule.css';

function RoomSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newDay, setNewDay] = useState('');
  const [start_time, setStartTime] = useState('');
  const [end_time, setEndTime] = useState('');
  const [faculty, setFaculty] = useState('');
  const [schedFormVisible, setSchedFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [facultyList, setFacultyList] = useState([]); // Initialize as empty array

  const fetchSchedules = async () => {
    try {
      const response = await fetch('http://192.168.10.112:8000/get_all_schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setSchedules(data.schedule || []); // Default to empty array if undefined
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch('http://192.168.10.112:8000/get_all_faculty_and_rfid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setFacultyList(data.faculty || []); // Default to empty array if undefined
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchFaculty(); // Fetch faculty when the component mounts
  }, []);

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const suffix = +hours >= 12 ? 'PM' : 'AM';
    const formattedHours = +hours % 12 || 12; // Convert 0 to 12
    return `${formattedHours}:${minutes} ${suffix}`;
  };

  const weekdayMap = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    R: 'Thursday',
    F: 'Friday',
    S: 'Saturday',
    U: 'Sunday'
  };

  const handleAddSchedule = async () => {
    const newEntry = {
      subject: newSubject,
      section: 'YourSectionName',
      weekdays: newDay,
      start_time: start_time,
      end_time: end_time,
      faculty_name: faculty
    };

    try {
      await fetch('http://192.168.10.112:8000/add_schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      fetchSchedules();
      resetForm();
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Failed to add schedule. Please try again.');
    }
  };

  const resetForm = () => {
    setNewSubject('');
    setNewDay('');
    setStartTime('');
    setEndTime('');
    setFaculty(''); // Reset faculty
    setSchedFormVisible(false);
  };

  const handleEditSchedule = (schedule) => {
    setEditSchedule(schedule);
    setEditFormVisible(true);
  };

  const handleEditSched = async () => {
    try {
      await fetch('http://192.168.10.112:8000/update_schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editSchedule.id,
          subject: editSchedule.subject,
          section: 'YourSectionName',
          weekdays: editSchedule.weekdays,
          start_time: editSchedule.start_time,
          end_time: editSchedule.end_time,
          faculty_name: editSchedule.faculty_name // Ensure this matches the updated structure
        }),
      });
      fetchSchedules();
      setEditFormVisible(false);
    } catch (error) {
      console.error('Error editing schedule:', error);
      alert('Failed to edit schedule. Please try again.');
    }
  };

  const handleDeleteSchedule = async (schedule) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${schedule.subject}?`);
    if (!confirmDelete) return;

    try {
      await fetch('http://192.168.10.112:8000/delete_schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: schedule.id }),
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
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
              <option value="M">Monday</option>
              <option value="T">Tuesday</option>
              <option value="W">Wednesday</option>
              <option value="R">Thursday</option>
              <option value="F">Friday</option>
              <option value="S">Saturday</option>
              <option value="U">Sunday</option>
            </select>
            <input
              className="start-time-input"
              type="time"
              value={start_time}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <input
              className="end-time-input"
              type="time"
              value={end_time}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
            <select
              className="faculty-select"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              required
            >
              <option value="" disabled>Select a faculty</option>
              {facultyList.map((facultyMember) => (
                <option key={facultyMember.id} value={facultyMember.name}>{facultyMember.name}</option>
              ))}
            </select>
            <button className="confirm-btn" onClick={handleAddSchedule}>
              Confirm
            </button>
            <button className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="add-url-btn" onClick={() => setSchedFormVisible(true)}>
            <i className="fa-solid fa-plus"></i> Add Schedule
          </button>
        )}
      </div>

      {editFormVisible && editSchedule && (
        <div className="edit-subj-form">
          <input
            className="subj-input"
            type="text"
            value={editSchedule.subject}
            onChange={(e) => setEditSchedule({ ...editSchedule, subject: e.target.value })}
            placeholder="Enter a subject"
            required
          />
          <select
            className="day-select"
            value={editSchedule.weekdays}
            onChange={(e) => setEditSchedule({ ...editSchedule, weekdays: e.target.value })}
            required
          >
            <option value="" disabled>Select a day</option>
            <option value="M">Monday</option>
            <option value="T">Tuesday</option>
            <option value="W">Wednesday</option>
            <option value="R">Thursday</option>
            <option value="F">Friday</option>
            <option value="S">Saturday</option>
            <option value="U">Sunday</option>
          </select>
          <input
            className="start-time-input"
            type="time"
            value={editSchedule.start_time}
            onChange={(e) => setEditSchedule({ ...editSchedule, start_time: e.target.value })}
            required
          />
          <input
            className="end-time-input"
            type="time"
            value={editSchedule.end_time}
            onChange={(e) => setEditSchedule({ ...editSchedule, end_time: e.target.value })}
            required
          />
          <select
            className="faculty-select"
            value={editSchedule.faculty_name} // Ensure this matches your schedule structure
            onChange={(e) => setEditSchedule({ ...editSchedule, faculty_name: e.target.value })}
            required
          >
            <option value="" disabled>Select a faculty</option>
            {facultyList.map((facultyMember) => (
              <option key={facultyMember.id} value={facultyMember.name}>{facultyMember.name}</option>
            ))}
          </select>
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
              <th>Faculty</th> 
              <th>Subject</th>
              <th>Day</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan="6">No schedules found</td>
              </tr>
            ) : (
              schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="faculty">{schedule.faculty_name}</td>
                  <td className="sub">{schedule.subject}</td>
                  <td className="day">{weekdayMap[schedule.weekdays]}</td>
                  <td className="start-time">{formatTime(schedule.start_time)}</td>
                  <td className="end-time">{formatTime(schedule.end_time)}</td>
                  <td className="action">
                    <button type="button" className="edit-btn" onClick={() => handleEditSchedule(schedule)}>
                      Edit
                    </button>
                    <button type="button" className="del-btn" onClick={() => handleDeleteSchedule(schedule)}>
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
