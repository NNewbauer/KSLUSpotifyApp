import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Client';
import Callback from './components/Callback';
import SpotifyData from './components/SpotifyData';
import Playlists from './components/Playlists';
import PlaylistData from './components/PlaylistData';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/spotify-data" element={<SpotifyData />} />
                <Route path="/playlists" element={<Playlists />} />
                <Route path="/playlist-data/:id" element={<PlaylistData />} />
            </Routes>
        </Router>
    );
}

export default App;