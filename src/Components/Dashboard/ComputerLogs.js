import React, { useState, useEffect } from 'react';
import './ComputerLogs.css';

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
    fetchStudentLogs();
    // fetchFacultyLogs();
    fetchComputers();
  }, [pagination]);

  const fetchComputers = async () => {
    try {
      const response = await fetch('http://192.168.10.112:8000/get_all_computers');
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

  const fetchStudentLogs = async () => {
    try {
      const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : '';
      const formattedEndDate = end_date ? new Date(end_date).toISOString().split('T')[0] : '';

      const response = await fetch('http://192.168.10.112:8000/get_logs_student', {
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

  // const fetchFacultyLogs = async () => {
  //   try {
  //     const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : '';
  //     const formattedEndDate = end_date ? new Date(end_date).toISOString().split('T')[0] : '';

  //     const response = await fetch('http://192.168.10.112:8000/get_logs_faculty', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         start_date: formattedStartDate,
  //         end_date: formattedEndDate,
  //         username,
  //         computer_name,
  //         pagination,
  //       }),
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log('Fetched logs:', data);
  //       console.log('Pagination length:', data.pagination_length); // Log the pagination_length
  //       setLogs(Array.isArray(data.logs) ? data.logs : []);
  //       setTotalPages(data.pagination_length); // Set totalPages based on the API response
  //     } else {
  //       console.error('Failed to fetch logs');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching logs:', error);
  //   }
  // };

  const handleFilter = () => {
    setPagination(1);
    fetchStudentLogs();
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
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <select
          value={computer_name}
          onChange={e => setComputerName(e.target.value)}
        >
          <option value="">Select Computer</option>
          {availableComputers.map(computer => (
            <option key={computer} value={computer}>{computer}</option>
          ))}
        </select>
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
        <button type="button" onClick={handleFilter}>Filter</button>
        <button type="button" onClick={handleClearFilters}>Clear</button>
      </div>

      <div className="log-table">
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
          <i class="fa-solid fa-angle-left"></i>
        </button>
        <span>{pagination} of {totalPages}</span>
        <button 
          onClick={() => setPagination(prev => Math.min(prev + 1, totalPages))} 
          disabled={pagination === totalPages}
        >
          <i class="fa-solid fa-angle-right"></i>
        </button>
        <button 
          onClick={() => setPagination(totalPages)} 
          disabled={pagination === totalPages}
        >
          Last
        </button>
      </div>
    </>
  );
}

export default ComputerLogs;
