import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyData = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('spotifyToken');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            // Debug: Check if we have a token
            console.log('Token available:', !!token);
            if (!token) {
                console.log('No token found, redirecting to login...');
                navigate('/');
                return;
            }

            try {
                // Debug: Log the request headers
                console.log('Making request with token:', `Bearer ${token.substring(0, 20)}...`);
                
                const response = await fetch('https://api.spotify.com/v1/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                // Debug: Log the response status
                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Error response:', errorData);
                    
                    if (response.status === 401) {
                        console.log('Token expired or invalid, clearing and redirecting...');
                        localStorage.removeItem('spotifyToken');
                        navigate('/');
                        return;
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('User data received:', data);
                setUserData(data);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            }
        };

        fetchUserData();
    }, [token, navigate]);

    if (!token) {
        return <p>No authentication token found. Redirecting to login...</p>;
    }

    if (error) {
        return (
            <div>
                <p>Error: {error}</p>
                <button onClick={() => navigate('/')}>Return to Login</button>
            </div>
        );
    }

    if (!userData) {
        return <p>Loading user data...</p>;
    }

    return (
        <div>
            <h1>Welcome, {userData.display_name}</h1>
            <p>Email: {userData.email}</p>
            <p>Country: {userData.country}</p>
            <p>Account Type: {userData.product}</p>
            <button onClick={() => navigate('/playlists')}>View Playlists</button>
            <button onClick={() => {
                localStorage.removeItem('spotifyToken');
                navigate('/');
            }}>Logout</button>
        </div>
    );
};

export default SpotifyData;