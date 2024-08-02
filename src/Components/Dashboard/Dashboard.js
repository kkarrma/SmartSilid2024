import React, { useState } from 'react';
import './Dashboard.css';
import RoomSchedule from './RoomSchedule';

function Dashboard() {
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');

  const renderContent = () => {
    switch (selectedMenu) {
      case 'Dashboard':
        return (
          <>
            <div className="dash-panels">
              <div className="panel"></div>
              <div className="panel"></div>
              <div className="panel"></div>
            </div>
          </>
        );
      case 'Room Schedule':
        return <RoomSchedule />;
      case 'Logbook':
        return <div>Logbook Content</div>;
      case 'RFID Registration':
        return <div>RFID Registration Content</div>;
      case 'Notification':
        return <div>Notification Content</div>;
      default:
        return <div>Panel 1 Content</div>;
    }
  };

  return (
    <div className="dashboard">
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
      <div className="dashboard-panels-wrapper">
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
          <div className={`menu-panel dash ${selectedMenu === 'RFID Registration' ? 'selected' : ''}`} 
          onClick={() => setSelectedMenu('RFID Registration')}>
            <i className="fa-brands fa-cc-diners-club"></i>
            RFID Registration
          </div>
          <div className={`menu-panel dash ${selectedMenu === 'Notification' ? 'selected' : ''}`} 
          onClick={() => setSelectedMenu('Notification')}>
            <i className="fa-solid fa-bell"></i>
            Notification
          </div>
        </div>
        <div className="content-panel">
          <div className="sect bread">{selectedMenu}</div>
          {renderContent()}
        </div>
        <div className="side-panel-R">
          Side Panel 2
        </div>
      </div>
      {/* <div className="dashboard-footer">
        Footer
      </div> */}
    </div>
  );
};

export default Dashboard;