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
    
    if (!token) {
      alert('No access token found.');
      return;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      const popularity = data.popularity;  // Popularity of the artist
      const followers = data.followers;  // Number of followers of the artist

      setArtistPopularity((prevState) => ({
        ...prevState,
        [artistId]: {popularity, followers: followers.total} // Save the popularity of this artist by their ID
      }));
    } catch (error) {
      console.error('Error fetching artist popularity:', error);
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
      const trackData = await response.json();

      const genrePromises = trackData.artists.map(async (artist) => {
        const artistResponse = await fetch(`https://api.spotify.com/v1/artists/${artist.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const artistData = await artistResponse.json();
        return artistData.genres || [];
      });

      const genresPerArtist = await Promise.all(genrePromises);
      const uniqueGenres = [...new Set(genresPerArtist.flat())]; // Remove duplicates
      return uniqueGenres;
    } catch (error) {
      console.error('Error fetching track genres:', error);
      return [];
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert('Spotify API Error:', errorData);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setPlaylist(data);

        // Fetch popularity and genres for each track
        data.tracks.items.forEach(async (trackItem) => {
          trackItem.track.artists.forEach((artist) => {
            if (!artistPopularity[artist.id]) {
              fetchArtistPopularity(artist.id); // Fetch the popularity of the artist
            }
          });

          const trackId = trackItem.track.id;
          if (trackId && !trackGenres[trackId]) {
            const genres = await fetchTrackGenres(trackId);
            setTrackGenres((prevState) => ({
              ...prevState,
              [trackId]: genres,
            }));
          }
        });
      } catch (error) {
        alert('Error fetching playlist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistData();
  }, [id]);  // Only trigger this when the playlist ID changes (initial load)

  if (loading) {
    return <p>Loading playlist data...</p>;
  }

  return (
    <div>
      <h2>{playlist?.name}</h2>
      <p>{playlist?.description}</p>
      {playlist?.tracks.items.map((trackItem, index) => (
        <div key={index}>
          <img
              src={trackItem.track.album.images[0].url}
              alt={trackItem.track.album.name}
              style={{ width: 200, height: 200 }}
            />
          <p><b>{trackItem.track.name}</b></p>
          {trackItem.track.artists.map((artist) => (
            <p key={artist.id}>
              <b>{artist.name}</b> – Popularity Score: {artistPopularity[artist.id] !== undefined ? artistPopularity[artist.id] : 'Loading...'}
              Followers: {artistPopularity[artist.id] !== undefined ? artistPopularity[artist.id].followers : 'Loading...'}
            </p>
          ))}
          <p><b>Genres:</b> {trackGenres[trackItem.track.id]?.join(', ') || 'Loading...'} </p>

          {/* Audio player */}
          {trackItem.track.preview_url ? (
            <audio controls className='audio-container'>
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