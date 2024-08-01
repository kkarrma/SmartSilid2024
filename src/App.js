import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './Components/LoginForm/LoginForm';
import Dashboard from './Components/Dashboard/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LoginForm />} />
        <Route exact path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
