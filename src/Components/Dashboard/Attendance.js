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
    const [isViewSummary, setIsViewSummary] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    
    const [isCurrentSemester, setIsCurrentSemester] = useState(null);
    const [semesterId, setSemesterId] = useState('');

    const [loading, setLoading] = useState(false);

    // PAST SEMESTER
    const [viewPastSemList, setViewPastSemList] = useState(false);
    const [pastSemList, setPastSemList] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState('');
    const [sortBy, setSortBy] = useState('asc_by_name');
      
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
        return 0;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
          console.error('Failed to refresh token. Status:', response.status);
          return 0;
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        return 1; 
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
          const failedRefresh = await handleTokenRefresh();

          if ( failedRefresh === 0){
            Navigate("/");
            window.location.reload();
          }
          else {
            return fetchSchedules();
          }
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

    const fetchAttendance = async (scheduleId, sortBy = "asc_by_name") => {
      setLoading(true);
      var selectedAttendanceId = 0; 
      if (selectedAttendance != null) {
        selectedAttendanceId = selectedAttendance.date_id;
      }

      setSelectedAttendance(null)

      const accessToken = localStorage.getItem('accessToken');
      try {
        const response = await fetch(`${API_BASE_URL}/get_attendance_info`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ 
            schedule_id: scheduleId,
            sort_by: sortBy 
          }),
        });

        if (response.status === 401) {
          const failedRefresh = await handleTokenRefresh();

          if ( failedRefresh === 0){
            Navigate("/");
            window.location.reload();
          }
          else {
            return fetchAttendance(scheduleId, sortBy);
          }
        }

        const data = await response.json();
        if (response.ok) {
          setAttendanceData(data.attendance || []);
          setDates(data.date || []);

          if (selectedAttendanceId != 0){
            const selectedAttendance_local = data.attendance.find(attendance => attendance.date_id === selectedAttendanceId);
            setSelectedAttendance(selectedAttendance_local);
            console.log(selectedAttendance);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.log('Error fetching attendance:', error);
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
          const failedRefresh = await handleTokenRefresh();

          if ( failedRefresh === 0){
            Navigate("/");
            window.location.reload();
          }
          else {
            return fetchPastSemester();
          }
        }
        
        const data = await response.json();
        if (response.ok) {
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
          const failedRefresh = await handleTokenRefresh();

          if ( failedRefresh === 0){
            Navigate("/");
            window.location.reload();
          }
          else {
            return fetchSchedBySem(sem_id);
          }
        }

        const data = await response.json();
        if (response.ok) {
          setSchedules(data.schedules || []);
          setSemester(data.semester);
          // setDates(data.date || []);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };

    useEffect(() => {

      const type = localStorage.getItem('type');

      if (type === 'faculty'){
        fetchScheduleByFaculty(); 
      }
      else if (type === 'admin'){
        fetchSchedules();
      }

    }, []);

    useEffect(() => {
      console.log('Attendance data:', attendanceSummary);
    }, [attendanceSummary]);

    const downloadReport = async (semester_id = null, schedule_id = null, schedule_date = null) => {
      const accessToken = localStorage.getItem('accessToken');
      
      //console.log(`SEMESETER ID: ${semester_id}, SCHEDULE ID: ${schedule_id}, SCHEDULE DATE: ${schedule_date}`);
      // Show loading spinner or indicator
      setLoading(true); 

      try {
        var params = ""; 

        if (semester_id == null && schedule_id == null && schedule_date == null) {
          return showAlertModal('Error in fetching schedule: Please try again.', () => setIsModalOpen(false));
        }

        if (semester_id != null && schedule_id == null && schedule_date == null) {
          params += `semester_id=${semester_id}`;
          //console.log(`11111PARAMASSSSSS: ${params}`);
        }
        
        else if (schedule_id != null && semester_id != null && schedule_date == null) { 
          params = ""
          params += `semester_id=${semester_id}&schedule_id=${schedule_id}`;
          //console.log(`222222PARAMASSSSSS: ${params}`);
        }
        
        else if (semester_id != null && schedule_date != null && schedule_date != null) {
          params = ""
          params += `semester_id=${semester_id}&schedule_id=${schedule_id}&schedule_date=${schedule_date}`;
          // console.log(`33333PARAMASSSSSS: ${params}`);
        }

        else{
          return showAlertModal('Error in fetching schedule: Please try again.', () => setIsModalOpen(false));
        }

        const response = await fetch(`${API_BASE_URL}/attendance-report/excel?${params}&sort_by=${sortBy}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {  
          const failedRefresh = await handleTokenRefresh();

          if ( failedRefresh === 0){
            Navigate("/");
            window.location.reload();
          }
          else {
            return downloadReport(semester_id, schedule_id, schedule_date);
          }
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
    };

    const downloadSummaryReport = async (schedId) => {
      const accessToken = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${API_BASE_URL}/cumulative-report/excel?schedule_id=${schedId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {  
          const failedRefresh = await handleTokenRefresh();

          if ( failedRefresh === 0){
            Navigate("/");
            window.location.reload();
          }
          else {
            return downloadSummaryReport(schedId);
          }
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
      }
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
      const timeStringStr = String(timeString);
      const [hours, minutes] = timeStringStr.split(':');
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
        const selectedAttendance = attendanceData.find(
          (attendance) => attendance.date === newSelectedDate);
        setSelectedAttendance(selectedAttendance || null);
        setIsViewSummary(false);

        return newSelectedDate;
      });

      for (const attendance of attendanceData) {
        if (attendance.date === date) {
          setSelectedAttendance(attendance);
        }
      }
    };

    const handleAttendanceSummary = (schedId) => {
      setIsViewSummary(prevIsViewSummary => !prevIsViewSummary);  
      setIsViewSummary(true);
      if (isViewSummary) {
        setIsViewSummary(false);
      }
      fetchCumulativeReport(schedId);
    }


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


    const fetchScheduleByFaculty = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const facultyId = localStorage.getItem('id');

      try {
        const response = await fetch(`${API_BASE_URL}/get_schedules_by_faculty_id`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            faculty_id: facultyId,
          }),
        });

        if (response.status === 401) {
          const failedRefresh = await handleTokenRefresh();

          if ( failedRefresh === 0){
            Navigate("/");
            window.location.reload();
          }
          else {
            return fetchScheduleByFaculty();
          }
        }
        
        const data = await response.json();
        //console.log("data", data);
        setSemester(data.current_semester);
        setSchedules(data.schedules || []);
        setSemesterId(data.current_semester_id);
        setIsCurrentSemester(true);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    const fetchCumulativeReport = async (schedule_id) => {
      const accessToken = localStorage.getItem('accessToken');

      try {
        const response = await fetch(`${API_BASE_URL}/get_cumulative_attendance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            schedule_id: schedule_id,
          }),
        });

        if (response.status === 401) {
          const failedRefresh = await handleTokenRefresh();

          if ( failedRefresh === 0){
            Navigate("/");
            window.location.reload();
          }
          else {
            return fetchCumulativeReport();
          }
        }
        
        const data = await response.json();
        setAttendanceSummary(data);      
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    return (
      <div className='attendance'>
        <div className='schedule-row cont'>
          {selectedSchedule ? (
            <>
              <div className='cont-title'>
                <h3>
                  <div
                    style={{ cursor: 'pointer' }}
                      onClick={
                        () => showAlertModal('Are you sure dowload schedule report for ' + selectedSchedule.subject + '?', 
                        () => {
                          setIsModalOpen(false)
                          downloadReport(semesterId, selectedSchedule.id)
                        })
                      }
                  >
                    Subject: {selectedSchedule.subject}
                  </div>
                  <div className='bind-opt-cont'>
                      <a className='bind-btn-opt' 
                        style={{ border: '0 solid #ccc' }}
                          onClick={
                            () => showAlertModal('Are you sure dowload schedule report for ' + selectedSchedule.subject + '?', 
                            () => {
                              setIsModalOpen(false)
                              downloadReport(semesterId, selectedSchedule.id)
                            })
                          }
                      >
                          <i className="fa-solid fa-print"></i> {loading && <i className="fa fa-spinner fa-spin"></i>}
                      </a>
                  </div>
                </h3>
              </div>
              <div className='date-items'>
                <div className='back-sched-div'>
                  <div 
                    className='nav-sched-btn'
                    style={{ cursor: 'pointer' }} 
                    onClick={() => {
                      setIsSelected(false);
                      setIsViewSummary(false);
                      setSelectedDate('');
                      goBackSchedSelect();
                    }} 
                    > 
                    <i className="fa fa-angle-left"></i>
                    &nbsp; Go Back
                  </div>
                  <div
                    className='nav-sched-btn'
                    style={{ cursor: 'pointer' }} 
                    onClick={() => {
                      handleAttendanceSummary(selectedSchedule.id);
                      setIsSelected(false);
                      setSelectedDate('');
                    }}                   
                  > 
                    View Summary &nbsp; <i className={`fa ${isViewSummary ? 'fa-angle-down' : 'fa-angle-right'}`}></i>
                  </div>
                </div>
                <div 
                  className='date-btn-div' 
                  style={{ 
                    gridTemplateColumns: dates && dates.length === 0 ? '1fr' : undefined, 
                    display: isViewSummary ? 'none' : undefined 
                  }}
                >
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
                    <>
                      <p className='no-fetch-msg'>No dates were found.</p>
                    </>
                  )}
                </div>

                {isSelected && selectedDate && attendanceData ? (
                  <>
                    <div className='three-div-header'>
                      <div></div>  
                      <div>
                        <h4 style={{ fontSize: '.8rem', textAlign: 'center', fontWeight: 'normal' }}>Attendance: 
                          &nbsp; <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--bg6)' }}>{selectedDate}</span>
                        </h4>
                      </div>  
                      <div>
                        <select 
                          onChange={(e) => {
                            fetchAttendance(selectedSchedule.id, e.target.value)
                            console.log(e.target.value);
                            setSortBy(e.target.value)
                          }}
                        >
                          <option value="asc_by_name">Alphabetical (Ascending)</option>
                          <option value="desc_by_name">Alphabetical (Descending)</option>
                          <option value="asc_by_time">Time (Ascending)</option>
                          <option value="desc_by_time">Time (Descending)</option>
                        
                        </select>  
                      </div>  
                    </div>
                    <div className="attendance-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Log Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loading === true && selectedAttendance ===null ? <tr><td colSpan="2">Loading...</td></tr> : selectedAttendance.attendees.map((attendee, index) => (
                            <tr key={index}>
                              <td>{attendee.fullname}</td>
                              <td>
                                <span
                                  className="log-time-span" 
                                  style={{
                                    backgroundColor: attendee.attendance_position === 'absent' ? "var(--del-btn)" :
                                                    attendee.attendance_position === 'late' ? "var(--bg4)" :
                                                    "var(--txt3)",
                                  }}
                                >
                                  {attendee.log_time ? formatTime(attendee.log_time) : '- -'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className='gen-report'>
                      <button 
                        onClick={
                          () => showAlertModal('Are you sure you want to download report for ' + selectedDate + '?', 
                          () => { 
                            setIsModalOpen(false)
                            downloadReport(semesterId, selectedSchedule.id, selectedDate)
                          })
                        } 
                        disabled={loading}
                      >
                        <i className="fa-solid fa-print"></i> {loading ? <i className="fa fa-spinner fa-spin"></i> : 'Download Attendance Report'}
                      </button>
                    </div>
                  </>
                ) : isViewSummary && attendanceSummary && attendanceSummary.attendees.length > 0 ? (
                  <>
                    <h4 style={{ fontSize: '.8rem', textAlign: 'center', fontWeight: 'normal' }}>Attendance: 
                      &nbsp; <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--bg6)' }}>Cumulative Report</span>
                    </h4>
                    
                    <div className="attendance-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            {Array.isArray(dates) && dates.length > 0 && (
                              dates.map((date, index) => (
                                <th key={index}>{date}</th>
                              ))
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceSummary.attendees.map((attendee, index) => (
                            <tr key={index}>
                              <td>{attendee.fullname}</td>
                              {Array.isArray(dates) && dates.length > 0 && (
                                dates.map((date, index) => (
                                  <td>
                                    {attendee.absents.includes(date) ? (
                                      <span style={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        backgroundColor: "var(--del-btn)",
                                        padding: '2px 20px',
                                        borderRadius: '20px'
                                      }}>
                                        Absent
                                      </span>
                                    ) : attendee.lates.includes(date) ? (
                                      <span style={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        backgroundColor: "var(--bg4)",
                                        padding: '2px 20px',
                                        borderRadius: '20px'
                                      }}>
                                        Late
                                      </span>
                                    ) : (
                                      <span style={{
                                        color: 'white',
                                        fontWeight: 'bold',
                                        backgroundColor: "var(--txt3)",
                                        padding: '2px 20px',
                                        borderRadius: '20px'
                                      }}>
                                        Present
                                      </span>
                                    )}
                                  </td>
                                ))
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <br/>
                      
                    <h4 style={{ fontSize: '.8rem', textAlign: 'center', fontWeight: 'normal' }}>No. of Days: 
                      &nbsp; <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--bg6)' }}>{attendanceSummary.number_classes}</span>
                    </h4>

                    <div className="attendance-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Present</th>
                            <th>Late</th>
                            <th>Absent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceSummary.attendees.map((attendee, index) => (
                            <tr key={index}>
                              <td>{attendee.fullname}</td>
                              <td>{attendee.number_presents}</td>
                              <td>{attendee.number_lates}</td>  
                              <td>{attendee.number_absents}</td>  
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className='gen-report'>
                      <button 
                        onClick={
                          () => showAlertModal('Are you sure you want to download summary report for ' + selectedSchedule + '?', 
                          () => { 
                            setIsModalOpen(false)
                            downloadSummaryReport(selectedSchedule.id)
                          })
                        } 
                        disabled={loading}
                      >
                        <i className="fa-solid fa-print"></i> {loading ? <i className="fa fa-spinner fa-spin"></i> : 'Download Summary Report'}
                      </button>
                    </div>
                  </>
                ) : (
                  <> 
                  {Array.isArray(dates) && dates.length > 0 && (
                    <>
                      <p className='no-fetch-msg'>Please select a schedule.</p>
                    </>
                  )}
                  </>
                )}
              </div>
            </>
          ) : viewPastSemList ? (
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
                  { localStorage.getItem('type') === 'admin' ? (
                    <div
                      style={{ cursor: 'pointer' }}
                      onClick={() => 
                        showAlertModal(
                          `Are you sure you want to download the semestral report for ${semester.semester_name}?`, 
                          () => {
                            setIsModalOpen(false)
                            downloadReport(semesterId)
                          }
                        )
                      }
                      >
                      Semester: {semester}
                    </div>
                  ) : (
                    <div>Semester: {semester}</div>
                  )}
                  { semester && localStorage.getItem('type') === 'admin' ? (
                    <div className='bind-opt-cont'>
                      <a className='bind-btn-opt' 
                        style={{ border: '0 solid var(--btn)', cursor: 'pointer' }}
                        onClick={
                          () => showAlertModal(`Are you sure you want to download semestral report for ${semester}?`, 
                            () => {
                              setIsModalOpen(false)
                              downloadReport(semesterId)
                          })
                        }
                      >
                        <i className="fa-solid fa-print"></i> {loading && <i className="fa fa-spinner fa-spin"></i>}
                      </a>
                    </div>
                  ) : (
                    <></>
                  )}
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
            {localStorage.getItem('type') === 'admin' && (
              <button 
                className='past-sem-button'
                onClick={() => {
                  fetchPastSemester();
                  goBackSchedSelect();
                  setIsSelected(false)
                  setIsViewSummary(false);
                  setSelectedDate('');
                }}>
                View Past Semesters
              </button>
            )}
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

