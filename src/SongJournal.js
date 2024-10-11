import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { searchTrack } from './spotifyApi';
import './SongJournal.css';

const SongJournal = () => {
  const [songs, setSongs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [playingSong, setPlayingSong] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const audioRef = useRef(new Audio());

  useEffect(() => {
    fetchSongs();
    return () => {
      audioRef.current.pause();
    };
  }, [showArchived, sortOrder]);

  const fetchSongs = async () => {
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('is_archived', showArchived)
      .order('song_date', { ascending: sortOrder === 'asc' });

    if (error) {
      console.error('Error fetching songs:', error);
    } else {
      setSongs(data);
    }
  };

  const handleAddOrEdit = async (song) => {
    let data, error;
    if (song.id) {
      ({ data, error } = await supabase
        .from('songs')
        .update(song)
        .eq('id', song.id)
        .select());
    } else {
      ({ data, error } = await supabase
        .from('songs')
        .insert([song])
        .select());
    }

    if (error) {
      console.error('Error adding/editing song:', error);
    } else {
      fetchSongs();
      setIsModalOpen(false);
      setCurrentSong(null);
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('songs')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) {
      console.error('Error archiving song:', error);
    } else {
      fetchSongs();
    }
  };

  const handleRestore = async (id) => {
    const { error } = await supabase
      .from('songs')
      .update({ is_archived: false })
      .eq('id', id);

    if (error) {
      console.error('Error restoring song:', error);
    } else {
      fetchSongs();
    }
  };

  const togglePlay = (song) => {
    if (playingSong && playingSong.id === song.id) {
      audioRef.current.pause();
      setPlayingSong(null);
    } else {
      audioRef.current.src = song.preview_url;
      audioRef.current.play();
      setPlayingSong(song);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const SongModal = ({ isOpen, onClose, onSave, song }) => {
    const [formData, setFormData] = useState({
      song_date: new Date().toISOString().split('T')[0],
      title: '',
      artist: '',
      year: null,
      description: '',
      link: '',
      album_art: '',
      preview_url: ''
    });
    const [spotifySearch, setSpotifySearch] = useState('');
    const [spotifyResult, setSpotifyResult] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const modalAudioRef = useRef(new Audio());

    useEffect(() => {
      if (song) {
        setFormData({
          id: song.id,
          song_date: song.song_date || new Date().toISOString().split('T')[0],
          title: song.title || '',
          artist: song.artist || '',
          year: song.year || null,
          description: song.description || '',
          link: song.link || '',
          album_art: song.album_art || '',
          preview_url: song.preview_url || ''
        });
      } else {
        setFormData({
          song_date: new Date().toISOString().split('T')[0],
          title: '',
          artist: '',
          year: null,
          description: '',
          link: '',
          album_art: '',
          preview_url: ''
        });
      }
      return () => {
        modalAudioRef.current.pause();
      };
    }, [song]);

    useEffect(() => {
      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }, [onClose]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ ...formData, is_archived: false });
    };

    const handleSpotifySearch = async () => {
      if (spotifySearch.trim()) {
        const result = await searchTrack(spotifySearch);
        setSpotifyResult(result);
        setIsPlaying(false);
      }
    };

    const applySpotifyData = () => {
      if (spotifyResult) {
        setFormData(prev => ({
          ...prev,
          title: spotifyResult.title || '',
          artist: spotifyResult.artist || '',
          year: spotifyResult.year || '',
          album_art: spotifyResult.album_art || '',
          preview_url: spotifyResult.preview_url || '',
          link: spotifyResult.link || ''
        }));
        setSpotifyResult(null);
        setSpotifySearch('');
        setIsPlaying(false);
      }
    };

    const togglePreview = () => {
      if (isPlaying) {
        modalAudioRef.current.pause();
      } else if (spotifyResult && spotifyResult.preview_url) {
        modalAudioRef.current.src = spotifyResult.preview_url;
        modalAudioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    };

    if (!isOpen) return null;

    return (
      <div className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{song ? 'Edit Song' : 'Add New Song'}</h2>
            <button onClick={onClose} className="close-button">&times;</button>
          </div>
          <div className="spotify-search">
            <input
              value={spotifySearch}
              onChange={(e) => setSpotifySearch(e.target.value)}
              placeholder="Search Spotify for a song"
            />
            <button onClick={handleSpotifySearch}>Search</button>
          </div>
          {spotifyResult && (
            <div className="spotify-result">
              {spotifyResult.album_art && <img src={spotifyResult.album_art} alt="Album Art" />}
              <div className="spotify-result-text">
                <p><strong>{spotifyResult.title || 'Unknown Title'}</strong> by {spotifyResult.artist || 'Unknown Artist'}</p>
                <p>Album: {spotifyResult.album || 'Unknown Album'}</p>
                <p>Year: {spotifyResult.year || 'Unknown'}</p>
                {spotifyResult.link && (
                  <p>
                    <a href={spotifyResult.link} target="_blank" rel="noopener noreferrer">
                      Open Full Song in Spotify
                    </a>
                  </p>
                )}
                {spotifyResult.duration_ms && (
                  <p>Duration: {Math.floor(spotifyResult.duration_ms / 60000)}:{((spotifyResult.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}</p>
                )}
                {spotifyResult.popularity !== undefined && <p>Popularity: {spotifyResult.popularity}</p>}
                {spotifyResult.track_number && <p>Track Number: {spotifyResult.track_number}</p>}
                {spotifyResult.explicit !== undefined && <p>Explicit: {spotifyResult.explicit ? 'Yes' : 'No'}</p>}
                {spotifyResult.uri && <p>Spotify URI: {spotifyResult.uri}</p>}
              </div>
              <div className="spotify-buttons">
                {spotifyResult.preview_url && (
                  <button onClick={togglePreview} className="preview-button">
                    {isPlaying ? '⏸️ Pause Preview' : '▶️ Play Preview'}
                  </button>
                )}
                <button onClick={applySpotifyData}>Use This Data</button>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="modal-form">
            <input
              name="song_date"
              value={formData.song_date}
              onChange={handleChange}
              type="date"
              required
            />
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Song Title"
              required
            />
            <input
              name="artist"
              value={formData.artist}
              onChange={handleChange}
              placeholder="Artist"
              required
            />
            <input
              name="year"
              value={formData.year || ''}
              onChange={handleChange}
              placeholder="Year"
              type="number"
              required
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              required
            />
            <input
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="Full Song Link"
            />
            <input
              name="album_art"
              value={formData.album_art}
              onChange={handleChange}
              placeholder="Album Art URL"
            />
            <input
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="Full Song Link"
            />
            <input
              name="preview_url"
              value={formData.preview_url}
              onChange={handleChange}
              placeholder="Preview URL"
            />
            <div className="modal-buttons">
              <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
              <button type="submit" className="save-button">Save</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="song-journal">
      <h1>Song Journal</h1>
      <div className="table-controls">
        <button onClick={() => setShowArchived(!showArchived)} className="archive-toggle">
          {showArchived ? 'Show Active Songs' : 'Show Archived Songs'}
        </button>
        <button onClick={() => {
          setCurrentSong(null);
          setIsModalOpen(true);
        }} className="add-song-button">Add New Song</button>
      </div>

      {/* Table view for larger screens */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="date-column" onClick={toggleSortOrder}>
                Date {sortOrder === 'asc' ? '▲' : '▼'}
              </th>
              <th className="album-art-column">Album Art</th>
              <th className="preview-column">Preview</th>
              <th className="title-column">Title</th>
              <th className="artist-column">Artist</th>
              <th className="year-column">Year</th>
              <th className="description-column">Description</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id}>
                <td className="date-column">{formatDate(song.song_date)}</td>
                <td className="album-art-column">
                  {song.album_art && <img src={song.album_art} alt="Album Art" className="album-art" />}
                </td>
                <td className="preview-column">
                  {song.preview_url && (
                    <button onClick={() => togglePlay(song)} className="preview-button">
                      {playingSong && playingSong.id === song.id ? '⏸️' : '▶️'}
                    </button>
                  )}
                </td>
                <td className="title-column">
                  {song.link ? (
                    <a href={song.link} target="_blank" rel="noopener noreferrer">
                      {song.title}
                    </a>
                  ) : (
                    song.title
                  )}
                </td>
                <td className="artist-column">{song.artist}</td>
                <td className="year-column">{song.year}</td>
                <td className="description-column">{song.description}</td>
                <td className="actions-column">
                  <div className="action-buttons">
                    {showArchived ? (
                      <button onClick={() => handleRestore(song.id)} className="icon-button">↩️</button>
                    ) : (
                      <>
                        <button onClick={() => { setCurrentSong(song); setIsModalOpen(true); }} className="icon-button">✏️</button>
                        <button onClick={() => handleDelete(song.id)} className="icon-button">🗑️</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card view for small screens */}
      <div className="card-container">
        {songs.map((song) => (
          <div key={song.id} className="song-card">
            <div className="song-card-header">
              <h3 className="song-card-title">
                {song.link ? (
                  <a href={song.link} target="_blank" rel="noopener noreferrer">
                    {song.title}
                  </a>
                ) : (
                  song.title
                )}
              </h3>
              <span className="song-card-date">{formatDate(song.song_date)}</span>
            </div>
            <p className="song-card-artist">{song.artist}</p>
            <div className="song-card-details">
              {song.album_art && <img src={song.album_art} alt="Album Art" className="song-card-album-art" />}
              <div className="song-card-info">
                <p className="song-card-year">Year: {song.year}</p>
                <div className="song-card-description-box">
                  <p className="song-card-description">{song.description}</p>
                </div>
              </div>
            </div>
            <div className="song-card-actions">
              {song.preview_url && (
                <button onClick={() => togglePlay(song)} className="preview-button">
                  {playingSong && playingSong.id === song.id ? '⏸️' : '▶️'}
                </button>
              )}
              <div>
                {showArchived ? (
                  <button onClick={() => handleRestore(song.id)} className="icon-button">↩️ Restore</button>
                ) : (
                  <>
                    <button onClick={() => { setCurrentSong(song); setIsModalOpen(true); }} className="icon-button">✏️ Edit</button>
                    <button onClick={() => handleDelete(song.id)} className="icon-button">🗑️ Archive</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <SongModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentSong(null);
        }}
        onSave={handleAddOrEdit}
        song={currentSong}
      />
    </div>
  );
};

export default SongJournal;