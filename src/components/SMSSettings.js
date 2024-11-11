import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const SMSSettings = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(false);
  const { user } = useUser();

  const handleSave = async () => {
    const { error } = await supabase
      .from('users')
      .update({
        phone_number: phoneNumber,
        sms_enabled: smsEnabled
      })
      .eq('id', user.id);

    if (!error) {
      toast.success('SMS settings updated!');
    }
  };

  return (
    <div className="sms-settings">
      <h2>Weekly SMS Reminders</h2>
      <div className="form-group">
        <label>Phone Number</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1234567890"
        />
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={smsEnabled}
            onChange={(e) => setSmsEnabled(e.target.checked)}
          />
          Enable weekly song suggestions
        </label>
      </div>
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
};

export default SMSSettings; 