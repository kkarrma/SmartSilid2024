import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './BASE_URL';
import { useNavigate } from 'react-router-dom';
import './Attendance.css';
import AlertModal from './AlertModal';

function ClassSchedules() {
  const Navigate = useNavigate('');
  const [semester, setSemester] = useState(false);

  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState('');
  const [isSelected, setIsSelected] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  
  const [isCurrentSemester, setIsCurrentSemester] = useState(null);
  const [semesterId, setSemesterId] = useState('');

  const [loading, setLoading] = useState(false);

  // PAST SEMESTER
  const [viewPastSemList, setViewPastSemList] = useState(false);
  const [pastSemList, setPastSemList] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
    
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
      setSemesterId(data.current_semester_id);
      setIsCurrentSemester(true);
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
        setAttendanceData(data.attendance || []);
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

  useEffect(() => {
    console.log('Attendance data:', attendanceData);
  }, [attendanceData]);

  const downloadReport = async (semester_id = null, schedule_id = null, schedule_date = null) => {
    const accessToken = localStorage.getItem('accessToken');
    
    console.log(`SEMESETER ID: ${semester_id}, SCHEDULE ID: ${schedule_id}, SCHEDULE DATE: ${schedule_date}`);
    // Show loading spinner or indicator
    setLoading(true); 

    try {
      var params = ""; 

      if (semester_id != null && schedule_id == null && schedule_date == null) {
        params += `semester_id=${semester_id}`;
        console.log(`11111PARAMASSSSSS: ${params}`);
      }
      
      else if (schedule_id != null && semester_id != null && schedule_date == null) { 
        params = ""
        params += `semester_id=${semester_id}&schedule_id=${schedule_id}`;
        console.log(`222222PARAMASSSSSS: ${params}`);
      }
      
      else if (semester_id != null && schedule_date != null && schedule_date != null) {
        params = ""
        params += `semester_id=${semester_id}&schedule_id=${schedule_id}&schedule_date=${schedule_date}`;
        console.log(`33333PARAMASSSSSS: ${params}`);
      }

      else{
        return showAlertModal('Error in fetching schedule: Please try again.', () => setIsModalOpen(false));
      }

      const response = await fetch(`${API_BASE_URL}/attendance-report/excel?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {  
        await handleTokenRefresh();
        return downloadReport(semester_id, schedule_id, schedule_date);
      }

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'report.xlsx'); // Default filename
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        // Handle unsuccessful responses
        const errorMessage = await response.text();
        console.error('Error downloading report:', errorMessage);
        showAlertModal(`Error downloading report: ${errorMessage}`, () => setIsModalOpen(false));
      }
    } catch (error) {
        // Handle any other errors (network issues, etc.)
        console.error('Download report error:', error);
        showAlertModal(`Download report error: ${error.message}`, () => setIsModalOpen(false));
    } finally {
      setLoading(false);
    }

    setIsModalOpen(false);
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
    setIsCurrentSemester(false);
    setSemesterId(semester.semester_id);
    // fetchSchedules();
  };

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
            <div className='cont-title'>
              <h3>
                <div>Subject: {selectedSchedule.subject}</div>
                <div className='bind-opt-cont'>
                    <a className='bind-btn-opt' 
                        onClick={
                            () => showAlertModal('Are you sure dowload schedule report for ' + selectedSchedule.subject + '?', 
                            () => downloadReport(semesterId, selectedSchedule.id))
                        }
                    >
                        <i className="fa-solid fa-print"></i> {loading ? "Generating..." : <> Download Report</>}
                    </a>
                </div>
              </h3>
            </div>
            <div className='date-items'>
              <div className='back-sched-div'>
                <i style={{ cursor: 'pointer' }} 
                onClick={() => {
                  goBackSchedSelect();
                  setIsSelected(false)
                  setSelectedDate('');
                }} 
                className="fa fa-angle-left"> 
                  Go Back
                </i>
              </div>
              <div className='date-btn-div' style={{ gridTemplateColumns: dates && dates.length === 0 && '1fr'}}>
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
              </div>

              {isSelected && selectedDate && attendanceData ? (
                <div className="attendance-table">
                  <h4 style={{ fontSize: '.8rem', textAlign: 'center', fontWeight: 'normal' }}>Attendance: 
                    &nbsp; <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--bg6)' }}>{selectedDate}</span>
                  </h4>
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
                  <div className='gen-report'>
                  <button 
                    onClick={
                      () => showAlertModal('Are you sure you want to download report for ' + selectedDate + '?', 
                      () => downloadReport(semesterId, selectedSchedule.id, selectedDate))
                    } 
                    disabled={loading}
                  >
                    <i className="fa-solid fa-print"></i> {loading ? "Generating..." : <> Download Attendance Report</>}
                  </button>
                  </div>
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
            <div className='schedule-items past-semester'>
              {Array.isArray(pastSemList) && pastSemList.length > 0 ? (
                pastSemList.map((semester, index) => (
                  <div 
                    key={index} 
                    className="sched-info-cont"
                  >
                    <div
                      className="sched-info-rows sched-div-btn"
                      style={{ gridTemplateColumns: '1fr'}}
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
            </div>
          </>
        ) : (
          <>
            <div className='cont-title'>
              <h3>
                <div>Semester: {semester}</div>
                { semester &&
                  <div className='bind-opt-cont'>
                    <a className='bind-btn-opt' 
                      onClick={
                          () => showAlertModal(`Are you sure you want to dowload semestral report for ${semester}?`, 
                          () => downloadReport(semesterId))
                      }
                    >
                      <i className="fa-solid fa-print"></i> {loading ? "Generating..." : <> Print</>}
                    </a>
                  </div>
                }
              </h3>
            </div>
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

                      <div className='sched-mobile-day-time'>
                        <div className='sched-days'>
                          <span>{formatDay(schedule.weekdays)}</span>
                        </div>
                        <div className='sched-times'>
                          <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                        </div>
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
            
            <div className='sched-list-table'>
              {Array.isArray(schedules) && schedules.length > 0 ? (
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Day</th>
                      <th>Time</th>
                      <th>Section</th>
                      <th>Faculty</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((schedule, index) => (
                      <tr 
                        key={index} 
                        className="schedule-row" 
                        onClick={() => handleSelectSchedule(schedule)}
                      >
                        <td>{schedule.subject}</td>
                        <td>{formatDay(schedule.weekdays)}</td>
                        <td>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</td>
                        <td>{schedule.section}</td>
                        <td>{schedule.faculty}</td>
                        <td className="view-sched-btn">
                          <a>View <i className="fa fa-angle-right"></i></a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              className='past-sem-button'
              onClick={() => {
                fetchPastSemester();
                goBackSchedSelect();
                setIsSelected(false)
                setSelectedDate('');
              }}>
              View Past Semesters
            </button>
          </>
        )}
      </div>
      <AlertModal
          message={modalMessage}
          onConfirm={modalConfirmCallback} 
          onCancel={() => setIsModalOpen(false)}
          isOpen={isModalOpen}
      />
    </div>
  );
}

export default ClassSchedules;

