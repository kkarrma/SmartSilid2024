import React, { useState, useEffect } from 'react';
import './RoomSchedule.css';

function RoomSchedule() {
  const [subject, setSubject] = useState('');
  const [newSubject, setNewSubject] = useState('');

  // hourly
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [days, setDays] = useState('');
  const [newDays, setNewDays] = useState('');

  const [section, setSection] = useState('')
  const [newSection, setNewSection] = useState('')

  const [schedFormVisible, setSchedFormVisible] = useState(false);
  const [editFormVisible, setEditFormVisible] = useState(false)
  
  const handleAddSubject = async () => {
  }
  
  const handleEditSubject = async () => {
  }

  const handleDeleteSubject = async () => {
  }




  return (
    <>
      <div className="subj-form">
        {editFormVisible ? (
          <div className="new-subj-form">
            <input
              className="subj-input"
              type="text"
              value={setNewSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter a subject"
            />
            <button className="confirm-btn" onClick={handleAddSubject}>
              Confirm
            </button>
            <button className="cancel-btn" onClick={() => setEditFormVisible(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="add-url-btn" onClick={() => setEditFormVisible(true)}>
            <i className="fa-solid fa-plus"></i> Add Subject
          </button>
        )}
      </div>

      <div className="subj-table">
        <form className="subj-list">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Day</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {subject.length === 0 ? (
                <tr>
                  <td colSpan="2">No subjects found</td>
                </tr>
              ) : (
                subject.map((subs, index) => (
                  <tr key={index}>
                    <td className="sub">{subs}</td>
                    <td className="day">{subs.days}</td>
                    <td className="start-time">{subs.startTime}</td>
                    <td className="end-time">{subs.endTime}</td>
                    <td className="action">
                      {!editFormVisible && (
                        <button type="button" onClick={() => handleEditSubject(subs)}>
                          Edit
                        </button>
                      )}
                      <button type="button" className="del-btn" onClick={() => handleDeleteSubject(subs)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </form>
      </div>
    </>
  );
}

export default RoomSchedule;
