import React, { useState } from 'react';
import './DashboardContent.css';

function Dashboard() {
  const pcs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Example list of PCs
  const [pcStates, setPcStates] = useState(
    pcs.reduce((acc, pc) => ({ ...acc, [pc]: { isOn: false, isChecked: false } }), {})
  );
  const [selectAll, setSelectAll] = useState(false);
  const [selectedPCs, setSelectedPCs] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const handleTogglePC = (pc) => {
    setPcStates((prevState) => ({
      ...prevState,
      [pc]: { ...prevState[pc], isOn: !prevState[pc].isOn },
    }));
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
    const selectedPC = parseInt(event.target.value, 10);
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
      .map(pc => parseInt(pc.trim(), 10))
      .filter(pc => !isNaN(pc));
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
  };

  return (
    <>
      <div className="controls-row">
        <select onChange={handleSelectPC}>
          <option value="">Select a PC</option>
          {pcs.map((pc) => (
            <option
              key={pc}
              value={pc}
              style={{ color: pcStates[pc].isOn ? 'green' : 'black' }}
            >
              PC {pc}
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
                <th>PC#</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pcs.map((pc) => (
                <tr key={pc}>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={pcStates[pc].isChecked}
                      onChange={() => handleCheckBoxChange(pc)}
                    />
                  </td>
                  <td className="pc#">{pc}</td>
                  <td className="action">
                    <button
                      type="button"
                      className={`on-btn ${pcStates[pc].isOn ? 'disabled' : ''}`}
                      onClick={() => handleTogglePC(pc)}
                      disabled={pcStates[pc].isOn}
                    >
                      <i class="fa-solid fa-person-military-pointing"></i>
                    </button>
                    <button
                      type="button"
                      className={`off-btn ${!pcStates[pc].isOn ? 'disabled' : ''}`}
                      onClick={() => handleTogglePC(pc)}
                      disabled={!pcStates[pc].isOn}
                    >
                      <i class="fa-solid fa-person-military-rifle"></i>
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
