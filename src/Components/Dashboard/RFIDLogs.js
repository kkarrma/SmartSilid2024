import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import './Logbook.css';

function RFIDLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [start_time, setStartTime] = useState(''); // New start time state
  const [facultyName, setFacultyName] = useState('');
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [availableSections, setAvailableSection] = useState([]);

  useEffect(() => {
    fetchRFIDLogs();
    fetchSection();
  }, [pagination]);

  const fetchSection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify ({ section })
      });
      if (response.ok) {
        const data = await response.json();
        const fetchedSections = data.map(item => item.section);
        setAvailableSection(fetchedSections);
      } else {
        console.error('Failed to fetch sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchRFIDLogs = async () => {
    try {
      const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : ''; // Ensure date is formatted
      const response = await fetch(`${API_BASE_URL}/get_logs_rfid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          faculty_name: facultyName,
          subject,
          section,
          start_date: formattedStartDate,
          end_date,
          pagination,
        }),
      });
  
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
    setPagination(1);
  };

  const sortedLogs = [...logs].sort((a, b) => b.id - a.id);

  return (
    <>
      <div className='logbook'>
        <div className="filter-controls cont">
          <div className='start-date-filter'>
            <label className='start-date-input'>Start Date: </label>
            <input
              type="date"
              value={start_date}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className='end-date-filter'>
            <label className='end-date-input'>End Date: </label>
            <input
              type="date"
              value={end_date}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <div className='faculty-filter'>
            <input
              type="text"
              placeholder="Faculty Name"
              value={facultyName}
              onChange={e => setFacultyName(e.target.value)}
            />
          </div>
          <div className='subject-filter'>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            />
          </div>
          <div className='section-filter'>
            <select
              value={section}
              onChange={e => setSection(e.target.value)}
              >
              <option value="">Select Section</option>
              {availableSections.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          <button type="button" className='act-btn' onClick={handleFilter}>Filter</button>
          <button type="button" className='act-btn' onClick={handleClearFilters}>Clear</button>
          <div className='action-filter'>
            <button type="button" onClick={handleFilter}>Filter</button>
            <button type="button" onClick={handleClearFilters}>Clear</button>
          </div>
        </div>

        <div className="log-table cont">
          <table>
            <thead>
              <tr>
                <th>Faculty Name</th>
                <th>Attempt</th>
                <th>Subject</th>
                <th>Section</th>
                <th>Log Date</th>
                <th>Login</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(sortedLogs) && sortedLogs.length > 0 ? (
                sortedLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="faculty-name">{log.faculty_name}</td>
                    <td className="attempt">{log.attempt}</td>
                    <td className="subject">{log.subject}</td>
                    <td className="section">{log.section}</td>
                    <td className="log-date">{log.date}</td>
                    <td className="log-in">{log.start_time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No logs available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-controls cont">
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
    </>
  );
}

export default RFIDLogs;
