import React, { useState, useEffect } from 'react';
import './RFIDLogs.css';

function RFIDLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [rfid_code, setRfidCode] = useState('');
  const [availableRFIDs, setAvailableRFIDs] = useState([]);

  useEffect(() => {
    fetchRFIDLogs();
    fetchRFID();
  }, [pagination]);

  const fetchRFID = async () => {
    try {
      const response = await fetch('http://192.168.10.112:8000/get_all_rfid', {
        method: 'GET', // Assuming this is a GET request
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        const fetchedRFIDs = data.map(item => item.rfid_code); // Adjust based on actual data structure
        setAvailableRFIDs(fetchedRFIDs);
      } else {
        console.error('Failed to fetch RFID codes');
      }
    } catch (error) {
      console.error('Error fetching RFID codes:', error);
    }
  };

  const fetchRFIDLogs = async () => {
    try {
      const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : '';
      const formattedEndDate = end_date ? new Date(end_date).toISOString().split('T')[0] : '';

      const response = await fetch('http://192.168.10.112:8000/get_logs_rfid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          rfid_code,
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
    setRfidCode('');
    setPagination(1);
  };

  const sortedLogs = [...logs].sort((a, b) => b.id - a.id);

  return (
    <>
      <div className="filter-controls">
        <select
          value={rfid_code}
          onChange={e => setRfidCode(e.target.value)}
        >
          <option value="">Select RFID</option>
          {availableRFIDs.map(rfid => (
            <option key={rfid} value={rfid}>{rfid}</option>
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
              <th>RFID</th>
              <th>Log Date</th>
              <th>Login</th>
              <th>Logout</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(sortedLogs) && sortedLogs.length > 0 ? (
              sortedLogs.map((log, index) => (
                <tr key={index}>
                  <td className="rfid-code">
                    <div className="flex-cont">
                      <span>{log.rfid_code}</span>
                    </div>
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
                <td colSpan="4">No logs available</td>
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
    </>
  );
}

export default RFIDLogs;
