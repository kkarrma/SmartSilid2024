import React from 'react';
import './Logbook.css';

function Logbook() {
  return (
    <>
        <div>
        <form>
          <table>
            <thead>
              <tr>
                <th>PC#</th>
                <th>Name</th>
                <th>Login <br/> (hr : min)</th>
                <th>Log out <br/> (hr : min)</th>
                <th>Day</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="section">
                  1
                </td>
                <td class="date">
                  <input type="text" name="hr" placeholder="John Doe" />
                </td>
                <td class="hr-min">
                  <div class="flex-cont">
                    <input type="text" name="hr" placeholder="10" />
                    <span> : </span>
                    <input type="text" name="min" placeholder="30" />
                    
                    <select name="Day">
                      <option value="am">AM</option>
                      <option value="pm">PM</option>
                    </select>
                  </div>
                </td>
                <td class="hr-min">
                  <div class="flex-cont">
                    <input type="text" name="hr" placeholder="10" />
                    <span> : </span>
                    <input type="text" name="min" placeholder="30" />
                    
                    <select name="Day">
                      <option value="am">AM</option>
                      <option value="pm">PM</option>
                    </select>
                  </div>
                </td>
                <td class="action">
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
                <td class="td-add">
                  <button type="button" class="add-comp-col" onclick="addComp()">
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

export default Logbook;