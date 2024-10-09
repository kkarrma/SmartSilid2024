import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import ComputerControl from './ComputerControl';
import Casting from './Casting';
import RoomSchedule from './RoomSchedule';
import ComputerLogs from './ComputerLogs';
import RFIDLogs from './RFIDLogs';
import StudentRecord from './StudentRecord';
import FacultyRecord from './FacultyRecord';
import WebFilter from './WebFilter';
import Notification from './Notification';

function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState(() => {
    // Retrieve the selected menu from localStorage or default to 'Computer Control'
    return localStorage.getItem('selectedMenu') || 'Computer Control';
  });
  const [isUserRecordOpen, setIsUserRecordOpen] = useState(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 

  // Store the selected menu in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedMenu', selectedMenu);
  }, [selectedMenu]);

  const toggleUserRecord = () => {
    setIsUserRecordOpen(!isUserRecordOpen);
    if (!isUserRecordOpen) {
      setIsLogbookOpen(false);
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
      case 'Casting':
        return <Casting />;
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
      case 'Notification':
        return <Notification />;
      default:
        return <ComputerControl />;
    }
  };

  const renderRightPanelContent = () => {
    switch (selectedMenu) {
      case 'Room Schedule':
        return <div>Room Schedule Sidebar Content</div>;
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
          <div className="head-logo"></div>
        </div>
        <div className="right-head">
          <div className="prof-icon"><i className="fa-regular fa-user"></i></div>
          <div className="prof-name">Juan Dela Cruz</div>
          <div className="drop"><i className="fa-solid fa-angle-right"></i></div>
        </div>
      </div>

      <div className="dashboard-panels-wrapper">
        <div className={`side-panel-L ${mobileMenuOpen ? 'open' : ''}`}>
          <div className={`menu-panel dash ${selectedMenu === 'Computer Control' ? 'selected' : ''}`} 
            onClick={() => {
              setSelectedMenu('Computer Control');
              closeAllDrops();
            }}>
            <i className="fa-solid fa-network-wired"></i>
            Computer Controls
          </div>
          <div className={`menu-panel dash ${selectedMenu === 'Casting' ? 'selected' : ''}`} 
            onClick={() => {
              setSelectedMenu('Casting');
              closeAllDrops();
            }}>
            <i className="fa-solid fa-computer"></i>
            Casting
          </div>
          <div className={`menu-panel dash ${selectedMenu === 'Room Schedule' ? 'selected' : ''}`} 
            onClick={() => {
              setSelectedMenu('Room Schedule');
              closeAllDrops();
            }}>
            <i className="fa-solid fa-calendar-days"></i>
            Room Schedule
          </div>
          <div className={`menu-panel dash ${isLogbookOpen ? 'open' : ''}`} onClick={toggleLogbook}>
            <i className="fa-solid fa-book-open"></i>
            Logbook
            <i className={`fa-solid ${isLogbookOpen ? 'fa-angle-down' : 'fa-angle-right'}`}></i>
          </div>
          {isLogbookOpen && (
            <div className="submenu">
              <div className={`menu-panel dash ${selectedMenu === 'Computer Logs' ? 'selected' : ''}`} 
                onClick={() => setSelectedMenu('Computer Logs')}>
                &nbsp;&nbsp;
                <i className="fa-solid fa-desktop"></i>
                Computer Logs
              </div>
              <div className={`menu-panel dash ${selectedMenu === 'RFID Logs' ? 'selected' : ''}`} 
                onClick={() => setSelectedMenu('RFID Logs')}>
                &nbsp;&nbsp;
                <i className="fa-regular fa-credit-card"></i> 
                RFID Logs
              </div>
            </div>
          )}
          <div className={`menu-panel dash ${isUserRecordOpen ? 'open' : ''}`} onClick={toggleUserRecord}>
            <i className="fa-solid fa-user"></i>
            User Record
            <i className={`fa-solid ${isUserRecordOpen ? 'fa-angle-down' : 'fa-angle-right'}`}></i>
          </div>
          {isUserRecordOpen && (
            <div className="submenu">
              <div className={`menu-panel dash ${selectedMenu === 'Student Record' ? 'selected' : ''}`} 
                onClick={() => setSelectedMenu('Student Record')}>
                &nbsp;&nbsp;
                <i className="fa-solid fa-users"></i>
                Student Record
              </div>
              <div className={`menu-panel dash ${selectedMenu === 'Faculty Record' ? 'selected' : ''}`} 
                onClick={() => setSelectedMenu('Faculty Record')}>
                &nbsp;&nbsp;
                <i className="fa-solid fa-user-tie"></i>
                Faculty Record
              </div>
            </div>
          )}
          <div className={`menu-panel dash ${selectedMenu === 'Web Filter' ? 'selected' : ''}`} 
            onClick={() => {
              setSelectedMenu('Web Filter');
              closeAllDrops();
            }}>
            <i className="fa-solid fa-list-check"></i>
            Web Filter
          </div> 
          <div className={`menu-panel dash ${selectedMenu === 'Notification' ? 'selected' : ''}`} 
            onClick={() => {
              setSelectedMenu('Notification');
              closeAllDrops();
            }}>
            <i className="fa-solid fa-bell"></i>
            Notification
          </div>
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
