import React, { useState, useEffect } from 'react';
import '../styles.css';
import { useNavigate } from 'react-router-dom';

const Playlists = ({ accessToken }) => {
const [playlists, setPlaylists] = useState([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();

const handlePlaylistData = (playlistId) => {
    navigate(`/playlist-data/${playlistId}`);
};

useEffect(() => {
    const fetchPlaylists = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem('spotifyToken');
    if (!accessToken) {
        alert('No access token found');
        setLoading(false);
        return;
    }

    try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        });

        if (!response.ok) {
        const errorData = await response.json();
        alert('Spotify API Error:', errorData);
        setLoading(false);
        return;
        }

        const data = await response.json();
        setPlaylists(data.items || []);
    } catch (error) {
        alert('Error fetching playlists:', error);
    } finally {
        setLoading(false);
    }
    };

    fetchPlaylists();
}, [accessToken]);

if (loading) {
    return <p>Loading playlists...</p>;
}

return (
    <div>
    {playlists.length > 0 ? (
        playlists.map((playlist) => (
        <div>
            <button onClick={() => handlePlaylistData(playlist.id)}> {playlist.name} </button>
        </div>
        ))
    ) : (
        <p>No playlists found</p>
    )}
    </div>
);
};

export default Playlists;