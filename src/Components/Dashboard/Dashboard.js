import React, { useState } from 'react';
import './Dashboard.css';
import DashboardContent from './DashboardContent';
import RoomSchedule from './RoomSchedule';
import Logbook from './Logbook';
import RFIDRecord from './RFIDRecord';
import StudentRecord from './StudentRecord';
import FacultyRecord from './FacultyRecord';
import WebFilter from './WebFilter';
import Notification from './Notification';

function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const [isUserRecordOpen, setIsUserRecordOpen] = useState(false);

  const toggleUserRecord = () => {
    setIsUserRecordOpen(!isUserRecordOpen);
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'Room Schedule':
        return <RoomSchedule />;
      case 'Logbook':
        return <Logbook />;
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
            <i className="fa-solid fa-house"></i>
            Dashboard
          </div>
          <div className={`menu-panel dash ${selectedMenu === 'Room Schedule' ? 'selected' : ''}`} 
            onClick={() => setSelectedMenu('Room Schedule')}>
            <i className="fa-solid fa-calendar-days"></i>
            Room Schedule
          </div>
          <div className={`menu-panel dash ${selectedMenu === 'Logbook' ? 'selected' : ''}`} 
            onClick={() => setSelectedMenu('Logbook')}>
            <i className="fa-solid fa-book-open"></i>
            Logbook
          </div>
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
