import React, {useState, useEffect} from 'react';
import './RFIDRecord.css';

function RFIDRecord() {
  const [rfid, setRfid] = useState('');
  const [newRfid, setNewRfid] = useState('');
  const [faculty, setFaculty] = useState('')
  const [newFaculty, setNewFaculty] = useState('');
  const [schedule, setSchedule] = useState('')
  const [newSchedule, setNewSchedule] = useState('')
  const [visibleInfo, setVisibleInfo] = useState('');
 
  const getCSRFToken = () => {
    const tokenElement = document.querySelector('meta[name="csrf-token"]');
    return tokenElement ? tokenElement.getAttribute('content') : '';
  };

  const fetchRFID = async () => {
    try{
      const response = await fetch('http://12.168.10.112:8000/', {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json',
          'X-CSRFToken' : getCSRFToken(),
        },
        body: JSON.stringify({
          rfid: rfid,
          faculty: faculty,
          schedule: schedule
        })
      })
    } catch (error) {
      console.error('Error fetching RFID ', error);
      alert('Failed to load blocked RFID. PLease try again');
    }
  };

  return (
    <>
      <div class="rfid-table">
        <form>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Access</th>
                <th>Schedule</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="id">1</td>
                <td class="name">
                  <input type="text" name="name" placeholder="John Doe" />
                </td>
                <td class="access">
                  <select name="access">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </td>
                <td class="schedule">
                  <select name="schedule">
                    <option value="none">None</option>
                    <option value="Section1">Section 1</option>
                    <option value="Section2">Section 2</option>
                  </select>
                </td>
                <td class="action">
                  <button type="submit" onclick="updateRecord()">Update</button>
                  <button type="button" class="del-btn" onclick="deleteRecord()">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </>
  )
}

export default RFIDRecord;