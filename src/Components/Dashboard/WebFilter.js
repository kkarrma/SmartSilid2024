import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './BASE_URL';
import './WebFilter.css';
import { useNavigate } from 'react-router-dom';
import AlertModal from './AlertModal';

function WebFilter() {
  const [blockedURLs, setBlockedURLs] = useState([]);
  const [newBlockURL, setNewBlockURL] = useState('');
  const [urlFormVisible, setUrlFormVisible] = useState(false);
  const Navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmCallback, setModalConfirmCallback] = useState(null);
  const showAlertModal = (message, onConfirm) => {
    setModalMessage(message);
    setModalConfirmCallback(() => onConfirm);
    setIsModalOpen(true); 
  };

  const handleTokenRefresh = async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken === null) {
      // console.log("Refresh token is missing.");
      // return Navigate("/");
      return 0;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }), 
      });

      if (!response.ok) {
        console.error('Failed to refresh token. Status:', response.status);
        // return Navigate("/");
        return 0;
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      return 1;
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

      if(response.status === 401) {
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return fetchURLs();
        }
      }

      if (!response.ok) throw new Error('Failed to fetch URLs');
      
      const data = await response.json();

      if (Array.isArray(data.url)) {
        setBlockedURLs(data.url); 
        // console.log('Updated URL list:', data.url);
      } else {
        console.error('Invalid data format: expected an array in "url" field, received:', data);
        setBlockedURLs([]);
      }
    } catch (error) {
      if (error instanceof Error) {
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
    setLoading(true);

    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/add_url_block`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url: newBlockURL }),
      });

      if(response.status === 401) {
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleAddURL();
        }
      }

      if (!response.ok) {
        console.error('Failed to add URL'); 
      } else {
        // console.log('URL added successfully!');
        return showAlertModal('URL added successfully!', () =>{
          setIsModalOpen(false);
          setLoading(false);
          setNewBlockURL('');
          setUrlFormVisible(false);
          fetchURLs(); 
        }); 
      }
      
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error adding URL:', error.message || error);
        console.error('Failed to add URL. Please try again.');
      } else {
        console.error('Unexpected error:', error);
        showAlertModal('Unexpected error occurred. Please try again.', () => setIsModalOpen(false));
      }
    }

  };

  const handleDeleteURL = async (url) => {
    setLoading(true);
    // showAlertModal('Are you sure you want to remove this URL?', () => setIsModalOpen(false));

    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await fetch(`${API_BASE_URL}/delete_url_block`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ url }),
      });

      if(response.status === 401) {
        const failedRefresh = await handleTokenRefresh();

        if ( failedRefresh === 0){
          Navigate("/");
          window.location.reload();
        }
        else {
          return handleDeleteURL(url);
        }
      }

      // if (!response.ok) throw new Error('Failed to delete URL');

      const data = await response.json();
      console.log(data);
      if (data.status_message) {
        showAlertModal(data.status_message, 
          () => {
            setIsModalOpen(false)
            fetchURLs(); 
            setLoading(false);
          }
        );
      } else {
        showAlertModal('Failed to delete URL. Please try again.', 
          () => {
            setIsModalOpen(false)
            fetchURLs(); 
            setLoading(false);
          }
        );
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error('Error deleting URL:', error.message || error);
        console.error('Failed to delete URL. Please try again.');
      } else {
        console.error('Unexpected error:', error);
        showAlertModal('Unexpected error occurred. Please try again.', () => setIsModalOpen(false));
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
            <>
              <h3 classame="cont-title">URL Block Form</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                showAlertModal('Are you sure you want to add this URL? This will be blocked once the computers restart.',
                handleAddURL)
              }
              }>
                <div className="new-url-form">
                  <input
                    className="url-input"
                    type="text"
                    value={newBlockURL}
                    onChange={(e) => setNewBlockURL(e.target.value)}
                    placeholder="https://www.sample.com/"
                    required
                  />
                  <button type="submit" className="confirm-btn">
                    Add URL
                  </button>
                  <button className="cancel-btn" onClick={() => setUrlFormVisible(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            <button className="add-url-btn" onClick={() => setUrlFormVisible(true)}>
              Add URL
            </button>
          )}
        </div>

        <div className="web-table cont">
          <h3 className="cont-title">Blocked URL List</h3>
          <form className="block-list">
            <table>
              <thead>
                <tr>
                  <th>URLs</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {blockedURLs.length === 0 ? (
                  <tr>
                    <td colSpan="2">
                      <p className="no-fetch-msg">No blocked URLs found.</p>
                    </td>
                  </tr>
                ) : (
                  blockedURLs.map((url, index) => (
                    <tr key={index}>
                      <td className="url">{url}</td>
                      <td className="action">
                        <button 
                          type="button" 
                          className="del-btn" 
                          onClick={(e) => {
                            e.preventDefault();
                            showAlertModal('Are you sure you want to remove this URL from the Blocked List?',
                              () => {
                                // setIsModalOpen(false);
                                handleDeleteURL(url)
                              }
                            )
                          }}
                        >
                          <i className="fa fa-trash"></i>
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

      <AlertModal
        message={modalMessage}
        onConfirm={modalConfirmCallback} 
        onCancel={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
      />
    </>
  );
}

export default WebFilter;
