import React, { useState } from 'react';
import './Dashboard.css';
import DashboardContent from './DashboardContent';
import Casting from './Casting';
import RoomSchedule from './RoomSchedule';
import ComputerLogs from './ComputerLogs';
import RFIDLogs from './RFIDLogs';
import StudentRecord from './StudentRecord';
import FacultyRecord from './FacultyRecord';
import RFIDRecord from './RFIDRecord';
import WebFilter from './WebFilter';
import Notification from './Notification';

function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const [isUserRecordOpen, setIsUserRecordOpen] = useState(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);

  const toggleUserRecord = () => {
    setIsUserRecordOpen(!isUserRecordOpen);
    if (!isUserRecordOpen) {
      setIsLogbookOpen(false); // Close logbook only if user record is being opened
    }
  };

  const toggleLogbook = () => {
    setIsLogbookOpen(!isLogbookOpen);
    if (!isLogbookOpen) {
      setIsUserRecordOpen(false); // Close user record only if logbook is being opened
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'Casting':
        return <Casting />;
      case 'Room Schedule':
        return <RoomSchedule />;
      case 'Computer Logs':
        return <ComputerLogs />;
      case 'RFID Logs':
        return <RFIDLogs />;
      case 'RFID Record':
        return <RFIDRecord />;
      case 'Student Record':
        return <StudentRecord />;
      case 'Faculty Record':
        return <FacultyRecord />;
      case 'Web Filter':
        return <WebFilter />;
      case 'Notification':
        return <Notification />;
      default:
        return <DashboardContent />;
    }
  };

  const renderRightPanelContent = () => {
    switch (selectedMenu) {
      case 'Room Schedule':
        return <div>Room Schedule Sidebar Content</div>;
      case 'RFID Record':
        return <div>RFID Record Sidebar Content</div>;
      case 'Notification':
        return <div>Notification Sidebar Content</div>;
      // Add more cases as needed for different side-panel content
      default:
        return null; // Return null to hide the side panel
    }
  };

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="left-head">
          <div className="head-logo"></div>
          <div className="head-atec">
            &nbsp; &nbsp; <span>ATEC</span> &nbsp; TECHNOLOGICAL COLLEGE
          </div>
        </div>
        <div className="right-head">
          <div className="prof-icon"><i className="fa-regular fa-user"></i></div>
          <div className="prof-name">Juan Dela Cruz</div>
          <div className="drop"><i className="fa-solid fa-angle-right"></i></div>
        </div>
      </div>

      {/* DASH BODY */}
      <div className="dashboard-panels-wrapper">
        {/* LEFT SIDE PANEL */}
        <div className="side-panel-L">
          <div className={`menu-panel dash ${selectedMenu === 'Dashboard' ? 'selected' : ''}`} 
            onClick={() => setSelectedMenu('Dashboard')}>
            {/* <i className="fa-solid fa-house"></i> */}
            <i class="fa-solid fa-network-wired"></i>
            Dashboard
          </div>
          <div className={`menu-panel dash ${selectedMenu === 'Casting' ? 'selected' : ''}`} 
            onClick={() => setSelectedMenu('Casting')}>
            <i class="fa-solid fa-computer"></i>
            Casting
          </div>
          <div className={`menu-panel dash ${selectedMenu === 'Room Schedule' ? 'selected' : ''}`} 
            onClick={() => setSelectedMenu('Room Schedule')}>
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
                <i class="fa-solid fa-desktop"></i>
                Computer Logs
              </div>
              <div className={`menu-panel dash ${selectedMenu === 'RFID Logs' ? 'selected' : ''}`} 
                onClick={() => setSelectedMenu('RFID Logs')}>
                &nbsp;&nbsp;
                <i class="fa-regular fa-credit-card"></i> 
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
          <div className={`menu-panel dash ${selectedMenu === 'RFID Record' ? 'selected' : ''}`} 
            onClick={() => setSelectedMenu('RFID Record')}>
            <i className="fa-brands fa-cc-diners-club"></i>
            RFID Record
          </div>
          <div className={`menu-panel dash ${selectedMenu === 'Web Filter' ? 'selected' : ''}`} 
            onClick={() => setSelectedMenu('Web Filter')}>
            <i className="fa-solid fa-list-check"></i>
            Web Filter
          </div> 
          <div className={`menu-panel dash ${selectedMenu === 'Notification' ? 'selected' : ''}`} 
            onClick={() => setSelectedMenu('Notification')}>
            <i className="fa-solid fa-bell"></i>
            Notification
          </div>
        </div>

        {/* CONTENT PANEL */}
        <div className="content-panel">
          {renderContent()}
        </div>

        {/* RIGHT SIDE PANEL */}
        {renderRightPanelContent() && (
          <div className="side-panel-R">
            {renderRightPanelContent()}
          </div>
        )}
      </div>
      {/* <div className="dashboard-footer">
        Footer
      </div> */}
    </div>
  );
}

export default Dashboard;
