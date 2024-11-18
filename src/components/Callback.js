import React, { useEffect } from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const hash = window.location.hash;
        if (hash) {
            const token = new URLSearchParams(hash.substring(1)).get('access_token');
            if (token) {
                localStorage.setItem('spotifyToken', token); // Store the token
                window.location.hash = ''; // Clear the hash
                navigate('/spotify-data'); // Redirect to Spotify data page
            }
        }
    }, [navigate]);

    return <p>Logging in...</p>;
};

export default Callback;