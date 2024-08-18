import React from 'react';
import './WebFilter.css';

function WebFilter() {
  return (
    <>
      <div class="web-table">

{/* WHITE LIST */}

        <form class="white-list">
          <table>
            <thead>
              <tr>
                <th>URL White List</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="web-url">
                  <input type="text" name="hr" placeholder="John Doe" />
                </td>
                <td class="action">
                  <button type="submit" onclick="updateRecord()">Update</button>
                  <button type="button" class="del-btn" onclick="deleteRecord()">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td></td>
                <td class="td-add">
                  <button type="button" class="add-sched-btn" onclick="addSched()">
                  Add URL &nbsp; <i class="fa-regular fa-calendar-plus"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>

{/* BLACK LIST */}

        <form class="black-list">
          <table>
            <thead>
              <tr>
                <th>URL Black List</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="web-url">
                  <input type="text" name="hr" placeholder="John Doe" />
                </td>
                <td class="action">
                  <button type="submit" onclick="updateRecord()">Update</button>
                  <button type="button" class="del-btn" onclick="deleteRecord()">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </td>
              </tr>
              <tr>
                <td></td>
                <td class="td-add">
                  <button type="button" class="add-sched-btn" onclick="addSched()">
                  Add URL &nbsp; <i class="fa-regular fa-calendar-plus"></i>
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

export default WebFilter;