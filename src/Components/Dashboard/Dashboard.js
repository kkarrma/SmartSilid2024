import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import ComputerControl from './ComputerControl';
import RoomSchedule from './RoomSchedule';
import ComputerLogs from './ComputerLogs';
import RFIDLogs from './RFIDLogs';
import StudentRecord from './StudentRecord';
import FacultyRecord from './FacultyRecord';
import WebFilter from './WebFilter';
import UserPage from './UserPage';
import { API_BASE_URL } from './config';
import { useNavigate } from 'react-router-dom';
import ssIcon from '../Assets/ss_icon.png';

function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState(() => {
    // Retrieve the selected menu from localStorage or default to 'Computer Control'
    return localStorage.getItem('selectedMenu') || 'Computer Control';
  });
  const [isUserRecordOpen, setIsUserRecordOpen] = useState(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 
  const [userName, setUserName] = useState(false);
  const [userType, setUserType] = useState(''); 
  const Navigate = useNavigate();
  
  useEffect(() => {
    localStorage.setItem('selectedMenu', selectedMenu);
  }, [selectedMenu]);
  
  useEffect(() => {
    handleTokenRefresh();
    checkDashToAccess(); 
  }, []);

  const toggleUserRecord = () => {
    setIsUserRecordOpen(!isUserRecordOpen);
    if (!isUserRecordOpen) {
      setIsLogbookOpen(false);
    }
  };

  const checkDashToAccess = () => {
    const userTypeFromStorage = localStorage.getItem('type');
    setUserType(userTypeFromStorage || ''); 
    console.log('DATA TYPE: ', userType);
  };

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

  const toggleLogbook = () => {
    setIsLogbookOpen(!isLogbookOpen);
    if (!isLogbookOpen) {
      setIsUserRecordOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    
    const menuIcon = document.querySelector('.mobile-menu-icon');
    menuIcon.classList.toggle('active');
  };

  const closeAllDrops = () => {
    setIsLogbookOpen(false);
    setIsUserRecordOpen(false);
  }

  const renderContent = () => {
    switch (selectedMenu) {
      case 'Computer Control':
        return <ComputerControl />;
      // case 'Casting':
      //   return <Casting />;
      case 'Room Schedule':
        return <RoomSchedule />;
      case 'Computer Logs':
        return <ComputerLogs />;
      case 'RFID Logs':
        return <RFIDLogs />;
      case 'Student Record':
        return <StudentRecord />;
      case 'Faculty Record':
        return <FacultyRecord />;
      case 'Web Filter':
        return <WebFilter />;
      case 'User Page':
        return <UserPage/>;
      default:
        return <ComputerControl />;
    }
  };

  const renderRightPanelContent = () => {
    switch (selectedMenu) {
      // case 'Room Schedule':
      //   return <div>Room Schedule Sidebar Content</div>;
      case 'RFID Record':
        return <div>RFID Record Sidebar Content</div>;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="left-head">
          <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
            <i className="fas fa-bars"></i>
          </div>
        </div>
        <div className='mid-head'>
          <div className="ss-icon"></div>
          <h3>Smart<span>Silid</span></h3>
        </div>
        <div className="right-head"
          onClick={() => {
            setSelectedMenu('User Page');
            closeAllDrops();
          }}
        >
          <a>
            <div className="prof-icon"><i className="fa-regular fa-user"></i></div>
            <div className="prof-name">{userName}</div>
          </a>
        </div>
      </div>

      <div className="dashboard-panels-wrapper">
        <div className={`side-panel-L ${mobileMenuOpen ? 'open' : ''}`}>
          <div className={`menu-panel dash ${selectedMenu === 'Computer Control' ? 'selected' : ''}`} 
            onClick={() => {
              setSelectedMenu('Computer Control');
              closeAllDrops();
            }}>
            {/* <i className="fa-solid fa-network-wired"></i> */}
            Computer Controls
          </div>
          {/* <div className={`menu-panel dash ${selectedMenu === 'Casting' ? 'selected' : ''}`} 
            onClick={() => {
              setSelectedMenu('Casting');
              closeAllDrops();
            }}>
            <i className="fa-solid fa-computer"></i>
            Casting
          </div> */}

          {userType == 'admin' && (
            <>
              <div className={`menu-panel dash ${selectedMenu === 'Room Schedule' ? 'selected' : ''}`} 
              onClick={() => {
                setSelectedMenu('Room Schedule');
                closeAllDrops();
              }}>
              {/* <i className="fa-solid fa-calendar-days"></i> */}
              Room Schedule
              </div>
              <div className={`menu-panel dash ${isLogbookOpen ? 'open' : ''}`} onClick={toggleLogbook}>
                {/* <i className="fa-solid fa-book-open"></i> */}
                Logbook &nbsp;&nbsp;
                <i className={`fa-solid ${isLogbookOpen ? 'fa-angle-down' : 'fa-angle-right'}`}></i>
              </div>
              {isLogbookOpen && (
                <div className="submenu">
                  <div className={`menu-panel dash ${selectedMenu === 'Computer Logs' ? 'selected' : ''}`} 
                    onClick={() => setSelectedMenu('Computer Logs')}>
                    &nbsp;&nbsp;
                    {/* <i className="fa-solid fa-desktop"></i> */}
                    Computer Logs
                  </div>
                  <div className={`menu-panel dash ${selectedMenu === 'RFID Logs' ? 'selected' : ''}`} 
                    onClick={() => setSelectedMenu('RFID Logs')}>
                    &nbsp;&nbsp;
                    {/* <i className="fa-regular fa-credit-card"></i>  */}
                    RFID Logs
                  </div>
                </div>
              )}
              <div className={`menu-panel dash ${isUserRecordOpen ? 'open' : ''}`} onClick={toggleUserRecord}>
                {/* <i className="fa-solid fa-user"></i> */}
                User Record &nbsp;&nbsp;
                <i className={`fa-solid ${isUserRecordOpen ? 'fa-angle-down' : 'fa-angle-right'}`}></i>
              </div>
              {isUserRecordOpen && (
                <div className="submenu">
                  <div className={`menu-panel dash ${selectedMenu === 'Student Record' ? 'selected' : ''}`} 
                    onClick={() => setSelectedMenu('Student Record')}>
                    &nbsp;&nbsp;
                    {/* <i className="fa-solid fa-users"></i> */}
                    Student Record
                  </div>
                  <div className={`menu-panel dash ${selectedMenu === 'Faculty Record' ? 'selected' : ''}`} 
                    onClick={() => setSelectedMenu('Faculty Record')}>
                    &nbsp;&nbsp;
                    {/* <i className="fa-solid fa-user-tie"></i> */}
                    Faculty Record
                  </div>
                </div>
              )}
              <div className={`menu-panel dash ${selectedMenu === 'Web Filter' ? 'selected' : ''}`} 
                onClick={() => {
                  setSelectedMenu('Web Filter');
                  closeAllDrops();
                }}>
                {/* <i className="fa-solid fa-list-check"></i> */}
                Web Filter
              </div> 
            </>
          )}
        </div>

        <div className="content-panel">
          {renderContent()}
        </div>

        {renderRightPanelContent() && (
          <div className="side-panel-R">
            {renderRightPanelContent()}
          </div>
        )}      
      </div>
    </div>
  );
}

export default Dashboard;
