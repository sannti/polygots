import { supabase } from './supabaseClient';
import type { Card, Settings } from '../../types';

// NOTE TO USER:
// Before this code can work, you need to set up the following tables in your Supabase project.
//
// 1. A table named `cards` with columns:
//    - `id`: uuid (Primary Key, auto-generated)
//    - `created_at`: timestamptz (Defaults to `now()`)
//    - `frontText`: text
//    - `targetLanguage`: text
//    - `sourceLanguages`: jsonb (or text[])
//    - `translations`: jsonb
//    - `examples`: jsonb
//    - `notes`: text (nullable)
//
// 2. A table named `user_settings` with columns:
//    - `id`: int8 (Primary Key, set it to `1` for the single-user setup)
//    - `updated_at`: timestamptz
//    - `targetLanguage`: text
//    - `sourceLanguages`: jsonb (or text[])
//
// Make sure to enable Row Level Security (RLS) for production use.
// For this example, we assume RLS is disabled or allows public access.


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


// --- Cards API ---

export async function getCards(): Promise<Card[]> {
    const { data, error } = await supabase
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
       handleSupabaseError(error, 'fetching cards');
    }
    return data || [];
}

export async function addCard(card: Omit<Card, 'id' | 'created_at'>): Promise<Card> {
    const { data, error } = await supabase
        .from('cards')
        .insert([card])
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
    const { error } = await supabase
        .from('cards')
        .delete()
        .match({ id });

    if (error) {
        handleSupabaseError(error, 'deleting card');
    }
}


// --- Settings API ---

const SETTINGS_ID = 1; // For a single-user setup, we use a fixed row ID.

export async function getSettings(): Promise<Settings | null> {
    const { data, error } = await supabase
        .from('user_settings')
        .select('targetLanguage, sourceLanguages')
        .eq('id', SETTINGS_ID)
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
    const { data, error } = await supabase
        .from('user_settings')
        .upsert({ id: SETTINGS_ID, ...settings })
        .select()
        .single();
        
    if (error) {
       handleSupabaseError(error, 'saving settings');
    }
    return data;
}