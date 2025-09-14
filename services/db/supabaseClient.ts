import { createClient } from '@supabase/supabase-js';

// For production environments like Vercel, these variables will be provided.
// For local development, you would typically use a .env file.
// To prevent the app from crashing in this sandboxed environment, we provide
// placeholder values and a warning if the real keys are missing.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder_key';

if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder_key') {
    console.warn(
`*********************************************************************************
* Supabase environment variables are not set. The app will not be able to       *
* connect to the database. Please provide SUPABASE_URL and SUPABASE_ANON_KEY.   *
* The application will display an error message in the UI.                      *
*********************************************************************************`
    );
}

// createClient doesn't throw on invalid credentials, but API calls will fail.
// These failures will be caught by the dataService and handled gracefully in the UI.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);