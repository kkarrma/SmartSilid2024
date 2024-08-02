import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginForm from './Components/LoginForm/LoginForm';
import SignupForm from './Components/LoginForm/SignupForm';
import ForgotPassword from './Components/LoginForm/ForgotPassword';
import ResetPassword from './Components/LoginForm/ResetPassword';
import Dashboard from './Components/Dashboard/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LoginForm />} />
        <Route exact path="/signup" element={<SignupForm />} />
        <Route exact path="/forgot-password" element={<ForgotPassword />} />
        <Route exact path="/reset-password" element={<ResetPassword />} />
        <Route exact path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
