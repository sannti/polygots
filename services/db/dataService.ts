import { supabase } from './supabaseClient';
import type { Card, Settings } from '../../types';

// NOTE TO USER:
// To support user authentication, your database schema needs to be updated.
//
// 1. `cards` table:
//    - Add a `user_id` column of type `uuid`.
//    - This column should be a foreign key referencing `auth.users(id)`.
//    - Example SQL: `alter table cards add column user_id uuid references auth.users(id);`
//
// 2. `user_settings` table:
//    - Remove the old `id` column.
//    - Add a `user_id` column of type `uuid` and set it as the PRIMARY KEY.
//    - This column should also be a foreign key referencing `auth.users(id)`.
//    - Example SQL:
//      `alter table user_settings drop column id;`
//      `alter table user_settings add column user_id uuid primary key references auth.users(id);`
//
// 3. Enable Row Level Security (RLS) on both tables.
//    - This is CRITICAL for security to ensure users can only access their own data.
//    - Example RLS Policy for `cards` table:
//      `create policy "Users can view their own cards." on cards for select using (auth.uid() = user_id);`
//      `create policy "Users can insert their own cards." on cards for insert with check (auth.uid() = user_id);`
//      `create policy "Users can update their own cards." on cards for update using (auth.uid() = user_id);`
//      `create policy "Users can delete their own cards." on cards for delete using (auth.uid() = user_id);`
//    - Apply similar policies to the `user_settings` table.


/**
 * A centralized error handler for Supabase calls.
 * It catches generic network errors and provides a more helpful message.
 * @param error The error object caught from the Supabase client.
 * @param context A string describing the failed operation (e.g., 'fetching cards').
 */
const handleSupabaseError = (error: any, context: string): never => {
    console.error(`Error ${context}:`, error);

    // This specific TypeError occurs when the Supabase URL is incorrect or unreachable.
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error("Database connection failed. Please ensure your SUPABASE_URL is correct, your network is connected, and the Supabase service is running.");
    }
    
    // For all other errors, use the message provided by the Supabase client.
    throw new Error(error.message || `An unknown database error occurred while ${context}.`);
}

const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated.");
    return user;
}


// --- Cards API ---

export async function getCards(): Promise<Card[]> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return [];

    const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
       handleSupabaseError(error, 'fetching cards');
    }
    return data || [];
}

export async function addCard(card: Omit<Card, 'id' | 'created_at'>): Promise<Card> {
    const user = await getUser();
    const cardWithUser = { ...card, user_id: user.id };

    const { data, error } = await supabase
        .from('cards')
        .insert([cardWithUser])
        .select()
        .single(); // .single() is important to get the inserted row back as an object

    if (error) {
       handleSupabaseError(error, 'adding card');
    }
    if (!data) {
        throw new Error("Failed to add card, no data returned.");
    }
    return data;
}

export async function deleteCard(id: string): Promise<void> {
    const user = await getUser();
    const { error } = await supabase
        .from('cards')
        .delete()
        .match({ id: id, user_id: user.id });

    if (error) {
        handleSupabaseError(error, 'deleting card');
    }
}


// --- Settings API ---

export async function getSettings(): Promise<Settings | null> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return null;

    const { data, error } = await supabase
        .from('user_settings')
        .select('targetLanguage, sourceLanguages')
        .eq('user_id', user.id)
        .single();

    if (error) {
        // It's okay if it's not found, means we need to create it.
        if (error.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows"
             handleSupabaseError(error, 'fetching settings');
        }
    }
    return data;
}

export async function saveSettings(settings: Settings): Promise<Settings> {
    const user = await getUser();
    const settingsWithUser = { ...settings, user_id: user.id };
        
    const { data, error } = await supabase
        .from('user_settings')
        .upsert(settingsWithUser)
        .select()
        .single();
        
    if (error) {
       handleSupabaseError(error, 'saving settings');
    }
    return data;
}
