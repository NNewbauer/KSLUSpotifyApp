import React, { useState, useEffect } from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';

const SpotifyData = () => {
    const [userData, setUserData] = useState(null);
    const token = localStorage.getItem('spotifyToken'); // Retrieve the token
    const navigate = useNavigate();

    const handlePlaylist = async () => {
        navigate('/playlists');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setUserData(data);
            } catch (error) {
                console.error('Error fetching Spotify data:', error);
            }
        };

        if (token) {
            fetchData();
        }
    }, [token]);

    if (!userData) {
        return <p>Loading user data...</p>;
    }

    return (
        <div>
            <h1>Welcome, {userData.display_name}</h1>
            <p>Email: {userData.email}</p>
            <p>Country: {userData.country}</p>
            <p>Account Type: {userData.product}</p>
            <button onClick={handlePlaylist}>Playlists</button>
        </div>
    );
};

export default SpotifyData;