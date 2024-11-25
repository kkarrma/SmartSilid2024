import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './BASE_URL';
import './ClassSchedules.css';
import { useNavigate } from 'react-router-dom';
import AlertModal from './AlertModal';

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
  const [semester, setSemester] = useState(false);
  const [addSemesterFormVisible, setAddSemesterFormVisible] = useState(false);
  const [isSemesterActive, setIsSemesterActive] = useState(false);

  const Navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmCallback, setModalConfirmCallback] = useState(null);
  const showAlertModal = (message, onConfirm) => {
    setModalMessage(message);
    setModalConfirmCallback(() => onConfirm);
    setIsModalOpen(true); 
  };

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

  const fetchSchedules = async () => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/get_all_schedule`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchSchedules();
      }
      const data = await response.json();
      setSchedules(data.schedule || []);
      console.log(data.status);
      console.log(data);
      
      setIsSemesterActive(data.status);
      console.log("SEMESTER: ", data.current_semester);

      setSemester(data.current_semester);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleStartSemester = async (semester) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/start_semester`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ semester_name: semester })  
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleStartSemester(semester);
      }
      
      if (response.ok)  {
        fetchSchedules();
        setAddSemesterFormVisible(false);
        setSemester(semester); 
      }

    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
    
    setIsModalOpen(false);
  };

  const handleEndSemester = async () => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/end_semester`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleEndSemester();
      }
      
      if (response.ok)  {
        fetchSchedules();
        setAddSemesterFormVisible(false);
      }

    } catch (error) {
      console.error('Error fetching schedules:', error);
    }

    setIsModalOpen(false);
  };

  const fetchSections = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_sections`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchSections();
      }

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
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_faculty`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchFaculty();
      }

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

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const isPm = +hours >= 12;
    const formattedHours = (+hours % 12) || 12;
    const suffix = isPm ? 'PM' : 'AM';
    return `${formattedHours}:${minutes} ${suffix}`;
  };
  

  const handleAddSchedule = async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/add_schedule`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          id,
          subject: newSubject,
          section: selectedSection,
          weekdays: newDay, 
          start_time,
          end_time,
          faculty_name: faculty,
          semester_name: semester
        }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleAddSchedule();
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchSchedules();
      resetForm();
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Failed to add schedule. Please try again.');
    }

    setIsModalOpen(false);
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
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/update_schedule`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          id: editSchedule.id,
          subject: editSchedule.subject,
          section: editSchedule.section,
          weekdays: editSchedule.weekdays, // Send the new day correctly
          start_time: editSchedule.start_time,
          end_time: editSchedule.end_time,
          faculty_name: editSchedule.faculty_name
        }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleEditSched();
      }

      const data = await response.json();

      var formatted_error_message = (error_message) => {
        var errorMessages = "";
        console.log(error_message);
        for (const error in error_message) {
          console.log(error);
          errorMessages += `* ${error}\n`;
        }

        return errorMessages; 
      };
      
      console.log(data.status_message + "\n Error Messages: \n" + formatted_error_message(data.error_message));

      fetchSchedules();
      setEditFormVisible(false);
      resetForm();
    } catch (error) {
      console.error('Error editing schedule:', error);
      console.log('Failed to edit schedule. Please try again.');
    }

    setIsModalOpen(false);
  };

  const handleDeleteSchedule = async (schedule) => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/delete_schedule`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ id: schedule.id }),
        
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleDeleteSchedule(schedule);
      }

      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <div className='class-schedule'>
        
        {isSemesterActive === 0 ? (
          <div className='no-active-sem cont'>

            {addSemesterFormVisible ? (
              <>
                <h3 className='cont-title'> Semester Entry Form</h3>
                <div className='filter-controls'>
                  <form className='add-sem-form filter-cont' 
                    onSubmit={(e) => {
                      e.preventDefault();
                      showAlertModal(`Are you sure you want to start (${semester})?`, 
                      () => handleStartSemester(semester));
                    }}
                  > 
                    <div className='user-form'>
                      <label>Semester Name: </label>
                      <input
                        type="text"
                        onChange={(e) => setSemester(e.target.value)}
                        placeholder="1st Sem (A.Y. 2021-2022)"
                        required
                      />
                    </div>
                    {/* <button type="button" onClick={() => handleStartSemester(semester)}>Start</button> */}
                    <button type="submit">Start</button>
                    <button type="cancel" onClick={() => {
                      setAddSemesterFormVisible(false);
                      setSemester('');
                    }}>
                      Cancel
                    </button>
                  </form>
                </div>  
              </>
            ) : (
              <>
                <p className='no-fetch-msg'>No active semester</p>
                <button className='start-sem' onClick={() => setAddSemesterFormVisible(true)}>
                  Start Semester
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="subj-form cont">
              {schedFormVisible ? (
                <>
                  <h3 classame="cont-title">Schedule Entry Form</h3>
                  <div className='subj-form-inner'>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        showAlertModal('Are you sure you want to add this schedule?', 
                        handleAddSchedule);
                      }}
                    >
                      <div className='input-subj-name user-form'> 
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
                      
                      <div className='input-day user-form'>
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
            
                      <div className='input-start-time user-form'>
                        <label className=''>Start Time: </label>
                        <input
                          className="start-time-input"
                          type="time"
                          value={start_time}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                        />
                      </div>
            
                      <div className='input-end-time user-form'>
                        <label className=''>End Time: </label>
                        <input
                          className="end-time-input"
                          type="time"
                          value={end_time}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                        />
                      </div>
            
                      <div className='input-fac-name user-form'>
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
                              {`${faculty.first_name} ${faculty.middle_initial}. ${faculty.last_name}`.trim()}
                            </option>
                          ))}
                        </select>
                      </div>
            
                      <div className='input-sect user-form'>
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
            
                      <div className='input-action reg-div'>
                        <button type="submit" className="confirm-btn">
                          Add
                        </button>
                        <button className="cancel-btn" onClick={resetForm}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className='add-btn-div'>
                  <button 
                    className="add-url-btn" 
                    onClick={() => {
                      setSchedFormVisible(true);
                      setEditFormVisible(false);
                    }}
                  >
                    Add Schedule
                  </button>
                </div>
              )}
            </div>
      
            {editFormVisible && editSchedule && (
              <div className="edit-subj-form cont">
                <div className="edit-subj-form-inner">
                  <h3 classame="cont-title">Schedule Edit Form</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      showAlertModal('Are you sure you want to update this schedule?',
                      handleEditSched);
                    }}
                  >
                    <div className='input-subj-name user-form'> 
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
                    
                    <div className='input-day user-form'> 
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
                    
                    <div className='input-start-time user-form'> 
                      <label className=''>Start Time: </label>
                      <input
                        className="start-time-input"
                        type="time"
                        step = {"900"}
                        value={editSchedule.start_time}
                        onChange={(e) => setEditSchedule({ ...editSchedule, start_time: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className='input-end-time user-form'> 
                      <label className=''>End Time: </label>
                      <input
                        className="end-time-input"
                        type="time"
                        step={"900"}
                        value={editSchedule.end_time}
                        onChange={(e) => setEditSchedule({ ...editSchedule, end_time: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className='input-fac-name user-form'> 
                      <label className=''>Faculty Name: </label>
                      <select
                        className="faculty-select"
                        value={editSchedule.faculty_name || ""} 
                        placeholder={editSchedule.faculty_name} 
                        onChange={(e) => setEditSchedule({ ...editSchedule, faculty_name: e.target.value })}
                        required
                      >
                        <option value="" disabled>Select a faculty</option>
                        {facultyList.map(faculty => (
                          <option key={faculty.name} value={faculty.username}>
                            {console.log(editSchedule.faculty_name)}
                            {`${faculty.first_name} ${faculty.middle_initial} ${faculty.last_name}`.trim()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className='input-sect user-form'> 
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
                    
                    <div className='input-action reg-div'> 
                      <button type='submit' className="update-btn">
                        Update
                      </button>
                      <button className="cancel-btn" onClick={() => setEditFormVisible(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="subj-table cont">
              <h3 classame="cont-title">{semester}</h3>
              <div className='table-div'>
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
                        <td colSpan={7}>
                          <div>
                            <p className='no-fetch-msg'>No schedules found</p>
                          </div>
                        </td>
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
                                  {/* Edit */}
                                  <i className="fa-solid fa-pen-to-square"></i>
                                </button>
                                <button type="button" className="del-btn" 
                                  onClick={() => showAlertModal('Are you sure you want to delete this schedule?', () => handleDeleteSchedule(schedule))}
                                >
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </td>
                            </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
            </div>
      
            {/* Mobile Schedule Table */}
            <div className="mobile-subj-table cont">
              {schedules.length === 0 ? (
                <div>
                  <p className='no-fetch-msg'>
                    No schedules found
                  </p>
                </div>
              ) : (
                schedules.map((schedule) => (
                  <div key={schedule.id} className="subject-entry">
                    <div className="subject-name">{schedule.subject}</div>
                    <div className="day-time-row">
                      <div>{weekdayMap[schedule.weekdays]}</div>
                      <div>{`${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`}</div>
                    </div>
                    <div className="section-faculty-row">
                      <div>Section: {schedule.section}</div>
                      <div>By: {schedule.faculty}</div>
                    </div>
                    <div className="action-row">
                      <button type="button" className="edit-btn" onClick={() => {
                        handleEditForm(schedule);
                        setSchedFormVisible(false);
                        console.log(schedule.faculty);
                      }}>
                        {/* Edit */}
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button type="button" className="del-btn" onClick={() => handleDeleteSchedule(schedule)}>
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className='end-sem-btn'>
              <button className="end-sem-btn del-btn" 
                onClick={() => showAlertModal('Are you sure you want to end the current semester?', handleEndSemester)}>
                End Semester
              </button>
            </div>
          </>
        )}
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

export default RoomSchedule;
