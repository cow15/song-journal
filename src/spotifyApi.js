//import axios from 'axios';


//const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
//const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

const CLIENT_ID = '2514ea0db61d4058a61170d5cb0dd25b';
const CLIENT_SECRET = '5b900583089f4920a72fa762f2a34029';

let accessToken = null;

const getAccessToken = () => {
  return localStorage.getItem('spotify_token');
};

export const searchTrack = async (query) => {
  const token = localStorage.getItem('spotify_token');
  
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    
    if (data.tracks && data.tracks.items.length > 0) {
      const track = data.tracks.items[0];
      return {
        title: track.name,
        artist: track.artists[0].name,
        album: track.album.name,
        year: track.album.release_date.split('-')[0],
        album_art: track.album.images[0]?.url,
        preview_url: track.preview_url,
        link: track.external_urls.spotify,
        duration_ms: track.duration_ms,
        popularity: track.popularity,
        track_number: track.track_number,
        uri: track.uri
      };
    }
    return null;
  } catch (error) {
    console.error('Error searching track:', error);
    return null;
  }
};