import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_SUPABASE_URL,
  headers: {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
});
