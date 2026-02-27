// Auto-generated style database type definitions for Supabase client typing.
// In a real project, run `supabase gen types typescript` to generate this file.
export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          is_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          is_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          is_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
