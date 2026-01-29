import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function ensureTableExists() {
  try {
    // Check if the uuid-ossp extension is enabled
    const { data: extData, error: extError } = await supabase
      .from('pg_extension')
      .select('extname')
      .eq('extname', 'uuid-ossp');

    if (extError) throw extError;

    if (!extData || extData.length === 0) {
      console.log('Enabling uuid-ossp extension...');
      const { error: enableExtError } = await supabase.rpc('create_extension', { name: 'uuid-ossp' });
      if (enableExtError) {
        // Supabase often creates 'create_extension' function. If not, try raw SQL.
        // Fallback to raw SQL if RPC fails (e.g., if create_extension function is not available)
        if (enableExtError.message.includes('function create_extension(name => text) does not exist')) {
            console.warn('create_extension RPC not found, trying raw SQL for uuid-ossp extension.');
            const { error: rawExtError } = await supabase.rpc('execute_sql', { sql: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";' });
            if (rawExtError) throw rawExtError;
        } else {
            throw enableExtError;
        }
      }
    }


    // Check if 'projects' table exists
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('tablename', 'projects')
      .eq('schemaname', 'public');

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log("Table 'projects' does not exist. Creating table...");

      // Create the projects table
      const createTableSql = `
        CREATE TABLE projects (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'Planning',
          "chatHistory" JSONB DEFAULT '[]'::jsonb,
          logs JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      const { error: createError } = await supabase.rpc('execute_sql', { sql: createTableSql }); // Use rpc to execute raw SQL
      if (createError) throw createError;

      // Add the updated_at trigger function
      const createTriggerFunctionSql = `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `;
      const { error: triggerFuncError } = await supabase.rpc('execute_sql', { sql: createTriggerFunctionSql });
      if (triggerFuncError) throw triggerFuncError;

      // Add the updated_at trigger
      const createTriggerSql = `
        CREATE TRIGGER update_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `;
      const { error: triggerError } = await supabase.rpc('execute_sql', { sql: createTriggerSql });
      if (triggerError) throw triggerError;

      console.log("Table 'projects' created successfully with triggers.");
    } else {
      console.log("Table 'projects' already exists. Skipping creation.");
    }
  } catch (error: any) {
    console.error('Error ensuring projects table exists:', error.message);
    // Depending on the environment, you might want to rethrow or handle more gracefully
    throw error;
  }
}

// Ensure the table exists when the Supabase client is initialized
ensureTableExists();
