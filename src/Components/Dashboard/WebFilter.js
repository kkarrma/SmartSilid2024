import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';
import './WebFilter.css';
import { useNavigate } from 'react-router-dom';

function WebFilter() {
  const [blockedURLs, setBlockedURLs] = useState([]);
  const [newBlockURL, setNewBlockURL] = useState('');
  const [urlFormVisible, setUrlFormVisible] = useState(false);
  const Navigate = useNavigate();

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

  const fetchURLs = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_BASE_URL}/get_url_block`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) throw new Error('Failed to fetch URLs');
      
      const data = await response.json();

      if (Array.isArray(data.url)) {
        setBlockedURLs(data.url); 
        console.log('Updated URL list:', data.url);
      } else {
        console.error('Invalid data format: expected an array in "url" field, received:', data);
        setBlockedURLs([]);
      }
    } catch (error) {
      if (error instanceof Error) {
        // Handle 401 error (unauthorized)
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
        }
        console.error('Error fetching URLs:', error.message || error);
        alert('Failed to load blocked URLs. Please try again.');
      } else {
        console.error('Unexpected error:', error);
        alert('Unexpected error occurred. Please try again.');
      }
      setBlockedURLs([]); 
    }
  };

  const handleAddURL = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const confirmAdd = window.confirm(`Are you sure you want to add ${newBlockURL}?`);
    if (!confirmAdd) return;

    try {
      const response = await fetch(`${API_BASE_URL}/add_url_block`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ url: newBlockURL }),
      });

      if (!response.ok) throw new Error('Failed to add URL');
      
      setNewBlockURL('');
      setUrlFormVisible(false);
      fetchURLs(); 
    } catch (error) {
      if (error instanceof Error) {
        // Handle 401 error (unauthorized)
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
        }
        console.error('Error adding URL:', error.message || error);
        alert('Failed to add URL. Please try again.');
      } else {
        console.error('Unexpected error:', error);
        alert('Unexpected error occurred. Please try again.');
      }
    }
  };

  const handleDeleteURL = async (url) => {
    const accessToken = localStorage.getItem('accessToken');
    const confirmDelete = window.confirm(`Are you sure you want to delete ${url}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/delete_url_block`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error('Failed to delete URL');

      fetchURLs(); 
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error deleting URL:', error.message || error);
        alert('Failed to delete URL. Please try again.');
      } else {
        console.error('Unexpected error:', error);
        alert('Unexpected error occurred. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchURLs();
  }, []);

  return (
    <>
      <div className='web-filter'>
        <div className="urlBlock-form cont">
          {urlFormVisible ? (
            <div className="new-url-form">
              <input
                className="url-input"
                type="text"
                value={newBlockURL}
                onChange={(e) => setNewBlockURL(e.target.value)}
                placeholder="https://www.sample.com/"
              />
              <button className="confirm-btn" onClick={handleAddURL}>
                Confirm
              </button>
              <button className="cancel-btn" onClick={() => setUrlFormVisible(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button className="add-url-btn" onClick={() => setUrlFormVisible(true)}>
              Add URL
            </button>
          )}
        </div>

        <div className="web-table cont">
          <form className="black-list">
            <table>
              <thead>
                <tr>
                  <th>URL Black List</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {blockedURLs.length === 0 ? (
                  <tr>
                    <td colSpan="2">No blocked URLs found</td>
                  </tr>
                ) : (
                  blockedURLs.map((url, index) => (
                    <tr key={index}>
                      <td className="url">{url}</td>
                      <td className="action">
                        <button type="button" className="del-btn" onClick={() => handleDeleteURL(url)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </form>
        </div>
      </div>
    </>
  );
}

export default WebFilter;
