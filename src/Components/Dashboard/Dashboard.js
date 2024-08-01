import React from 'react';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div class="left-head">
          <div class="head-logo"><i class="fa-solid fa-circle"></i> &nbsp; </div>
          <div class="head-atec">
              <span>ATEC</span> &nbsp; TECHNOLOGICAL COLLEGE
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
          Side Panel 1
        </div>
        <div className="dashboard-panels">
          <div className="panel">Panel 1</div>
          <div className="panel">Panel 2</div>
          <div className="panel">Panel 3</div>
          <div className="panel">Panel 4</div>
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
