import cron from 'node-cron';
import { supabase } from '../supabaseClient';
import { initiateWeeklySMS } from './smsWorkflowService';

// Run every Sunday at 12:00 PM
export const startWeeklyCron = () => {
  cron.schedule('0 12 * * 0', async () => {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('sms_enabled', true);

    for (const user of users) {
      await initiateWeeklySMS(user.id);
    }
  });
}; 