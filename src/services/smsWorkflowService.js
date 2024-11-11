import { supabase } from '../supabaseClient';
import { getTopTracks } from './spotifyService';
import { sendSMS } from './smsService';

const WORKFLOW_STATES = {
  INITIAL: 'initial',
  SONG_SUGGESTED: 'song_suggested',
  SONG_CONFIRMED: 'song_confirmed',
  DESCRIPTION_PENDING: 'description_pending',
  COMPLETED: 'completed'
};

// Store active conversations
const activeConversations = new Map();

export const initiateWeeklySMS = async (userId) => {
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!user.sms_enabled || !user.phone_number) return;

  // Get recent tracks from Spotify
  const recentTracks = await getTopTracks(user.spotify_id, 'short_term', 3);
  
  const suggestions = recentTracks.map(track => 
    `${track.name} by ${track.artists[0].name}`
  ).join('\n');

  const message = `Hey! Time for your weekly song journal entry! Here are some suggestions based on your recent listening:\n\n${suggestions}\n\nWhat song would you like to add?`;
  
  await sendSMS(user.phone_number, message);
  
  // Initialize conversation state
  activeConversations.set(user.phone_number, {
    state: WORKFLOW_STATES.INITIAL,
    userId: user.id,
    suggestions: recentTracks
  });
};

export const handleSMSResponse = async (from, message) => {
  const conversation = activeConversations.get(from);
  if (!conversation) return;

  switch (conversation.state) {
    case WORKFLOW_STATES.INITIAL:
      // Search Spotify for the song
      const searchResults = await spotifyApi.searchTracks(message);
      const track = searchResults.tracks.items[0];
      
      if (track) {
        conversation.state = WORKFLOW_STATES.SONG_SUGGESTED;
        conversation.selectedTrack = track;
        
        await sendSMS(
          from, 
          `Is this the song you meant?\n${track.name} by ${track.artists[0].name}\n\nReply YES or NO`
        );
      } else {
        await sendSMS(
          from,
          "Sorry, I couldn't find that song. Can you try again?"
        );
      }
      break;

    case WORKFLOW_STATES.SONG_SUGGESTED:
      if (message.toLowerCase() === 'yes') {
        conversation.state = WORKFLOW_STATES.DESCRIPTION_PENDING;
        await sendSMS(
          from,
          "Great! What memory or thoughts would you like to associate with this song?"
        );
      } else {
        conversation.state = WORKFLOW_STATES.INITIAL;
        await sendSMS(
          from,
          "No problem. What song would you like to add?"
        );
      }
      break;

    case WORKFLOW_STATES.DESCRIPTION_PENDING:
      // Save to database
      await supabase.from('songs').insert({
        user_id: conversation.userId,
        title: conversation.selectedTrack.name,
        artist: conversation.selectedTrack.artists[0].name,
        album: conversation.selectedTrack.album.name,
        year: new Date(conversation.selectedTrack.album.release_date).getFullYear(),
        description: message,
        spotify_uri: conversation.selectedTrack.uri,
        album_art: conversation.selectedTrack.album.images[0].url,
        preview_url: conversation.selectedTrack.preview_url
      });

      conversation.state = WORKFLOW_STATES.COMPLETED;
      await sendSMS(
        from,
        "Perfect! Your song has been added to your journal. See you next week! 👋"
      );
      
      // Clean up conversation
      activeConversations.delete(from);
      break;
  }
}; 