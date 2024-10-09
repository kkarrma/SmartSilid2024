import React, { useState, useEffect } from 'react';
import './ComputerControl.css';

function ComputerControl() {
  const [pcs, setPcs] = useState([]);
  const [pcStates, setPcStates] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPCs, setSelectedPCs] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    fetchComputers();
  }, []);

  const fetchComputers = async () => {
    try {
      const response = await fetch('http://192.168.10.112:8000/get_all_computers');
      if (response.ok) {
        const data = await response.json();
        const fetchedPCs = data.computers.map(pc => pc.computer_name);
        setPcs(fetchedPCs);
        setPcStates(fetchedPCs.reduce((acc, pc) => ({ ...acc, [pc]: { isOn: false, isChecked: false } }), {}));
      } else {
        console.error('Failed to fetch computers');
      }
    } catch (error) {
      console.error('Error fetching computers:', error);
    }
  };

  const shutdownPC = async (pcList) => {
    try {
      await fetch('http://192.168.10.112:8000/shutdown_computers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ computers: pcList }),
      });
    } catch (error) {
      console.error('Failed to shutdown computers:', error);
    }
  };

  const wakenPC = async (pcList) => {
    try {
      await fetch('http://192.168.10.112:8000/wake_computers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ computers: pcList }),
      });
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

    // Trigger the appropriate server request
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

    // Trigger the appropriate server request
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

  return (
    <>
      <div className='computer-controls'>
        <div className="dash-container">
          <form>
            <div className="controls-row cont">
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
                disabled={selectedPCs.length === 0} // Disable if no PCs are selected
              >
                Turn On
              </button>
              <button
                type="button"
                onClick={() => handleToggleSelectedPCs(false)}
                disabled={selectedPCs.length === 0} // Disable if no PCs are selected
              >
                Turn Off
              </button>
            </div>
            <div className='computer-list cont'>
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
                <label>Select All</label> 
                &nbsp;&nbsp;&nbsp;
                <button
                  type="button"
                  onClick={handleClearSelection} // Clear button
                  disabled={selectedPCs.length === 0} // Disable if no PCs are selected
                >
                  Clear
                </button>
              </div>

              {pcs.length === 0 ? ( // Conditional rendering for no PCs found
                <p>No PCs found</p>
              ) : (
                <div className="pcs-grid">
                  {pcs.map((pc) => (
                    <div 
                      key={pc} 
                      className={`pc-item ${pcStates[pc]?.isChecked ? 'checked' : ''}`} 
                      onClick={() => handleCheckBoxChange(pc)} // Toggle checkbox on click
                    >
                      <div className="pc-icon">
                        <i className="fa-solid fa-desktop"></i> {/* Font Awesome PC icon */}
                      </div>
                      <div className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={pcStates[pc]?.isChecked}
                          onChange={() => handleCheckBoxChange(pc)} // Ensure checkbox updates state
                          className="hidden-checkbox" // Add class for styling
                        />
                        <div className="pc-name">{pc}</div>
                      </div>
                      <div className="action">
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={pcStates[pc]?.isOn}
                            onChange={() => handleRowTogglePC(pc)} // Toggle the PC state
                          />
                          <span className="slider" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className='pcs-table'>
                <table>
                  <thead>
                    <tr className="pcs-table-header">
                      <th>Select</th>
                      <th>PC Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pcs.map((pc) => (
                      <tr key={pc} className={`pcs-table-row ${pcStates[pc]?.isChecked ? 'checked' : ''}`}>
                        <td>
                          <input
                            type="checkbox"
                            checked={pcStates[pc]?.isChecked}
                            onChange={() => handleCheckBoxChange(pc)} // Ensure checkbox updates state
                          />
                        </td>
                        <td>{pc}</td>
                        <td>
                          <button onClick={() => handleRowTogglePC(pc)}>
                            {pcStates[pc]?.isOn ? 'Turn Off' : 'Turn On'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ComputerControl;
