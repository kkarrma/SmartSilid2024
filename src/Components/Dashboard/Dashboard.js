import React, { useState } from 'react';
import './Dashboard.css';
import RoomSchedule from './RoomSchedule';
import RFIDRecord from './RFIDRecord';
import Logbook from './Logbook';
import Notification from './Notification';
// import CalendarComponent from './CalendarComponent';

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
        return <Logbook />;
      case 'RFID Record':
        return <RFIDRecord />;
      case 'Notification':
        return <Notification />;
      default:
        return <Dashboard />;
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
          <div className={`menu-panel dash ${selectedMenu === 'RFID Record' ? 'selected' : ''}`} 
          onClick={() => setSelectedMenu('RFID Record')}>
            <i className="fa-brands fa-cc-diners-club"></i>
            RFID Record
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


{/* RIGHT SIDE PANEL */}

        <div className="side-panel-R">
        {/* <CalendarComponent /> */}
        </div>
      </div>
      {/* <div className="dashboard-footer">
        Footer
      </div> */}
    </div>
  );
};

export default Dashboard;