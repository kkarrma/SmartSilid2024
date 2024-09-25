import React, { useState, useEffect } from 'react';
import './WebFilter.css';

function WebFilter() {
  const [blockedURLs, setBlockedURLs] = useState([]);
  const [newBlockURL, setNewBlockURL] = useState('');
  const [urlFormVisible, setUrlFormVisible] = useState(false);

  const fetchURLs = async () => {
    try {
      const response = await fetch('http://192.168.10.112:8000/get_url_block');
      if (!response.ok) throw new Error('Failed to fetch URLs');
      const data = await response.json();
      setBlockedURLs(data); // Assuming the response is an array of URLs
    } catch (error) {
      console.error('Error fetching URLs:', error);
      alert('Failed to load blocked URLs. Please try again.');
    }
  };

  const handleAddURL = async () => {
    const confirmAdd = window.confirm(`Are you sure you want to add ${newBlockURL}?`);
    if (!confirmAdd) return;

    try {
      const response = await fetch('http://192.168.10.112:8000/add_url_block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newBlockURL }),
      });
      if (!response.ok) throw new Error('Failed to add URL');

      setBlockedURLs((prev) => [...prev, newBlockURL]); // Update state with the new URL
      setNewBlockURL(''); // Clear the input
      setUrlFormVisible(false);
    } catch (error) {
      console.error('Error adding URL:', error);
      alert('Failed to add URL. Please try again.');
    }
  };

  const handleDeleteURL = async (url) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${url}?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch('http://192.168.10.112:8000/delete_url_block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error('Failed to delete URL');

      setBlockedURLs((prev) => prev.filter((blockedURL) => blockedURL !== url)); // Update state
    } catch (error) {
      console.error('Error deleting URL:', error);
      alert('Failed to delete URL. Please try again.');
    }
  };

  useEffect(() => {
    fetchURLs();
  }, []);

  return (
    <>
      <div className="urlBlock-form">
        {urlFormVisible ? (
          <div className="new-section-form">
            <input
              className="sect-input"
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
            <i className="fa-solid fa-plus"></i> Add URL
          </button>
        )}
      </div>

      <div className="web-table">
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
                    <td className="last-name">{url}</td>
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
    </>
  );
}

export default WebFilter;
