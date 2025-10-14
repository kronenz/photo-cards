// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

// Supabase configuration from environment or defaults
const supabaseUrl = browser
	? (import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8100')
	: (process.env.SUPABASE_URL || 'http://localhost:8100');

const supabaseAnonKey = browser
	? (import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE')
	: (process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE');

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true
	}
});

// Type definitions for database tables
export interface Database {
	public: {
		Tables: {
			users: {
				Row: {
					id: string;
					email: string;
					username: string;
					display_name: string;
					avatar_url: string | null;
					bio: string | null;
					location: string | null;
					website: string | null;
					favorite_team: string | null;
					fan_since: string | null;
					favorite_player: string | null;
					grade: string;
					is_verified: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					email: string;
					username: string;
					display_name?: string;
					avatar_url?: string | null;
					bio?: string | null;
					location?: string | null;
					website?: string | null;
					favorite_team?: string | null;
					fan_since?: string | null;
					favorite_player?: string | null;
					grade?: string;
					is_verified?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					email?: string;
					username?: string;
					display_name?: string;
					avatar_url?: string | null;
					bio?: string | null;
					location?: string | null;
					website?: string | null;
					favorite_team?: string | null;
					fan_since?: string | null;
					favorite_player?: string | null;
					grade?: string;
					is_verified?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			cards: {
				Row: {
					id: string;
					user_id: string;
					title: string;
					description: string | null;
					image_url: string;
					team: string | null;
					player: string | null;
					year: number | null;
					is_public: boolean;
					likes_count: number;
					views_count: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					title: string;
					description?: string | null;
					image_url: string;
					team?: string | null;
					player?: string | null;
					year?: number | null;
					is_public?: boolean;
					likes_count?: number;
					views_count?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					title?: string;
					description?: string | null;
					image_url?: string;
					team?: string | null;
					player?: string | null;
					year?: number | null;
					is_public?: boolean;
					likes_count?: number;
					views_count?: number;
					created_at?: string;
					updated_at?: string;
				};
			};
		};
		Views: {};
		Functions: {};
		Enums: {};
	};
}

// Export typed Supabase client
export type SupabaseClient = typeof supabase;
