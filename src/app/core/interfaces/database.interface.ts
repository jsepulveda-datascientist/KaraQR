/**
 * Tipos para la base de datos Supabase
 */
export interface Database {
  public: {
    Tables: {
      queue: {
        Row: {
          id: number;
          name: string;
          song: string;
          titleRaw?: string | null;
          youtubeUrl?: string | null;
          youtubeLink?: string | null;
          status: 'waiting' | 'current' | 'completed' | 'performing';
          created_at: string;
          called_at: string | null;
        };
        Insert: {
          id?: number;
          name: string;
          song: string;
          titleRaw?: string | null;
          youtubeUrl?: string | null;
          youtubeLink?: string | null;
          status?: 'waiting' | 'current' | 'completed' | 'performing';
          created_at?: string;
          called_at?: string | null;
        };
        Update: {
          id?: number;
          name?: string;
          song?: string;
          titleRaw?: string | null;
          youtubeUrl?: string | null;
          youtubeLink?: string | null;
          status?: 'waiting' | 'current' | 'completed' | 'performing';
          created_at?: string;
          called_at?: string | null;
        };
      };
    };
    Functions: {
      karaqr_call_next: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: number;
          name: string;
          song: string;
          titleRaw?: string | null;
          youtubeUrl?: string | null;
          youtubeLink?: string | null;
          status: 'waiting' | 'current' | 'completed' | 'performing';
          created_at: string;
          called_at: string | null;
        } | null;
      };
    };
  };
}