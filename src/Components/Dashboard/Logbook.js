import React from 'react';
import './Logbook.css';

function Logbook() {
  return (
    <>
      <div class="log-table">
        <form>
          <table>
            <thead>
              <tr>
                <th>PC#</th>
                <th>Name</th>
                <th>Login <br/> (hr : min)</th>
                <th>Log out <br/> (hr : min)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="pc#">
                  1
                </td>
                <td class="name">
                  <input type="text" name="hr" placeholder="John Doe" />
                </td>
                <td class="log-in">
                  <div class="flex-cont">
                    <input type="text" name="hr" placeholder="10" />
                    <span> : </span>
                    <input type="text" name="min" placeholder="30" />
                    
                    <select name="Day">
                      <option class="login-day am" value="am">AM</option>
                      <option class="login-day pm" value="pm">PM</option>
                    </select>
                  </div>
                </td>
                <td class="log-out">
                  <div class="flex-cont">
                    <input type="text" name="hr" placeholder="10" />
                    <span> : </span>
                    <input type="text" name="min" placeholder="30" />
                    
                    <select name="Day">
                      <option class="logout-day am" value="am">AM</option>
                      <option class="logout-day pm" value="pm">PM</option>
                    </select>
                  </div>
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