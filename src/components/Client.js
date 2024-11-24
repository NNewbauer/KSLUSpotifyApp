import React from 'react';

const CLIENT_ID = '8572ae1ee0a344a08239363554aaaf86'; // Your Spotify Client ID
const REDIRECT_URI =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000/callback'
        : 'https://main.d2abiumeuj2ml0.amplifyapp.com/callback';
const SCOPES = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-modify-public',
];
const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${SCOPES.join('%20')}`;

const Login = () => {
    return (
        <div>
            <h1>Spotify React App</h1>
            <button onClick={() => window.location.href = AUTH_URL}>
                Log in with Spotify
            </button>
            <p>
                NOTE: Spotify login is required. Log in with the username/password associated with your Spotify account.
                Google, Facebook, and Apple logins are NOT supported.
            </p>
        </div>
    );
};

export default Login;