import React, { useState, useEffect } from 'react';
import './RFIDLogs.css';

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
      const response = await fetch('http://192.168.10.112:8000/get_all_sections', {
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
      const response = await fetch('http://192.168.10.112:8000/get_logs_rfid', {
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
      <div className='rfid-logs'>
        <div className="filter-controls">
          <input
            type="date"
            value={start_date}
            onChange={e => setStartDate(e.target.value)}
          />
          <input
            type="date"
            value={end_date}
            onChange={e => setEndDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="Faculty Name"
            value={facultyName}
            onChange={e => setFacultyName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
          <select
            value={section}
            onChange={e => setSection(e.target.value)}
          >
            <option value="">Select Section</option>
            {availableSections.map(section => (
              <option key={section} value={section}>{section}</option>
            ))}
          </select>
          <button type="button" onClick={handleFilter}>Filter</button>
          <button type="button" onClick={handleClearFilters}>Clear</button>
        </div>

        <div className="log-table">
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

        <div className="pagination-controls">
          <button 
            onClick={() => setPagination(1)} 
            disabled={pagination === 1}
          >
            First
          </button>
          <button 
            onClick={() => setPagination(prev => Math.max(prev - 1, 1))} 
            disabled={pagination === 1}
          >
            <i className="fa-solid fa-angle-left"></i>
          </button>
          <span>{pagination} of {totalPages}</span>
          <button 
            onClick={() => setPagination(prev => Math.min(prev + 1, totalPages))} 
            disabled={pagination === totalPages}
          >
            <i className="fa-solid fa-angle-right"></i>
          </button>
          <button 
            onClick={() => setPagination(totalPages)} 
            disabled={pagination === totalPages}
          >
            Last
          </button>
        </div>
      </div>
    </>
  );
}

export default RFIDLogs;
