import React from 'react';

const CLIENT_ID = '8572ae1ee0a344a08239363554aaaf86';
const REDIRECT_URI = 'http://localhost:3000/callback';
const SCOPES = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-modify-public',
];
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES.join('%20')}`;
const Login = () => {
    const handleLogin = () => {
        window.location.href = AUTH_URL;
    };

    return (
        <div>
            <h1>Spotify React App</h1>
            <button onClick={handleLogin}>Log in with Spotify</button>
        </div>
    );
};

export default Login;