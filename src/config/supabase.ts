import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://veikpggorzyobrvdrgep.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlaWtwZ2dvcnp5b2JydmRyZ2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTAxMzEsImV4cCI6MjA4ODE4NjEzMX0.1ooEv-4vRfTBBjwNvcfXSI6HsukcJqNwop512fsNYSI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
