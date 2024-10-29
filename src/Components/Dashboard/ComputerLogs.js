import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import './Logbook.css';

function ComputerLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [username, setUsername] = useState('');
  const [computer_name, setComputerName] = useState('');
  const [availableComputers, setAvailableComputers] = useState([]);

  useEffect(() => {
    fetchComputerLogs();
    fetchComputers();
  }, [pagination]);

  const fetchComputers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_computers`);
      if (response.ok) {
        const data = await response.json();
        const fetchedPCs = data.computers.map(pc => pc.computer_name);
        setAvailableComputers(fetchedPCs);
      } else {
        console.error('Failed to fetch computers');
      }
    } catch (error) {
      console.error('Error fetching computers:', error);
    }
  };

  const fetchComputerLogs = async () => {
    try {
      const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : '';
      const formattedEndDate = end_date ? new Date(end_date).toISOString().split('T')[0] : '';

      const response = await fetch(`${API_BASE_URL}/get_logs_computer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          username,
          computer_name,
          pagination
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched logs:', data);
        console.log('Pagination length:', data.pagination_length); // Log the pagination_length
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setTotalPages(data.pagination_length); // Set totalPages based on the API response
      } else {
        console.error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleFilter = () => {
    setPagination(1);
    fetchComputerLogs();
    // fetchFacultyLogs();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setUsername('');
    setComputerName('');
    setPagination(1);
  };

  // Sort logs by id in descending order
  const sortedLogs = [...logs].sort((a, b) => b.id - a.id);

  return (
    <>
      <div className='logbook'>
        <div className="filter-controls cont">
          <div className='username-filter'>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className='computer-filter'>
            <select
              value={computer_name}
              onChange={e => setComputerName(e.target.value)}
            >
              <option value="">Select Computer</option>
              {availableComputers.map(computer => (
                <option key={computer} value={computer}>{computer}</option>
              ))}
            </select>
          </div>
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
                <th>PC Name</th>
                <th>Username</th>
                <th>Log Date</th>
                <th>Login</th>
                <th>Logout</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(sortedLogs) && sortedLogs.length > 0 ? (
                sortedLogs.map((log, index) => (
                  <tr key={index}>
                    <td className="pc-name">{log.computer_name}</td>
                    <td className="name">
                      <span>{log.username}</span>
                    </td>
                    <td className="log-date">
                      <div className="flex-cont">
                        <span>{log.date}</span>
                      </div>
                    </td>
                    <td className="log-in">
                      <div className="flex-cont">
                        <span>{log.logon}</span>
                      </div>
                    </td>
                    <td className="log-out">
                      <div className="flex-cont">
                        <span>{log.logoff}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No logs available</td>
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
            <i class="fa-solid fa-angle-left"></i>
          </button>
          <span>{pagination} of {totalPages}</span>
          <button 
            onClick={() => setPagination(prev => Math.min(prev + 1, totalPages))} 
            disabled={pagination === totalPages}
            className='next-btn page-btn'
          >
            <i class="fa-solid fa-angle-right"></i>
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

export default ComputerLogs;
