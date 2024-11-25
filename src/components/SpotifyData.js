import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyData = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // Add a loading state
    const token = localStorage.getItem('spotifyToken');
    const navigate = useNavigate();

    const fetchUserData = async () => {
        console.log('Token available:', !!token);
        if (!token) {
            console.log('No token found, redirecting to login...');
            navigate('/');
            return;
        }

        try {
            console.log('Making request with token:', `Bearer ${token.substring(0, 20)}...`);

            const response = await fetch('https://api.spotify.com/v1/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Error response:', errorData);

                if (response.status === 401) {
                    console.log('Token expired or invalid, clearing and redirecting...');
                    localStorage.removeItem('spotifyToken');
                    navigate('/');
                    return;
                } else if (response.status === 403) {
                    setError('Insufficient permissions to access user data.');
                    return;
                }

                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log('User data received:', data);
            setUserData(data);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message || 'Failed to fetch user data');
        } finally {
            setLoading(false); // Ensure loading state is updated
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [token, navigate]);

    if (!token) {
        return <p>No authentication token found. Redirecting to login...</p>;
    }

    if (loading) {
        return <p>Loading user data...</p>;
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
        return <p>No user data available.</p>;
    }

    return (
        <div>
            <h1>Welcome, {userData.display_name}</h1>
            <p>Email: {userData.email}</p>
            <p>Country: {userData.country}</p>
            <p>Account Type: {userData.product}</p>
            <button onClick={() => navigate('/playlists')}>View Playlists</button>
            <button
                onClick={() => {
                    localStorage.removeItem('spotifyToken');
                    navigate('/');
                }}
            >
                Logout
            </button>
        </div>
    );
};

export default SpotifyData;