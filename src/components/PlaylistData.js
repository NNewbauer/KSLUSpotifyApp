import React, { useState, useEffect } from 'react';
import '../styles.css';
import { useParams } from 'react-router-dom';

const PlaylistData = () => {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [artistPopularity, setArtistPopularity] = useState({});
  const [trackGenres, setTrackGenres] = useState({});

  // Fetch artist popularity data
  const fetchArtistPopularity = async (artistId) => {
    const token = localStorage.getItem('spotifyToken');
    if (!token) return;

    try {
      const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch artist data');
      const data = await response.json();
      const { popularity, followers } = data;

      setArtistPopularity((prevState) => ({
        ...prevState,
        [artistId]: { popularity, followers: followers?.total || 0 },
      }));
    } catch (error) {
      console.error(`Error fetching artist popularity for ${artistId}:`, error);
    }
  };

  // Fetch genres for a track
  const fetchTrackGenres = async (trackId) => {
    const token = localStorage.getItem('spotifyToken');
    if (!token) return [];

    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch track data');
      const trackData = await response.json();

      const genrePromises = trackData.artists.map(async (artist) => {
        const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artist.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!artistResponse.ok) throw new Error('Failed to fetch artist data for genres');
        const artistData = await artistResponse.json();
        return artistData.genres || [];
      });

      const genresPerArtist = await Promise.all(genrePromises);
      const uniqueGenres = [...new Set(genresPerArtist.flat())];
      setTrackGenres((prevState) => ({
        ...prevState,
        [trackId]: uniqueGenres,
      }));
    } catch (error) {
      console.error(`Error fetching genres for track ${trackId}:`, error);
    }
  };

  useEffect(() => {
    const fetchPlaylistData = async () => {
      const token = localStorage.getItem('spotifyToken');
      if (!token) {
        alert('No access token found.');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch playlist data');
        const data = await response.json();
        setPlaylist(data);

        // Fetch artist popularity and track genres in parallel
        const popularityPromises = data.tracks.items.flatMap((trackItem) =>
          trackItem.track.artists.map((artist) => fetchArtistPopularity(artist.id))
        );

        const genrePromises = data.tracks.items.map((trackItem) =>
          fetchTrackGenres(trackItem.track.id)
        );

        await Promise.all([...popularityPromises, ...genrePromises]);
      } catch (error) {
        console.error('Error fetching playlist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistData();
  }, [id]);

  if (loading) return <p>Loading playlist data...</p>;

  return (
    <div>
      <h2>{playlist?.name}</h2>
      <p>{playlist?.description || 'No description available.'}</p>
      {playlist?.tracks.items.map((trackItem, index) => (
        <div key={index}>
          {trackItem.track.album.images?.[0]?.url && (
            <img
              src={trackItem.track.album.images[0].url}
              alt={trackItem.track.album.name || 'Album Cover'}
              style={{ width: 200, height: 200 }}
            />
          )}
          <p><b>{trackItem.track.name || 'Unknown Track'}</b></p>
          {trackItem.track.artists.map((artist) => (
            <p key={artist.id}>
              <b>{artist.name || 'Unknown Artist'}</b> – Popularity: {artistPopularity[artist.id]?.popularity || 'Loading...'}, 
              Followers: {artistPopularity[artist.id]?.followers || 'Loading...'}
            </p>
          ))}
          <p><b>Genres:</b> {trackGenres[trackItem.track.id]?.join(', ') || 'Loading...'}</p>

          {trackItem.track.preview_url ? (
            <audio controls className="audio-container">
              <source src={trackItem.track.preview_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <p>No preview available</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlaylistData;