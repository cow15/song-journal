//import axios from 'axios';


//const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
//const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

const CLIENT_ID = '2514ea0db61d4058a61170d5cb0dd25b';
const CLIENT_SECRET = '5b900583089f4920a72fa762f2a34029';

let accessToken = null;

const getAccessToken = async () => {
  if (accessToken) return accessToken;

  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await result.json();
  accessToken = data.access_token;
  return accessToken;
};

export const searchTrack = async (query) => {
  const token = await getAccessToken();
  
  const result = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });

  const data = await result.json();
  
  if (data.tracks.items.length > 0) {
    const track = data.tracks.items[0];
    return {
      title: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      year: track.album.release_date.split('-')[0],
      album_art: track.album.images[0].url,
      preview_url: track.preview_url
    };
  }
  
  return null;
};