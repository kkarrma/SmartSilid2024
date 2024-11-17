import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './BASE_URL';
import { useNavigate } from 'react-router-dom';
import './ClassSchedules.css';

function ClassSchedules() {
  const Navigate = useNavigate('');
  const [id, setId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null); // Change to `null` for clarity
  const [dates, setDates] = useState([]);
  const [selecteDate, setSelectedDate] = useState('');
  const [breadcrumb, setBreadcrumb] = useState('');

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
      setSchedules(data.schedule || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchAttendance = async () => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/get_attendance_info`, {
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
      setSchedules(data.schedule || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchAttendance();
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
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date.weekdays);
  };

  const handleBreadcrumbClick = () => {
    setSelectedSchedule(null);
  };

  const formatDay = (dayString) => {
    const days = dayString.split('');
    return days.map(day => weekdayMap[day]).join(', ');
  };

  return (
    <div className='class-schedule'>
      <div className='schedule-row cont'>
        <div onClick={handleBreadcrumbClick} className='breadcrumb'>
          <h3 className='cont-title' style={{ cursor: 'pointer' }}>Schedule List</h3>
        </div>
        {selectedSchedule ? (
          <div className='date-items'>
            {Array.isArray(dates) && dates.length > 0 ? (
              dates.map((date, index) => (
                <div 
                  key={index} 
                  className="date-select-cont" 
                  onClick={() => handleSelectDate(schedule.date)}
                >
                  <div className='date-select-rows date-div-btn'>
                    <div className='date-select'>
                      {formatDay(schedule.date)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className='no-fetch-msg'>No dates were found.</p>
            )}
          </div>
        ) : (
          <div className='schedule-items'>
            {Array.isArray(schedules) && schedules.length > 0 ? (
              schedules.map((schedule, index) => (
                <div 
                  key={index} 
                  className="sched-info-cont" 
                  onClick={() => handleSelectSchedule(schedule)}
                >
                  <div className='sched-info-rows sched-div-btn'>
                    <div className='sched-subj'>
                      {schedule.subject}
                    </div>
                    <div className='sched-day'>
                      <span>{formatDay(schedule.weekdays)}</span>
                    </div>
                    <div className='sched-time'>
                      {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
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
        )}
      </div>
    </div>
  );
}

export default ClassSchedules;
