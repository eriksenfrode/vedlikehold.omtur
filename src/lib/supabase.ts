import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Server-side Supabase-klient med service-role-nøkkel.
 * Brukes kun i API-ruter (server) – aldri eksponert mot klient.
 */
export function getServiceClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Mangler NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Anon-klient (read-only-bruk om nødvendig).
 */
export function getAnonClient() {
  if (!supabaseUrl || !anonKey) {
    throw new Error(
      "Mangler NEXT_PUBLIC_SUPABASE_URL eller NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }
  return createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Typer for databasen
export type Workshop = {
  id: string;
  name: string;
  email: string;
  city: string;
  active: boolean;
  created_at: string;
};

export type Brand = {
  id: string;
  name: string;
};

export type Inquiry = {
  id: string;
  user_name: string;
  user_email: string;
  reg_nr: string;
  car_brand: string | null;
  car_model: string | null;
  car_year: string | null;
  car_info: unknown;
  description: string;
  workshops_notified: number;
  created_at: string;
};
