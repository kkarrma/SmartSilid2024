import React, {useState, useEffect} from 'react';
import './FacultyRecord.css';

function FacultyRecord() {
  
  const [fristname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [middleinitial, setMiddleinitial] = useState('');
  const [rfid, setRfid] = useState('');

  return (
    <>
        <div>Faculty Record</div>
    </>
  )
  
}

export default FacultyRecord;