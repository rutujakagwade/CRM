export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  company_id?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  company?: Company;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string | {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  city?: string;
  country?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
  
  // Extended fields for the enhanced company form
  placeOfOffice?: string;
  headOffice?: string;
  email?: string;
  sector?: string;
  poc?: {
    name: string;
    importance: string;
  };
  contacts?: {
    name: string;
    role?: string;
    phone?: string;
    email?: string;
    importance?: string;
  }[];
}

export interface Opportunity {
  id: string;
  title: string;
  key_person_name?: string;
  open_date?: string;
  close_date?: string;
  amount: number;
  description?: string;
  products_pitched?: string[];
  company_id?: string;
  contact_id?: string;
  forecast_amount: number;
  status: 'quality' | 'meet_contact' | 'meet_present' | 'purpose' | 'negotiate' | 'closed_win' | 'lost' | 'not_responding' | 'remarks';
  sector?: string;
  priority: 'low' | 'medium' | 'high';
  probability: number;
  owner?: string;
  competitors?: Competitor[];
  status_remarks?: string;
  forecast?: 'omitted' | 'in-pipeline' | 'bestcase' | 'commit' | 'closed';
  stage?: 'lead' | 'meet_contact' | 'meet_present' | 'not_responding';
  importance?: 1 | 2 | 3;
  created_at?: string;
  updated_at?: string;
  company?: Company;
  contact?: Contact;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  contact_id?: string;
  company_id?: string;
  opportunity_id?: string;
  created_at?: string;
  updated_at?: string;
  contact?: Contact;
  company?: Company;
  opportunity?: Opportunity;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category?: string;
  date: string;
  opportunity_id?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  opportunity?: Opportunity;
}

export interface Settings {
  id: string;
  user_name: string;
  user_email?: string;
  user_avatar?: string;
  sectors: string[];
  activity_types: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Competitor {
  id: string;
  name: string;
  status: 'Equal' | 'Superior' | 'Inferior';
  marketShare?: string;
  strength?: string;
  weakness?: string;
  positionVsYou: 'Leader' | 'Challenger' | 'Follower' | 'Niche Player';
  pricingModel?: string;
  keyFeatures?: string;
  customerBase?: string;
  recentDevelopment?: string;
  createdBy?: string;
  created_at?: string;
  updated_at?: string;
}
export interface Lead {
  id: string;
  title?: string; // Keep for backward compatibility
  name: string;
  email?: string;
  phone?: string;
  company?: string | Company; // Can be string or Company object
  position?: string;
  source?: string;
  value?: number;
  priority: 'low' | 'medium' | 'high';
  lead_status?: string; // Keep for backward compatibility
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'Cold' | 'Warm' | 'Hot' | 'Won' | 'Lost';
  forecast?: string; // Add forecast field
  notes?: string;
  assigned_to?: string;
  tags?: string[];
  website?: string;
  industry?: string;
  budget?: number;
  timeline?: string;
  created_at: string;
  updated_at: string;
}



