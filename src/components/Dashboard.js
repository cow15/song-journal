import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

const TrackRow = ({ track, isPlaying, onPlayPause }) => (
  <div className="track-row">
    <img 
      src={track.album.images[2]?.url} 
      alt={track.album.name}
      className="track-album-art"
    />
    <div className="track-info">
      <span className="track-name">{track.name}</span>
      <span className="track-artist">{track.artists[0].name}</span>
    </div>
    <button 
      className="play-button" 
      onClick={() => onPlayPause(track.preview_url)}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? "⏸" : "▶"}
    </button>
  </div>
);

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [recentHistory, setRecentHistory] = useState({
    tracks: [],
    playStats: {}
  });
  const [show24Hours, setShow24Hours] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('spotify_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      try {
        // Fetch all data in parallel
        const [
          profileRes,
          topTracksRes,
          topArtistsRes,
          recentRes,
          playlistsRes,
          nowPlayingRes
        ] = await Promise.all([
          fetch('https://api.spotify.com/v1/me', { headers }),
          fetch('https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term', { headers }),
          fetch('https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term', { headers }),
          fetch('https://api.spotify.com/v1/me/player/recently-played?limit=5', { headers }),
          fetch('https://api.spotify.com/v1/me/playlists?limit=5', { headers }),
          fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers })
        ]);

        const [
          profileData,
          topTracksData,
          topArtistsData,
          recentData,
          playlistsData
        ] = await Promise.all([
          profileRes.json(),
          topTracksRes.json(),
          topArtistsRes.json(),
          recentRes.json(),
          playlistsRes.json()
        ]);

        setProfile(profileData);
        setTopTracks(topTracksData.items);
        setTopArtists(topArtistsData.items);
        setRecentTracks(recentData.items);
        setPlaylists(playlistsData.items);

        if (nowPlayingRes.status === 200) {
          const nowPlayingData = await nowPlayingRes.json();
          setCurrentlyPlaying(nowPlayingData);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchRecentHistory = async () => {
      const token = localStorage.getItem('spotify_token');
      try {
        // Get maximum allowed recent tracks (50)
        const response = await fetch(
          'https://api.spotify.com/v1/me/player/recently-played?limit=50',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const data = await response.json();
        
        // Process tracks to count plays
        const playStats = data.items.reduce((acc, item) => {
          const trackId = item.track.id;
          const trackInfo = {
            name: item.track.name,
            artist: item.track.artists[0].name,
            albumArt: item.track.album.images[2].url,
            lastPlayed: item.played_at,
            count: (acc[trackId]?.count || 0) + 1
          };
          
          acc[trackId] = trackInfo;
          return acc;
        }, {});

        // Convert to array and sort by play count
        const sortedTracks = Object.entries(playStats)
          .map(([id, info]) => ({
            id,
            ...info
          }))
          .sort((a, b) => b.count - a.count);

        setRecentHistory({
          tracks: sortedTracks,
          playStats: playStats
        });

      } catch (error) {
        console.error('Error fetching recent history:', error);
      }
    };

    fetchRecentHistory();
  }, []);

  const handlePlayPause = (previewUrl) => {
    if (audioRef.current.src === previewUrl) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setCurrentlyPlaying(previewUrl);
      } else {
        audioRef.current.pause();
        setCurrentlyPlaying(null);
      }
    } else {
      audioRef.current.src = previewUrl;
      audioRef.current.play();
      setCurrentlyPlaying(previewUrl);
    }
  };

  // Add event listener for when audio finishes
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setCurrentlyPlaying(null);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const getFilteredRecentTracks = () => {
    if (!show24Hours) return recentTracks.slice(0, 5);
    
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return recentTracks.filter(item => 
      new Date(item.played_at) > last24Hours
    );
  };

  if (loading) return <div className="dashboard-loading">Loading your musical profile...</div>;

  return (
    <div className="dashboard">
      <header className="profile-header">
        <img 
          src={profile?.images?.[0]?.url} 
          alt={profile?.display_name}
          className="profile-image"
        />
        <h1>{profile?.display_name?.toUpperCase()}</h1>
        <div className="profile-stats">
          <span>{profile?.followers?.total} Followers</span>
          {profile?.country && <span>· {profile?.country}</span>}
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Top Tracks */}
        <div className="dashboard-section">
          <h2 className="section-title">YOUR TOP TRACKS</h2>
          <div className="tracks-container">
            {topTracks.map(track => (
              <TrackRow 
                key={track.id} 
                track={track} 
                isPlaying={currentlyPlaying === track.preview_url}
                onPlayPause={handlePlayPause}
              />
            ))}
          </div>
        </div>

        {/* Top Artists */}
        <div className="dashboard-section">
          <h2 className="section-title">TOP ARTISTS</h2>
          <div className="artists-grid">
            {topArtists.map(artist => (
              <div key={artist.id} className="artist-card">
                <img 
                  src={artist.images[1]?.url} 
                  alt={artist.name}
                  className="artist-image"
                />
                <div className="artist-name">{artist.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Listens */}
        <div className="dashboard-section">
          <h2 className="section-title">RECENT LISTENS</h2>
          <div className="tracks-container">
            {recentTracks.map(item => (
              <div key={item.played_at} className="track-row">
                <img 
                  src={item.track.album.images[2]?.url}
                  alt={item.track.album.name}
                  className="track-album-art"
                />
                <div className="track-info">
                  <div className="track-name">{item.track.name}</div>
                  <div className="track-artist">{item.track.artists[0].name}</div>
                  <div className="timestamp">{formatTimestamp(item.played_at)}</div>
                </div>
                <button 
                  className="play-button"
                  onClick={() => handlePlayPause(item.track.preview_url)}
                >
                  ▶
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 