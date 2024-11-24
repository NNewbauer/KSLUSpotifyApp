import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_GATEWAY_URL = 'https://zuwcmz5l0j.execute-api.us-east-2.amazonaws.com/dev/authToken';

const Callback = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAccessToken = async (code) => {
            try {
                console.log('Starting token exchange with code:', code.substring(0, 10) + '...');
                
                const response = await fetch(API_GATEWAY_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code })
                });

                const responseText = await response.text();
                console.log('Raw response:', responseText);
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error('Failed to parse response:', e);
                    throw new Error('Invalid response format');
                }

                // Handle API Gateway wrapped response
                if (data.body) {
                    try {
                        data = JSON.parse(data.body);
                    } catch (e) {
                        console.error('Failed to parse response body:', e);
                        throw new Error('Invalid response body format');
                    }
                }

                // Check for errors in the response
                if (data.error) {
                    throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
                }

                // Validate access token
                if (!data.access_token) {
                    throw new Error('No access token in response');
                }

                // Store tokens
                localStorage.setItem('spotifyToken', data.access_token);
                if (data.refresh_token) {
                    localStorage.setItem('spotifyRefreshToken', data.refresh_token);
                }

                navigate('/spotify-data');
                
            } catch (err) {
                console.error('Token exchange error:', err);
                setError(err.message);
            }
        };

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
            setError('No authorization code provided');
            return;
        }

        fetchAccessToken(code);
    }, [navigate]);

    if (error) {
        return (
            <div>
                <h2>Authentication Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/')}>
                    Return to Login
                </button>
            </div>
        );
    }

    return <p>Authenticating with Spotify...</p>;
};

export default Callback;