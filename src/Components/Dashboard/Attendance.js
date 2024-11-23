import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './BASE_URL';
import { useNavigate } from 'react-router-dom';
import './Attendance.css';
import { set } from 'rsuite/esm/internals/utils/date';

function ClassSchedules() {
  const Navigate = useNavigate('');
  const [semester, setSemester] = useState(false);

  const [id, setId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  // PAST SEMESTER
  const [viewPastSemList, setViewPastSemList] = useState(false);
  const [pastSemList, setPastSemList] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [schedulesBySem, setSchedulesBySem] = useState([]);
  const [selectedSchedulesBySem, setSelectedSchedulesBySem] = useState([]);


  const handleTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
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
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchSchedules();
      }
      
      const data = await response.json();
      setSemester(data.current_semester);
      setSchedules(data.schedule || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchAttendance = async (scheduleId) => {
    const accessToken = localStorage.getItem('accessToken');
    console.log(scheduleId);
    try {
      const response = await fetch(`${API_BASE_URL}/get_attendance_info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ schedule_id: scheduleId }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchAttendance(scheduleId);
      }

      const data = await response.json();
      if (response.ok) {
        console.log('Attendance data:', data);
        console.log("response", data.attendance.attendees);
        console.log("attendance", data.attendance);
        setAttendanceData(data.attendance || []);
        console.log("state_attendance", attendanceData)
        console.log("state", attendanceData.attendees); // Access attendanceData.attendees
        setDates(data.date || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };
  
  const fetchPastSemester = async (sem_id) => {
    const accessToken = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(`${API_BASE_URL}/get_past_semesters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchPastSemester();
      }
      
      const data = await response.json();
      if (response.ok) {
        console.log('Past Semester data:', data);
        setPastSemList(data.past_semester || []);
        setViewPastSemList(true);
      }
    } catch (error) {
      console.error('Error fetching past semester:', error);
    }
  };
  
  const fetchSchedBySem = async (sem_id) => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/get_schedule_by_semester`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ semester_id: sem_id }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchSchedBySem(sem_id);
      }

      const data = await response.json();
      if (response.ok) {
        console.log('Schedule By Semester:', data);
        console.log("Selected Schedule" + selectedSchedule);
        setSchedules(data.schedules || []);
        setSemester(data.semester);
        // setDates(data.date || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
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

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setBreadcrumb(schedule.subject);
    fetchAttendance(schedule.id);
    // fetchSchedules();
  };
  
  const handleSelectDate = (date) => {
    setSelectedDate(prevDate => {
      const newSelectedDate = prevDate === date ? '' : date;
      setIsSelected(newSelectedDate !== '');
      const selectedAttendance = attendanceData.find(attendance => attendance.date === newSelectedDate);
      setSelectedAttendance(selectedAttendance || null);
      return newSelectedDate;
    });
    
    for (const attendance of attendanceData) {
      if (attendance.date === date) {
        setSelectedAttendance(attendance);
      }
    }
  };
  const handleSelectSemester = (semester) => {
    setSelectedSchedule(null);
    setViewPastSemList(false);
    setSelectedSemester(semester);
    fetchSchedBySem(semester.semester_id);
    // fetchSchedules();
  };

  // const handleSelectSemDate = (semester) => {
  //   setSelectedSchedule(semester);
  //   setBreadcrumb(semester.subject);
  //   fetchAttendance(semester.id);
  //   // fetchSchedules();
  // };

  const goBackSchedSelect = () => {
    setSelectedSchedule(null);
  };

  const formatDay = (dayString) => {
    const days = dayString.split('');
    return days.map(day => weekdayMap[day]).join(', ');
  };

  return (
    <div className='attendance'>
      <div className='schedule-row cont'>
        {selectedSchedule ? (
          <>
            <h3 className='cont-title'>Subject: {selectedSchedule.subject}</h3>
            <div className='date-items'>
              <div className='back-sched-div'>
                <i style={{ cursor: 'pointer' }} onClick={goBackSchedSelect} className="fa fa-angle-left"> Go Back</i>
              </div>
              {Array.isArray(dates) && dates.length > 0 ? (
                dates.map((date, index) => (
                  <>
                    <div 
                      key={index} 
                      className='date-select-cont'
                    >
                      <div className='date-select-rows'>
                        <div className='date-select'>
                          <span 
                            onClick={() => handleSelectDate(date)} 
                            className={selectedDate === date ? 'selected' : ''}
                          >
                            {date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ))
              ) : (
                <p className='no-fetch-msg'>No dates were found.</p>
              )}

              {isSelected && selectedDate ? (
                <div className="attendance-table">
                  {console.log("DAPAT WALA", attendanceData)}
                  <h4>Attendance for {selectedDate}</h4>
                  <h4> Illusion {selectedDate}</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Log Time</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAttendance.attendees.map((attendee, index) => (
                        <tr key={index}>
                          <td>{attendee.fullname}</td>
                          <td>{attendee.log_time}</td>
                          <td>{attendee.type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  <p className='no-fetch-msg'>Please select a date.</p>
                </>
              )}
            </div>
          </>
        ) :  viewPastSemList ? (
          <>
            <h3 className="cont-title">Past Semesters</h3>
            <i 
              style={{ cursor: "pointer" }} 
              onClick={() => {
                goBackSchedSelect();
                setViewPastSemList(false);
                fetchSchedules();
              }} 
              className="fa fa-angle-left"
            >
              view current semester
            </i>
            {Array.isArray(pastSemList) && pastSemList.length > 0 ? (
              pastSemList.map((semester, index) => (
                <div 
                  key={index} 
                  className="sched-info-cont"
                >
                  <div
                    className="sched-info-rows sched-div-btn"
                    onClick={() => handleSelectSemester(semester)}
                  >
                    <div className="sched-subj">
                      <div className="sched-info">
                        <span>Semester:</span> {semester.semester_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-fetch-msg">No past semesters found.</p>
            )}
          </>
        ) : (
          <>
            <h3 className='cont-title'>{semester}</h3>
            <div className='schedule-items'>
              {Array.isArray(schedules) && schedules.length > 0 ? (
                schedules.map((schedule, index) => (
                  <div 
                    key={index} 
                    className="sched-info-cont" 
                  >
                    <div className='sched-info-rows sched-div-btn'
                      onClick={() => handleSelectSchedule(schedule)}>
                      <div className='sched-subj'>
                        <div className='sched-info'>
                          <span>Subject:</span> {schedule.subject}
                        </div>
                      </div>
                      <div className='sched-day'>
                        <span>{formatDay(schedule.weekdays)}</span>
                      </div>
                      <div className='sched-time'>
                        <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                      </div>
                      <div className='sched-sec'>
                        <div className='sched-info'>
                          <span>Section:</span> {schedule.section}
                        </div>
                      </div>
                      <div className='sched-fac'>
                        <div className='sched-info'>
                          <span>Faculty:</span> {schedule.faculty}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className='no-fetch-msg'>No schedules found.</p>
              )}
            </div>
          </>
        )}
      </div>
      
      <div className='view-past-sem-div'>
        {viewPastSemList ? (
          <>
          </>
        ) : (
          <>
            <button 
              onClick={() => {
                fetchPastSemester();
                goBackSchedSelect();
              }}>
              View Past Semesters
            </button>
          </>
        )}
      </div>

    </div>
  );
}

export default ClassSchedules;

