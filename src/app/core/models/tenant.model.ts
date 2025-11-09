export interface Tenant {
  id: string;
  display_name: string;
  primary_hex?: string;
  accent_hex?: string;
  logo_url?: string;
  created_at: string;
}

export interface CreateTenantRequest {
  id: string;
  display_name: string;
  primary_hex?: string;
  accent_hex?: string;
  logo_url?: string;
}

export interface UpdateTenantRequest {
  display_name?: string;
  primary_hex?: string;
  accent_hex?: string;
  logo_url?: string;
}

export interface TenantStats {
  total_entries: number;
  active_entries: number;
  completed_today: number;
  last_activity: string;
}