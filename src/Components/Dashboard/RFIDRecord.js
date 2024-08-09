import React from 'react';
import './RFIDRecord.css';

function RFIDRecord() {
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