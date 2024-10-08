import React, { useState, useEffect } from 'react';
import './RoomSchedule.css';

function RoomSchedule() {
  const [id, setId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newDay, setNewDay] = useState('');
  const [start_time, setStartTime] = useState('');
  const [end_time, setEndTime] = useState('');
  const [faculty, setFaculty] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [sections, setSections] = useState([]);
  const [schedFormVisible, setSchedFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [facultyList, setFacultyList] = useState([]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('http://192.168.10.112:8000/get_all_schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setSchedules(data.schedule || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

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

  const fetchFaculty = async () => {
    try {
      const response = await fetch('http://192.168.10.112:8000/get_all_faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setFacultyList(data.faculties || []);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchFaculty();
    fetchSections();
  }, []);

  const weekdayMap = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    R: 'Thursday',
    F: 'Friday',
    S: 'Saturday',
    U: 'Sunday'
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const suffix = +hours >= 12 ? 'PM' : 'AM';
    const formattedHours = +hours % 12 || 12;
    return `${formattedHours}:${minutes} ${suffix}`;
  };

  const handleAddSchedule = async () => {
    if (!newSubject || !newDay || !start_time || !end_time || !faculty || !selectedSection) {
      alert('Please fill in all fields');
      return;
    }
    
    try {
      const response = await fetch('http://192.168.10.112:8000/add_schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          subject: newSubject,
          section: selectedSection,
          weekdays: newDay, 
          start_time,
          end_time,
          faculty_name: faculty
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchSchedules();
      resetForm();
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Failed to add schedule. Please try again.');
    }
  };

  const resetForm = () => {
    setId('');
    setNewSubject('');
    setNewDay('');
    setStartTime('');
    setEndTime('');
    setFaculty('');
    setSelectedSection('');
    setSchedFormVisible(false);
  };

  const handleEditForm = (schedule) => {
    setEditSchedule(schedule);
    setId(schedule.id); // Set the ID from the selected schedule
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
          section: editSchedule.section,
          weekdays: editSchedule.weekdays, // Send the weekdays correctly
          start_time: editSchedule.start_time,
          end_time: editSchedule.end_time,
          faculty_name: editSchedule.faculty_name
        }),
      });
      fetchSchedules();
      setEditFormVisible(false);
      resetForm();
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
      <div className='room-schedule'>
        {schedFormVisible ? (
          <div className="subj-form cont">
            <div className='input-subj-name input-row'> 
              <label className=''>Subject Name: </label>
              <input
                className="subj-input"
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Enter a subject"
                required
              />
            </div>
            
            <div className='input-day input-row'>
              <label className=''>Day: </label>
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
            </div>
  
            <div className='input-start-time input-row'>
              <label className=''>Start Time: </label>
              <input
                className="start-time-input"
                type="time"
                value={start_time}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
  
            <div className='input-end-time input-row'>
              <label className=''>End Time: </label>
              <input
                className="end-time-input"
                type="time"
                value={end_time}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
  
            <div className='input-fac-name input-row'>
              <label className=''>Faculty Name: </label>
              <select
                className="faculty-select"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                required
              >
                <option value="" disabled>Select a faculty</option>
                {facultyList.map(faculty => (
                  <option key={faculty.username} value={faculty.username}>
                    {`${faculty.first_name} ${faculty.middle_initial} ${faculty.last_name}`.trim()}
                  </option>
                ))}
              </select>
            </div>
  
            <div className='input-sect input-row'>
              <label className=''>Section: </label>
              <select
                className="section-select"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                required
              >
                <option value="" disabled>Select a section</option>
                {sections.map(section => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
  
            <div className='input-action input-row'>
              <button className="confirm-btn" onClick={handleAddSchedule}>
                Confirm
              </button>
              <button className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className='cont'>
            <button className="add-url-btn" onClick={() => {
              setSchedFormVisible(true);
              setEditFormVisible(false);
            }}>
              <i className="fa-solid fa-plus"></i> Add Schedule
            </button>
          </div>
        )}
  
        {editFormVisible && editSchedule && (
          <div className="edit-subj-form cont">
            <div className='input-subj-name input-row'> 
              <label className=''>Subject Name: </label>
              <input
                className="subj-input"
                type="text"
                value={editSchedule.subject}
                onChange={(e) => setEditSchedule({ ...editSchedule, subject: e.target.value })}
                placeholder="Enter a subject"
                required
              />
            </div>
            
            <div className='input-day input-row'> 
              <label className=''>Day: </label>
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
            </div>
            
            <div className='input-start-time input-row'> 
              <label className=''>Start Time: </label>
              <input
                className="start-time-input"
                type="time"
                value={editSchedule.start_time}
                onChange={(e) => setEditSchedule({ ...editSchedule, start_time: e.target.value })}
                required
              />
            </div>
            
            <div className='input-end-time input-row'> 
              <label className=''>End Time: </label>
              <input
                className="end-time-input"
                type="time"
                value={editSchedule.end_time}
                onChange={(e) => setEditSchedule({ ...editSchedule, end_time: e.target.value })}
                required
              />
            </div>
            
            <div className='input-fac-name input-row'> 
              <label className=''>Faculty Name: </label>
              <select
                className="faculty-select"
                value={editSchedule.faculty}
                onChange={(e) => setEditSchedule({ ...editSchedule, faculty_name: e.target.value })}
                required
              >
                <option value="" disabled>Select a faculty</option>
                {facultyList.map(faculty => (
                  <option key={faculty.username} value={faculty.username}>
                    {`${faculty.first_name} ${faculty.middle_initial} ${faculty.last_name}`.trim()}
                  </option>
                ))}
              </select>
            </div>
            
            <div className='input-sect input-row'> 
              <label className=''>Section: </label>
              <select
                className="section-select"
                value={editSchedule.section}
                onChange={(e) => setEditSchedule({ ...editSchedule, section: e.target.value })}
                required
              >
                <option value="" disabled>Select a section</option>
                {sections.map(section => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
            
            <div className='input-action input-row'> 
              <button className="update-btn" onClick={handleEditSched}>
                Update
              </button>
              <button className="cancel-btn" onClick={() => setEditFormVisible(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
  
        <div className="subj-table cont">
          <table>
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Section</th>
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
                    <td className="faculty">{schedule.faculty}</td>
                    <td className="faculty">{schedule.section}</td>
                    <td className="sub">{schedule.subject}</td>
                    <td className="day">{weekdayMap[schedule.weekdays]}</td>
                    <td className="start-time">{formatTime(schedule.start_time)}</td>
                    <td className="end-time">{formatTime(schedule.end_time)}</td>
                    <td className="action">
                      <button type="button" className="edit-btn" onClick={() => {
                        handleEditForm(schedule);
                        setSchedFormVisible(false);
                        console.log(schedule.faculty);
                      }}>
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
  
        {/* Mobile Schedule Table */}
        <div className="mobile-subj-table cont">
          {schedules.length === 0 ? (
            <div>No schedules found</div>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="subject-entry">
                <div className="subject-name">{schedule.subject}</div>
                <div className="day-time-row">
                  <div>{weekdayMap[schedule.weekdays]}</div>
                  <div>{`${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}</div>
                </div>
                <div className="section-faculty-row">
                  <div>{schedule.section}</div>
                  <div>{schedule.faculty}</div>
                </div>
                <div className="action-row">
                  <button type="button" className="edit-btn" onClick={() => {
                    handleEditForm(schedule);
                    setSchedFormVisible(false);
                    console.log(schedule.faculty);
                  }}>
                    Edit
                  </button>
                  <button type="button" className="del-btn" onClick={() => handleDeleteSchedule(schedule)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
  
}

export default RoomSchedule;
