import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lgsfohfpnjobzcsitiqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxnc2ZvaGZwbmpvYnpjc2l0aXFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzIxNDQ5NiwiZXhwIjoyMDQyNzkwNDk2fQ.QaD6nFB0wEhVzMLCqnZxkH_iImjXbgyEGSo_ZJ7qf2U';
export const supabase = createClient(supabaseUrl, supabaseKey);