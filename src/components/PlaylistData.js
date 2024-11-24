import React, { useState, useEffect } from 'react';
import '../styles.css';
import { useParams } from 'react-router-dom';

const PlaylistData = () => {
  const { id } = useParams();  // Retrieve the playlist ID from the URL params
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [artistPopularity, setArtistPopularity] = useState({});

  // Fetch artist popularity data
  const fetchArtistPopularity = async (artistId) => {
    const token = localStorage.getItem('spotifyToken');  // Assuming you have the access token stored
    
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

      setArtistPopularity((prevState) => ({
        ...prevState,
        [artistId]: popularity,  // Save the popularity of this artist by their ID
      }));
    } catch (error) {
      console.error('Error fetching artist popularity:', error);
    }
  };

  const getSongGenres = async (trackId, token) => {
    try {
        // Step 1: Get track details
        const trackDetails = await getTrackDetails(trackId, token);
        const artists = trackDetails.artists;

        // Step 2: Fetch genres for each artist
        const genrePromises = artists.map((artist) => getArtistGenres(artist.id, token));
        const genresPerArtist = await Promise.all(genrePromises);

        // Step 3: Combine all genres
        const allGenres = genresPerArtist.flat();
        const uniqueGenres = [...new Set(allGenres)]; // Remove duplicates

        return uniqueGenres;
    } catch (error) {
        console.error('Error fetching song genres:', error);
        throw error;
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
        setPlaylist(data);  // Set the playlist data in state

        // Fetch popularity for each artist in the playlist immediately
        data.tracks.items.forEach((trackItem) => {
          trackItem.track.artists.forEach((artist) => {
            if (!artistPopularity[artist.id]) {
              fetchArtistPopularity(artist.id);  // Immediately fetch the popularity of the artist
            }
          });
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
              src={trackItem.track.album.images[0].url} // Get the largest image (usually index 0)
              alt={trackItem.track.album.name}
              style={{ width: 200, height: 200 }}
            />
          <p><b>{trackItem.track.name}</b></p>
          {trackItem.track.artists.map((artist) => (
            <p key={artist.id}>
              <b>{artist.name}</b> – Popularity Score: {artistPopularity[artist.id] !== undefined ? artistPopularity[artist.id] : 'Loading...'}
              Followers: {artist.followers.total}
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