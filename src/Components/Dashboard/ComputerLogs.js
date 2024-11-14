import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './BASE_URL';
import './Logbook.css';
import { useNavigate } from 'react-router-dom';

function ComputerLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(1);
  const [totalPages, setTotalPages] = useState(1); 
  const [start_date, setStartDate] = useState('');
  const [end_date, setEndDate] = useState('');
  const [type, setType] = useState('faculty' | '');
  const [username, setUsername] = useState('');
  const [computer_name, setComputerName] = useState('');
  
  const [availableComputers, setAvailableComputers] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);

  const [selectedSection, setSelectedSection] = useState('');
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(false);
  const Navigate = useNavigate();


  useEffect(() => {
    fetchComputerLogs();
    fetchComputers();
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
  
  const fetchComputers = async () => { 
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/get_all_computers`, {
        headers: { Authorization: `Bearer ${accessToken}`, }
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchComputers();
      }
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
    const accessToken = localStorage.getItem('accessToken');
    try {
      const formattedStartDate = start_date ? new Date(start_date).toISOString().split('T')[0] : '';
      const formattedEndDate = end_date ? new Date(end_date).toISOString().split('T')[0] : '';

      const response = await fetch(`${API_BASE_URL}/get_logs_computer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          username,
          computer_name,
          pagination,
          type: type,
          section: selectedSection,
        })
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchComputerLogs();
      }

      const data = await response.json();
      console.log('Fetched logs:', data);
      console.log('Pagination length:', data.pagination_length); // Log the pagination_length
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setTotalPages(data.pagination_length); // Set totalPages based on the API response
      
      const fetchedSections = data.computers.map(section => section.name);
      setAvailableSections(fetchedSections);

      // if (response.ok) {
      //   
      // } else {
      //   console.error('Failed to fetch logs');
      //   console.log(response.status); 
      // }
    } catch (error) {
      
      console.error('Error fetching logs:', error);
    }
  };

  const downloadFile = (url, filename) => {
    setLoading(true);
    const accessToken = localStorage.getItem('accessToken');
    fetch(url, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    })
        .then((reponse) => {
            if(!reponse.ok) {
                throw new Error('Network response was not ok. Failed to generate report');
            }
            return reponse.blob();
        })
        .then((blob) => {
            const fileUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = fileUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setLoading(false);
        })
        .catch((error) => {
            console.error('Error downloading file:', error);
            alert(`An error occurred: ${error.message}`);
        })
        .finally(() => {
            setLoading(false)
        });
};
// const handleGenerateStudentReportExcel = () => {
//     const period = document.getElementById('periodSelect').value;
//     downloadFile(`${API_BASE_URL}student-report/excel?period=${period}`, "smartsilid_student_report.xlsx");
// };
// Function to generate Student Report (PDF)
      const handleGenerateStudentReportPDF = () => {
          const queryParams = new URLSearchParams({
              start_date: start_date,
              end_date: end_date,
              section: selectedSection,
          }).toString();
          downloadFile(`${API_BASE_URL}student-report/pdf?${queryParams}`, "smartsilid_student_report.pdf");
      };
    const handleGenerateFacultyReportPDF = () => {
        const queryParams = new URLSearchParams({
            start_date: start_date,
            end_date: end_date,
        }).toString();
        downloadFile(`${API_BASE_URL}faculty-report/pdf?${queryParams}`, "smartsilid_faculty_report.pdf");
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
    setType('');
    setSections('');

  };

  // Sort logs by id in descending order
  const sortedLogs = [...logs].sort((a, b) => b.id - a.id);


  return (
    <>
      {/* <div className='gen-report'>
        <button 
          onClick={handleGenerateFacultyReportPDF} 
          disabled={loading}
        >
          {loading ? "Generating..." : <><i class="fa-solid fa-print"></i> Download Faculty Report"</>}
        </button>
        <button 
          onClick={handleGenerateStudentReportPDF} 
          disabled={loading}
          className='pdf-btn'
        >
          {loading ? "Generating..." : <><i class="fa-solid fa-print"></i> Download Section Report</>}
        </button>
      </div> */}
      <div className='logbook'>
        <div className="filter-controls cont">
          <h3 classame="cont-title">Filter Controls</h3>
          <div className='username-filter filter-cont'>
            <label className='start-date-input'>Username: </label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div className='computer-filter filter-cont'>
            <label className='start-date-input'>Computer: </label>
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
          <div className='start-date-filter filter-cont'>
            <label className='start-date-input'>Start Date: </label>
            <input
              type="date"
              value={start_date}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className='end-date-filter filter-cont'>
            <label className='end-date-input'>End Date: </label>
            <input
              type="date"
              value={end_date}
              onChange={e => setEndDate(e.target.value)}
            />
          </div>
          <div className='type-filter filter-cont'>
            <label for="section">User Type: </label>
            <select
              type="text"
              placeholder='User Type'
              value={type}
              onChange={e => setType(e.target.value)}
            >
              <option value="" >Select User Type</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>
          </div>
          {type === 'student' && (
            <div className='section-filter filter-cont'>
              <label for="section">Section: </label>
              <select
                type="text"
                placeholder="Section"
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
              >
                <option value="">Select Section</option>
                {availableSections.map(sectionName => (
                  <option key={sectionName} value={sectionName}>{sectionName}</option>
                ))}
              </select>
            </div>
          )}
          <div className='filter-btn'>
            <button type="button" className='act-btn' onClick={handleFilter}>Filter</button>
            <button type="button" className='act-btn' onClick={handleClearFilters}>Clear</button>
          </div>
          
          {/* <div className='action-filter'>
            <button type="button" onClick={handleFilter}>Filter</button>
            <button type="button" onClick={handleClearFilters}>Clear</button>
          </div> */}
        </div>

        <div className="log-table cont">
          {/* <h3 classame="cont-title">Computer List</h3> */}
          <div className='log-table-cont'>
            <table>
              <thead>
                <tr>
                  <th>PC Name</th>
                  <th>Username</th>
                  <th>Section</th>
                  <th>Log Date</th>
                  <th>Login</th>
                  <th>Logout</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(sortedLogs) && sortedLogs.length > 0 ? (
                  sortedLogs.map((log, index) => (
                    <tr key={index}>
                      <td className="pc-name">
                        <span>{log.computer_name}</span>
                      </td>
                      <td className="username">
                        <span>{log.username}</span>
                      </td>
                      <td className="section">
                        <span>{log.section}</span>
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
                    <td colSpan="6" className="no-fetch-msg">No logs available</td>
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
          
          <div className='gen-report'>
            {type === '' ? (
              <button 
                // onClick={handleGenerateReportPDF} 
                disabled={loading}
              >
                {loading ? "Generating..." : <><i class="fa-solid fa-print"></i> Download Report"</>}
              </button>
            ) : type === 'faculty' ? (
              <button 
                onClick={handleGenerateFacultyReportPDF} 
                disabled={loading}
              >
                {loading ? "Generating..." : <><i class="fa-solid fa-print"></i> Download Faculty Report"</>}
              </button>
            ) : (
              <button 
                onClick={handleGenerateStudentReportPDF} 
                disabled={loading}
              >
                {loading ? "Generating..." : <><i class="fa-solid fa-print"></i> Download Class Report"</>}
              </button>
            )} 
          </div>
        </div>
      </div>
    </>
  );
}

export default ComputerLogs;
