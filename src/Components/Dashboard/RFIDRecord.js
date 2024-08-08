import React from 'react';
import './RFIDRecord.module.css';

function RFIDRecord() {
  return (
    <>
        <div>
          <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Access</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>John Doe</td>
                    <td>
                        <select>
                            <option value="schedule1">Schedule1</option>
                            <option value="schedule2">Schedule2</option>
                            <option value="admin">Always Allow</option>
                        </select>
                    </td>
                    <td class="action-buttons">
                        <button onclick="updateRecord(1)">Update</button>
                        <button onclick="deleteRecord(1)">Delete</button>
                    </td>
                </tr>
            </tbody>
          </table>
        </div>
    </>
  )
}

export default RFIDRecord;