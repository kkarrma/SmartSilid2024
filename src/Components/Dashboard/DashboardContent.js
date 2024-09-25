import React, { useState, useEffect } from 'react';
import './DashboardContent.css';

function Dashboard() {
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

  // const handleTogglePC = (pc) => {
  //   setPcStates((prevState) => ({
  //     ...prevState,
  //     [pc]: { ...prevState[pc], isOn: !prevState[pc].isOn },
  //   }));
  // };

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

  const handleRowTogglePC = (pc, turnOn) => {
    setPcStates((prevState) => ({
      ...prevState,
      [pc]: { ...prevState[pc], isOn: turnOn },
    }));

    if (turnOn) {
      wakenPC([pc]);
    } else {
      shutdownPC([pc]);
    }
  };

  return (
    <>
      <div className="controls-row">
        <select onChange={handleSelectPC} value="">
          <option value="">Select a PC</option>
          {pcs.map((pc) => (
            <option
              key={pc}
              value={pc}
              style={{ 
                color: pcStates[pc]?.isOn ? 'green' : 'black', 
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
        >
          Turn On
        </button>
        <button
          type="button"
          onClick={() => handleToggleSelectedPCs(false)}
        >
          Turn Off
        </button>
      </div>

      <div className="dash-table">
        <form>
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>PC Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pcs.map((pc) => (
                <tr key={pc}>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={pcStates[pc]?.isChecked}
                      onChange={() => handleCheckBoxChange(pc)}
                    />
                  </td>
                  <td className="pc#">{pc}</td>
                  <td className="action">
                    <button
                      type="button"
                      className={`on-btn ${pcStates[pc]?.isOn ? 'disabled' : ''}`}
                      onClick={() => handleRowTogglePC(pc, true)}
                      disabled={pcStates[pc]?.isOn}
                    >
                      {/* <i className="fa-solid fa-person-military-pointing"></i> */}
                      ON
                    </button>
                    <button
                      type="button"
                      className={`off-btn ${!pcStates[pc]?.isOn ? 'disabled' : ''}`}
                      onClick={() => handleRowTogglePC(pc, false)}
                      disabled={!pcStates[pc]?.isOn}
                    >
                      {/* <i className="fa-solid fa-person-military-rifle"></i> */}
                      OFF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </form>
      </div>
    </>
  );
}

export default Dashboard;
