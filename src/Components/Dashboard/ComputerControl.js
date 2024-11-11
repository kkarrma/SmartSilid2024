import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './BASE_URL';
import './ComputerControl.css';
import { useNavigate } from 'react-router-dom';

function ComputerControl() {
  const [pcs, setPcs] = useState([]);
  const [pcStates, setPcStates] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPCs, setSelectedPCs] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [adminInputValue, setAdminInputValue] = useState('');
  const Navigate = useNavigate();

  useEffect(() => {
    fetchComputers();
  }, []);

  const handleTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken === null) {
        console.log("Refresh token is missing.");
        return Navigate('/'); 
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ refresh: refreshToken }), 
          });
          
          if (!response.ok) {
            console.error('Failed to refresh token. Status:', response.status);
            return Navigate('/'); 
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
    } catch (error) {
        console.error('Token refresh error:', error);
    }
  };

  const fetchComputers = async () => {
    const accessToken = localStorage.getItem('accessToken');

    try {
      console.log(`${API_BASE_URL}/get_all_computers`)
      const response = await fetch(`${API_BASE_URL}/get_all_computers`, {
        headers: { Authorization: `Bearer ${accessToken}`, }
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return fetchComputers();
        
      }

      const data = await response.json();
      const fetchedPCs = data.computers.map(pc => ({
        name: pc.computer_name,
        isAdmin: pc.is_admin 
      }));
        
      setPcs(fetchedPCs.map(pc => pc.name));
      setPcStates((prevStates) => {
        const newStates = fetchedPCs.reduce((acc, pc) => ({
          ...acc,
          [pc.name]: { 
            isOn: prevStates[pc.name]?.isOn || false, 
            isChecked: false, 
            isAdmin: pc.isAdmin 
          }
        }), {});

        return newStates;
      });
      
    } catch (error) {
      console.error('Error fetching computers:', error);
    }
  };

  const shutdownPC = async (pcList) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/shutdown_computers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({ computers: pcList }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return shutdownPC(pcList); 
        
      }
    } catch (error) {
      
      console.error('Failed to shutdown computers:', error);
    }
  };

  const wakenPC = async (pcList) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/wake_computers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({ computers: pcList }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return wakenPC(pcList);
      }
    } catch (error) {
      
      console.error('Failed to wake computers:', error);
    }
  };

  const handleCheckBoxChange = (pc) => {
    const isChecked = !pcStates[pc].isChecked;
    setPcStates((prevState) => ({
      ...prevState,
      [pc]: { ...prevState[pc], isChecked },
    }));

    setSelectedPCs((prevSelectedPCs) => {
      if (isChecked) {
        return [...prevSelectedPCs, pc];
      } else {
        return prevSelectedPCs.filter((selectedPC) => selectedPC !== pc);
      }
    });
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setPcStates((prevState) =>
      pcs.reduce(
        (acc, pc) => {
          const newIsChecked = newSelectAll;
          return {
            ...acc,
            [pc]: { ...prevState[pc], isChecked: newIsChecked },
          };
        },
        {}
      )
    );
    setSelectedPCs(newSelectAll ? pcs : []);
  };

  const handleSelectPC = (event) => {
    const selectedPC = event.target.value;
    if (!selectedPCs.includes(selectedPC)) {
      setSelectedPCs([...selectedPCs, selectedPC]);
      setInputValue([...selectedPCs, selectedPC].join(', '));
    } else {
      setSelectedPCs(selectedPCs.filter((pc) => pc !== selectedPC));
      setInputValue(selectedPCs.filter((pc) => pc !== selectedPC).join(', '));
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    const pcsArray = event.target.value
      .split(',')
      .map(pc => pc.trim())
      .filter(pc => pcs.includes(pc));
    setSelectedPCs(pcsArray);
  };

  const handleToggleSelectedPCs = (turnOn) => {
    setPcStates((prevState) =>
      selectedPCs.reduce(
        (acc, pc) => ({
          ...acc,
          [pc]: { ...prevState[pc], isOn: turnOn },
        }),
        { ...prevState }
      )
    );

    if (turnOn) {
      wakenPC(selectedPCs);
    } else {
      shutdownPC(selectedPCs);
    }
  };

  const handleRowTogglePC = (pc) => {
    const newState = !pcStates[pc]?.isOn;
    setPcStates((prevState) => ({
      ...prevState,
      [pc]: { ...prevState[pc], isOn: newState },
    }));

    if (newState) {
      wakenPC([pc]);
    } else {
      shutdownPC([pc]);
    }
  };

  const handleClearSelection = () => {
    setSelectedPCs([]);
    setInputValue('');
    setPcStates((prevState) =>
      pcs.reduce((acc, pc) => {
        return {
          ...acc,
          [pc]: { ...prevState[pc], isChecked: false },
        };
      }, {})
    );
    setSelectAll(false);
  };

  const handleSetComputerAdmin = async () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!adminInputValue) {
      console.error('No PC selected to set as admin.');
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/set_computer_admin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({ computer_name: adminInputValue }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleSetComputerAdmin(); 
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to make the computer admin:', errorData.status);
        alert(`Error: ${errorData.status}`);
      } else {
        const successData = await response.json();
        alert(successData.status);
        setAdminStatus(adminInputValue, true);
      }
      
      window.location.reload();
    } catch (error) {
      
      console.error('Failed to make the computer admin:', error);
    }
  };

  const setAdminStatus = (computerName, status) => {
    setPcStates((prevStates) => ({
      ...prevStates,
      [computerName]: { ...prevStates[computerName], isAdmin: status }
    }));
  };

  const handleAdminInputChange = (event) => {
    setAdminInputValue(event.target.value);
  };

  const startStream = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stream/start/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const result = await response.text();
        alert(result); // Show a message to the user that streaming has started
      } else {
        alert("Failed to start streaming.");
      }
    } catch (error) {
      console.error("Error starting stream:", error);
      alert("Error starting stream. Please try again.");
    }
  };

  const stopStream = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stream/stop/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        const result = await response.text();
        alert(result); // Show a message to the user that streaming has stopped
      } else {
        alert("Failed to stop streaming.");
      }
    } catch (error) {
      console.error("Error stopping stream:", error);
      alert("Error stopping stream. Please try again.");
    }
  };

  const streamUrl = `${API_BASE_URL}/stream`; // The URL part you want
  
  useEffect(() => {
    // Make sure the link exists in the DOM before attempting to modify it
    const streamLink = document.getElementById('stream-link');
    if (streamLink) {
      streamLink.href = `${streamUrl}`;
    }
  }, [streamUrl]);
  return (
    <>
      <div className='computer-controls'>
        <div className="dash-container">
          <div className='stream-container cont'>
            <div className="stream-row">
              <h4>Casting Controls &nbsp;&nbsp; | &nbsp;&nbsp; </h4>
              <div className='stream-btn'>
                <button onClick={startStream}>Start Stream</button>
                <button onClick={stopStream}>Stop Stream</button>
                <div id="stream"></div> 
              </div>
            </div>

            <div className="view-stream-row">
              <h4>View Client Screens &nbsp;&nbsp; | &nbsp;&nbsp; </h4>
              {/* <a href="192.168.10.112:8000/stream" target="_blank">Go to Stream Page</a> */}
              <a id="stream-link" href="#" target="_blank" rel="noopener noreferrer" aria-label="Go to Stream Page">Go to Stream Page</a>

            </div>
          </div>

          <div className='cont-divider'></div>

          <form>
            <div className="controls-row cont"> 
              <h4>Computer List &nbsp;&nbsp; | &nbsp;&nbsp; </h4>
              <select onChange={handleSelectPC} value="">
                <option value="">Select a PC</option>
                {pcs.map((pc) => (
                  <option
                    key={pc}
                    value={pc}
                    style={{
                      color: pcStates[pc]?.isOn ? 'var(--bg6)' : 'black',
                      fontWeight: pcStates[pc]?.isOn ? 'bold' : 'lighter'
                    }}
                  >
                    {pc}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Selected PCs"
              />
              <button
                type="button"
                onClick={() => handleToggleSelectedPCs(true)}
                disabled={selectedPCs.length === 0} 
              >
                Turn On
              </button>
              <button
                type="button"
                onClick={() => handleToggleSelectedPCs(false)}
                disabled={selectedPCs.length === 0} 
              >
                Turn Off
              </button>
            </div>
            
            <div className='computer-list cont'>
              <div className="checkbox-container">
                <select onChange={handleAdminInputChange} value={adminInputValue}>
                  <option value="">Select Admin PC</option>
                  {pcs.map((pc) => (
                    <option key={pc} value={pc}>
                      {pc}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSetComputerAdmin}
                  disabled={!adminInputValue}
                >
                  Set Admin
                </button>
                <div>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                  <label>Select All</label> 
                  &nbsp;&nbsp;&nbsp;
                  <button
                    type="button"
                    onClick={handleClearSelection}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {pcs.length === 0 ? ( 
                <p className='no-fetch-msg'>No PCs found</p>
              ) : (
                <>
                  <div className="pcs-grid">
                    {pcs.map((pc) => (
                      <div 
                        key={pc} 
                        className={`pc-item ${pcStates[pc]?.isChecked ? 'checked' : ''} 
                                            ${pcStates[pc]?.isAdmin ? 'isAdmin' : ''}`}
                        onClick={() => handleCheckBoxChange(pc)} 
                      >
                        <div className="pc-icon">
                          <i className="fa-solid fa-desktop"></i> 
                        </div>
                        <div className="checkbox-cell">
                          <input
                            type="checkbox"
                            checked={pcStates[pc]?.isChecked}
                            onChange={() => handleCheckBoxChange(pc)}
                            className="hidden-checkbox"
                          />
                          <div className="pc-name">{pc}</div>
                        </div>
                        <div className="action">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={pcStates[pc]?.isOn}
                              onChange={() => handleRowTogglePC(pc)} 
                            />
                            <span className="slider" />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='pcs-table'>
                    <table>
                      <thead>
                        <tr className="pcs-table-header">
                          <th>Select</th>
                          <th>PC Name</th>
                          <th>Off | On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pcs.map((pc) => (
                          <tr key={pc} className={`pcs-table-row ${pcStates[pc]?.isChecked ? 'checked' : ''}`}>
                            <td>
                              <input
                                type="checkbox"
                                checked={pcStates[pc]?.isChecked}
                                onChange={() => handleCheckBoxChange(pc)} 
                              />
                            </td>
                            <td>{pc}</td>
                            <td>
                              <div className="action">
                                <label className="toggle-switch">
                                  <input
                                    type="checkbox"
                                    checked={pcStates[pc]?.isOn}
                                    onChange={() => handleRowTogglePC(pc)}
                                  />
                                  <span className="slider" />
                                </label>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ComputerControl;
