import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginForm from './Components/LoginForm/LoginForm';
import SignupForm from './Components/LoginForm/SignupForm';
import ForgotPassword from './Components/LoginForm/ForgotPassword';
import ResetPassword from './Components/LoginForm/ResetPassword';
import Dashboard from './Components/Dashboard/Dashboard';
import UserPage from './Components/Dashboard/UserPage';

function App() {
  const accessToken = localStorage.getItem('accessToken');

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={accessToken ? <Navigate to="/dashboard" /> : <LoginForm />}
        />
        <Route
          path="/login"
          element={accessToken ? <Navigate to="/dashboard" /> : <LoginForm />}
        />
        <Route
          path="/signup"
          element={accessToken ? <Navigate to="/dashboard" /> : <SignupForm />}
        />
        <Route
          path="/forgot-password"
          element={accessToken ? <Navigate to="/dashboard" /> : <ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={accessToken ? <Navigate to="/dashboard" /> : <ResetPassword />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user-page" element={<UserPage />} />
      </Routes>
    </Router>
  );
}

export default App;
