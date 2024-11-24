/*************  ✨ Codeium Command 🌟  *************/
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './BASE_URL';
import './ComputerControl.css';
import { useNavigate } from 'react-router-dom';
import AlertModal from './AlertModal';

function ComputerControl() {
  const [pcs, setPcs] = useState([]);
  const [pcStates, setPcStates] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPCs, setSelectedPCs] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [adminInputValue, setAdminInputValue] = useState('');
  const [streamToken, setStreamToken] = useState(''); 
  const [isStreaming, setIsStreaming] = useState(false);
  const Navigate = useNavigate();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmCallback, setModalConfirmCallback] = useState(null);

  const showAlertModal = (message, onConfirm) => {
    setModalMessage(message);
    setModalConfirmCallback(() => onConfirm);
    setIsModalOpen(true); 
  };
  
  useEffect(() => {
    setStreamToken(localStorage.getItem('streamToken'));
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

          console.log("ulit")
          
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
        isAdmin: pc.is_admin, 
        isOn: pc.status === 1 
      }));
        
      setPcs(fetchedPCs.map(pc => pc.name));
      setPcStates((prevStates) => {
        const newStates = fetchedPCs.reduce((acc, pc) => ({
          ...acc,
          [pc.name]: { 
            isOn: pc.isOn, //prevStates[pc.name]?.isOn || false, 
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

    setIsModalOpen(false);
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

    setIsModalOpen(false);
  };

  const handleDeleteSelectedPCs = async (pcList) => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/delete_computers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({ computers: pcList }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleDeleteSelectedPCs(pcList);
      }

      if (response.ok) {
        fetchComputers();
        setSelectedPCs([]);
      }
    } catch (error) {
      
      console.error('Failed to wake computers:', error);
    }

    setIsModalOpen(false);
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

    setIsModalOpen(false);
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
  
    try {
      const response = await fetch(`${API_BASE_URL}/set_computer_admin`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, 
        },
        body: JSON.stringify({ 
          computer_name: adminInputValue
        }),
      });

      if (response.status === 401) {
        await handleTokenRefresh();
        return handleSetComputerAdmin(); 
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to make the computer admin:', errorData.status);
        console.error(`Error: ${errorData.status_message}`);
      } else {
        const successData = await response.json();
        console.log(successData.status_message);
        setAdminStatus(adminInputValue, true);
        fetchComputers();
      }
    } catch (error) {
      
      console.error('Failed to make the computer admin:', error);
      fetchComputers();
    }

    setIsModalOpen(false);
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
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/stream/start/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${accessToken}`, 
        },
      });
  
      if (response.ok) {
        const result = await response.text();
        console.log(result); 
        
        const tokenMatch = result.match(/"token":\s*"([^"]+)"/);
        localStorage.setItem('streamToken', tokenMatch[1]);
        setStreamToken(localStorage.getItem('streamToken'));
        console.log(streamToken); 
        
        if (tokenMatch) {
          setIsStreaming(true);
        } else {
          console.log("Token not found in the response.");
        }
      } else {
        console.log("Failed to start streaming.");
      }
    } catch (error) {
      console.error("Error starting stream:", error);
      console.log("Error starting stream. Please try again.");
    }

    setIsModalOpen(false);
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
        console.log(result); 
        
        setStreamToken('');
        localStorage.removeItem('streamToken'); 
        setIsStreaming(false);
      } else {
        console.log("Failed to stop streaming.");
      }
    } catch (error) {
      console.error("Error stopping stream:", error);
      console.log("Error stopping stream. Please try again.");
    }

    setIsModalOpen(false);
  };

  const streamUrl = `${API_BASE_URL}/stream`; // The URL part you want
  
  useEffect(() => {
    // Make sure the link exists in the DOM before attempting to modify it
    const streamLink = document.getElementById('stream-link');
    if (streamLink) {
      streamLink.href = `${streamUrl}?token=${streamToken}`;
      streamLink.href = `${streamUrl}`;
    }
  }, [streamUrl, streamToken]);

  return (
    <>
      <div className='computer-controls'>
        <div className="dash-container">
          <div className='stream-container cont'>
            <h3 className="cont-title">Casting Controls</h3>
            <div className="stream-row">
              <div className='stream-btn'>
                <button onClick={() => showAlertModal('Are you sure you want to start a stream?', () => startStream())} 
                  disabled={streamToken !== ''}>Start Stream</button>
                <button onClick={() => showAlertModal('Are you sure you want to stop the stream?', () => stopStream())}
                  disabled={streamToken === ''}>Stop Stream</button>
                <div id="stream"></div> 
              </div>
            </div>
            {streamToken !== null && streamToken !== '' && (
              <div className="stream-token">
                <span>STREAM TOKEN:</span>{streamToken}
              </div>
            )}

            <div className="view-stream-row">
              <a id="stream-link" href="#" target="_blank" rel="noopener noreferrer" aria-label="Go to Stream Page">
                <h4>View Client Screens &nbsp;&nbsp; ≫ &nbsp;&nbsp; </h4>
              </a>
            </div>
          </div>

          {/* <div className='cont-divider'></div> */}

          <form>
            <div className="controls-row filter-controls cont"> 
              <h3 classame="cont-title">Computer Controls</h3>
              <select onChange={handleAdminInputChange} value={adminInputValue}>
                <option value="">Select Admin PC</option>
                {pcs.map((pc) => (
                  <option key={pc} value={pc}>
                    {pc}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => showAlertModal('Are you sure you want to asign this computer as Admin PC?', () => handleSetComputerAdmin())}
              
                // disabled={!adminInputValue}  
              >
                Set Admin
              </button>
            </div>
            
            <div className='computer-list cont'>
              <div className="checkbox-container">
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
                  onClick={() => showAlertModal('Are you sure you want to turn on the selected PCs?', () => handleToggleSelectedPCs(true))}
                  disabled={selectedPCs.length === 0} 
                >
                  Turn On
                </button>
                <button
                  type="button"
                  onClick={() => showAlertModal('Are you sure you want to turn on the selected PCs?', () => handleToggleSelectedPCs(false))}
                  disabled={selectedPCs.length === 0} 
                >
                  Turn Off
                </button>
                <button
                  className='del-btn'
                  type="button"
                  onClick={() => showAlertModal('Are you sure you want to remove the selected PCs?', () => handleDeleteSelectedPCs(selectedPCs))}
                  disabled={selectedPCs.length === 0} 
                >
                  Remove
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
                <p className='no-fetch-msg'>No PCs found.</p>
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
                              onChange={() => showAlertModal(`Are you sure you want to turn ${pcStates[pc]?.isOn ? 'off' : 'on'} ${pc}?`, () => handleRowTogglePC(pc))} 
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
      

      <AlertModal
        message={modalMessage}
        onConfirm={modalConfirmCallback} 
        onCancel={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
      />
    </>
  );
}

export default ComputerControl;