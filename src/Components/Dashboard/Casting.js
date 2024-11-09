import React, { useEffect } from 'react';

// npm install video.js
// import videojs from 'video.js'; 
// import 'video.js/dist/video-js.css'; 
import './Casting.css';
import { API_BASE_URL } from './config';
import { useNavigate } from 'react-router-dom';

function Casting() {
  const navigate = useNavigate();

  const handleTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.log("Refresh token is missing.");
      return navigate('/');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        console.error('Failed to refresh token. Status:', response.status);
        return navigate('/');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  };

  const startStream = async() => {

  };

  const stopStream = async() => {
    
  };

  const viewStream = async() => {
    
  };

  return (
    <div className="casting">
      <div className="casting-container cont">
        <h1>Casting Controls</h1>
        <button onClick={startStream}>Start Streaming</button>
        <button onClick={stopStream}>Stop Streaming</button>
        <button onClick={viewStream}>View Stream</button>
        <div id="stream"></div>

        {/* <div className='casting-image'></div>
        <img src='https://example.com/casting-image.jpg' alt='Casting' /> */}

        <h2>View Client Screens</h2>
        <a href="{% url 'client_screens' %}">Go to Client Screens</a>
        
      </div>
    </div>
  );
}

export default Casting;
