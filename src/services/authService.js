const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const CLIENT_ID = '2514ea0db61d4058a61170d5cb0dd25b'; // Your existing client ID
const REDIRECT_URI = window.location.origin + '/callback';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'user-top-read',
  'user-read-recently-played'
];

export const loginWithSpotify = () => {
  window.location.href = `${SPOTIFY_AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES.join('%20')}&response_type=token&show_dialog=true`;
};

export const getTokenFromUrl = () => {
  const hash = window.location.hash;
  console.log('Processing hash:', hash);
  
  if (!hash || hash.length < 2) return null;
  
  const stringAfterHashtag = hash.substring(1);
  const paramsInUrl = stringAfterHashtag.split('&');
  const paramsSplit = paramsInUrl.reduce((acc, currentValue) => {
    const [key, value] = currentValue.split('=');
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
  
  console.log('Parsed token data:', paramsSplit);
  return paramsSplit;
};

export const checkAuth = () => {
  const token = localStorage.getItem('spotify_token');
  console.log('Checking auth, token exists:', !!token);
  
  if (!token) return false;
  
  // Check if token is expired
  const expiryTime = localStorage.getItem('spotify_token_expiry');
  if (expiryTime && new Date().getTime() > parseInt(expiryTime)) {
    console.log('Token expired');
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiry');
    return false;
  }
  
  return true;
}; 