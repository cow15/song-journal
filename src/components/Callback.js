import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenFromUrl } from '../services/authService';
import { supabase } from '../supabaseClient';

const Callback = ({ setAuth }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const params = getTokenFromUrl();
      
      if (params && params.access_token) {
        try {
          localStorage.setItem('spotify_token', params.access_token);
          
          // Fetch Spotify profile
          const profileResponse = await fetch('https://api.spotify.com/v1/me', {
            headers: {
              'Authorization': `Bearer ${params.access_token}`
            }
          });
          const spotifyProfile = await profileResponse.json();
          console.log('Spotify profile fetched:', spotifyProfile);

          // First try to get existing user
          let { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('spotify_id', spotifyProfile.id)
            .single();

          if (existingUser) {
            console.log('Found existing user:', existingUser);
            localStorage.setItem('user_id', existingUser.id);
          } else {
            // Create new user if doesn't exist
            const { data: newUser, error: createError } = await supabase
              .from('users')
              .insert([{
                spotify_id: spotifyProfile.id,
                email: spotifyProfile.email,
                display_name: spotifyProfile.display_name,
                avatar_url: spotifyProfile.images?.[0]?.url || null
              }])
              .select()
              .single();

            if (createError) throw createError;
            
            console.log('Created new user:', newUser);
            localStorage.setItem('user_id', newUser.id);
          }

          setAuth(true);
          navigate('/journal');
          
        } catch (error) {
          console.error('Error in callback:', error);
          localStorage.clear();
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, setAuth]);

  return <div>Processing login...</div>;
};

export default Callback; 