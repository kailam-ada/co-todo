import { createClient } from '@supabase/supabase-js'

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables Supabase manquantes : renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans le fichier .env',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
