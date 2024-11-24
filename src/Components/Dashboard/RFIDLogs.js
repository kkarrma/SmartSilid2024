import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './BASE_URL';
import './Logbook.css';
import { useNavigate } from 'react-router-dom';

function RFIDLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [start_time, setStartTime] = useState(''); // New start time state
  const [facultyName, setFacultyName] = useState('');
  const [type, setType] = useState(''); // New type filter state
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [availableSections, setAvailableSection] = useState([]);
  const Navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmCallback, setModalConfirmCallback] = useState(null);
  const showAlertModal = (message, onConfirm) => {
    setModalMessage(message);
    setModalConfirmCallback(() => onConfirm);
    setIsModalOpen(true); 
  };

  useEffect(() => {
    fetchRFIDLogs();
    fetchSection();
  }, [pagination]);

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

  const fetchSection = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_sections`, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`    
        },
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchSection();
      }

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        const fetchedSections = data.map(item => item.section);
        setAvailableSection(fetchedSections);
      } else {
        console.error('Failed to fetch sections');
      }
    } catch (error) {
      console.log('Error fetching sections:', error);
    }
  };

  const fetchRFIDLogs = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : ''; // Ensure date is formatted
      const response = await fetch(`${API_BASE_URL}/get_logs_rfid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          username: facultyName,
          subject,
          section,
          start_date: formattedStartDate,
          end_date,
          pagination,
          type
        }),
      });
      
      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchRFIDLogs();
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched logs:', data);
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setTotalPages(data.pagination_length);
      } else {
        console.error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleFilter = () => {
    setPagination(1);
    fetchRFIDLogs();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStartTime(''); 
    setFacultyName('');
    setSubject('');
    setSection('');
    setType(''); // Reset type filter
    setPagination(1);
  };

  const sortedLogs = [...logs].sort((a, b) => b.id - a.id);

  return (
    <>
      <div className='logbook'>
        <div className="filter-controls cont">
          <h3 className="cont-title">Filter Controls</h3>
          <div className='start-date-filter filter-cont'>
            <label className='start-date-input'>Start Date: </label>
            <input
              type="date"
              value={start_date}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className='type-filter filter-cont'>
            <label className='type-label'>Type: </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className='end-date-filter filter-cont'>
            <label className='end-date-input'>End Date: </label>
            <input
              type="date"
              value={end_date}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <div className='faculty-filter filter-cont'>
            <label className='faculty-name'>Name: </label>
            <input
              type="text"
              placeholder="Name"
              value={facultyName}
              onChange={e => setFacultyName(e.target.value)}
            />
          </div>

          <div className='filter-btn'>
            <button type="button" className='act-btn' onClick={handleFilter}>Filter</button>
            <button type="button" className='act-btn' onClick={handleClearFilters}>Clear</button>
          </div>
        </div>

        <div className="log-table cont">
          <div className='log-table-cont'>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Scan Date</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              
              <tbody>
                {Array.isArray(sortedLogs) && sortedLogs.length > 0 ? (
                  sortedLogs.map((log, index) => (
                    <tr key={index}>
                      <td className="faculty-name">{log.username}</td>
                      <td className="log-type">{log.type}</td> 
                      <td className="log-date">{log.date}</td>
                      <td className="log-in">{log.start_time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className='no-fetch-msg'>No logs available.</td> {/* Adjusted colspan */}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-controls">
            <button 
              onClick={() => setPagination(1)} 
              disabled={pagination === 1}
              className='first-btn page-btn'
            >
              First
            </button>
            <button 
              onClick={() => setPagination(prev => Math.max(prev - 1, 1))} 
              disabled={pagination === 1}
              className='prev-btn page-btn'
            >
              <i className="fa-solid fa-angle-left"></i>
            </button>
            <span>{pagination} of {totalPages}</span>
            <button 
              onClick={() => setPagination(prev => Math.min(prev + 1, totalPages))} 
              disabled={pagination === totalPages}
              className='next-btn page-btn'
            >
              <i className="fa-solid fa-angle-right"></i>
            </button>
            <button 
              onClick={() => setPagination(totalPages)} 
              disabled={pagination === totalPages}
              className='last-btn page-btn'
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default RFIDLogs;
