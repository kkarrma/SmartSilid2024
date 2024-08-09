import React from 'react';
import './RoomSchedule.css';

function RoomSchedule() {
  return (
    <>
      <div class="sched-table">
        <form>
          <table>
            <thead>
              <tr>
                <th>Section</th>
                <th>Date</th>
                <th>Hours | Minutes</th>
                <th>Day</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="section">
                  <select name="Date">
                    <option value="Section1">Section 1</option>
                    <option value="Section2">Section 2</option>
                    <option value="Section3">Section 3</option>
                    <option value="Section4">Section 4</option>
                    <option value="Section5">Section 5</option>
                    <option value="Section6">Section 6</option>
                  </select>
                </td>
                <td class="date">
                  <select name="Date">
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </td>
                <td class="hr-min">
                  <div class="flex-cont">
                    <input type="text" name="hr" placeholder="10" />
                    <span> : </span>
                    <input type="text" name="min" placeholder="30" />
                  </div>
                </td>
                <td class="day">
                  <select name="Day">
                    <option value="am">AM</option>
                    <option value="pm">PM</option>
                  </select>
                </td>
                <td class="action">
                  <button type="submit" class="add-rec-btn" onclick="addRecord()">Add</button>
                  <button type="button" class="del-btn" onclick="deleteRecord()">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr class="add-row">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td class="td-add" colspan="3">
                  <button type="button" class="add-sched-btn" onclick="addSched()">
                  Add Schedule &nbsp; <i class="fa-regular fa-calendar-plus"></i>
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

export default RoomSchedule;
