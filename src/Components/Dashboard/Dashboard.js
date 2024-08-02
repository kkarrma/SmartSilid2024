import React from 'react';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div class="left-head">
          <div class="head-logo"></div>
          <div class="head-atec">
            &nbsp; &nbsp; <span>ATEC</span> &nbsp; TECHNOLOGICAL COLLEGE
          </div>
        </div>
        <div class="right-head">
          <div class="prof-icon"><i class="fa-regular fa-user"></i></div>
          <div class="prof-name">Juan Dela Cruz</div>
          <div class="drop"><i class="fa-solid fa-angle-right"></i></div>
        </div>
      </div>
      <div className="dashboard-panels-wrapper">
        <div className="side-panel-L">
          <div class="menu-panel dash">
            <i class="fa-solid fa-house"></i>
            Dashboard
          </div>
          <div class="menu-panel room">
          <i class="fa-solid fa-calendar-days"></i>
            Room Schedule
          </div>
          <div class="menu-panel log">
          <i class="fa-solid fa-book-open"></i> 
            Logbook
          </div>
          <div class="menu-panel rfid">
          <i class="fa-brands fa-cc-diners-club"></i>
            RFID Registration
          </div>
          <div class="menu-panel notif">
          <i class="fa-solid fa-bell"></i> 
            Notification
          </div>
        </div>
        <div className="content-panel">
          <div className="sect bread">Dashboard /  Home</div>
          <div className="sect ">Panel 1</div>
          <div className="sect ">Panel 2</div>
          <div className="dash-panels">
            <div class="panel">
              
            </div>
            <div class="panel"></div>
            <div class="panel"></div>
            <div class="panel"></div>
            <div class="panel"></div>
          </div>
          <div className="sect ">Panel 3</div>
        </div>
        <div className="side-panel-R">
          Side Panel 2
        </div>
      </div>
      <div className="dashboard-footer">
        Footer
      </div>
    </div>
  );
}

export default Dashboard;
