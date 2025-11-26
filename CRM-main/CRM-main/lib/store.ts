import { create } from 'zustand';
import type { Contact, Company, Opportunity, Activity, Expense, Settings, Lead } from '@/types';
import { apiClient } from './api';

interface CRMStore {
  contacts: Contact[];
  companies: Company[];
  opportunities: Opportunity[];
  activities: Activity[];
  expenses: Expense[];
  settings: Settings | null;
  loading: boolean;

  // Lookup maps for performance
  contactsMap: Map<string, Contact>;
  companiesMap: Map<string, Company>;
  opportunitiesMap: Map<string, Opportunity>;

  // Cache flags
  contactsLoaded: boolean;
  companiesLoaded: boolean;
  opportunitiesLoaded: boolean;
  activitiesLoaded: boolean;
  expensesLoaded: boolean;
  settingsLoaded: boolean;

  // Computed counts for performance
  contactCount: number;
  companyCount: number;
  opportunityCount: number;
  activeOpportunityCount: number;
  highPriorityOpportunityCount: number;
  activityCount: number;
  todayActivityCount: number;
  scheduledTodayActivityCount: number;
  expenseCount: number;
  wonOpportunityAmount: number;

  // Helper functions
  updateComputedCounts: () => void;
  populateExpenseOpportunities: () => void;

  // LEADS
  leads: Lead[];
  fetchLeads: () => Promise<void>;
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  fetchContacts: (force?: boolean) => Promise<void>;
  fetchCompanies: () => Promise<void>;
  fetchOpportunities: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchSettings: (force?: boolean) => Promise<void>;

  // Real-time subscriptions (removed - no longer needed)

  addContact: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => Promise<Contact>;
  importContacts: (contacts: Omit<Contact, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  addCompany: (company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCompany: (id: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;

  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateOpportunity: (id: string, opportunity: Partial<Opportunity>) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;

  addActivity: (activity: Omit<Activity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  updateSettings: (settings: Partial<Settings>) => Promise<void>;

  importData: (data: { contacts?: Contact[]; companies?: Company[]; opportunities?: Opportunity[]; leads?: Lead[] }) => Promise<void>;
}


export const useCRMStore = create<CRMStore>((set, get) => ({
  contacts: [],
  companies: [],
  opportunities: [],
  activities: [],
  expenses: [],
  settings: null,
  loading: false,

  // Lookup maps
  contactsMap: new Map(),
  companiesMap: new Map(),
  opportunitiesMap: new Map(),

  // Cache flags
  contactsLoaded: false,
  companiesLoaded: false,
  opportunitiesLoaded: false,
  activitiesLoaded: false,
  expensesLoaded: false,
  settingsLoaded: false,

  // Computed counts
  contactCount: 0,
  companyCount: 0,
  opportunityCount: 0,
  activeOpportunityCount: 0,
  highPriorityOpportunityCount: 0,
  activityCount: 0,
  todayActivityCount: 0,
  scheduledTodayActivityCount: 0,
  expenseCount: 0,
  wonOpportunityAmount: 0,

  // Helper function to update computed counts
  updateComputedCounts: () => {
    const state = get();
    const today = new Date().toISOString().split('T')[0];

    set({
      contactCount: state.contacts.length,
      companyCount: state.companies.length,
      opportunityCount: state.opportunities.length,
      activeOpportunityCount: state.opportunities.filter(o => o.status !== 'closed_win' && o.status !== 'lost').length,
      highPriorityOpportunityCount: state.opportunities.filter(o => o.priority === 'high' && o.status !== 'closed_win' && o.status !== 'lost').length,
      activityCount: state.activities.length,
      todayActivityCount: state.activities.filter(a => a.start_time?.startsWith(today)).length,
      scheduledTodayActivityCount: state.activities.filter(a => a.start_time?.startsWith(today) && a.status === 'scheduled').length,
      expenseCount: state.expenses.length,
      wonOpportunityAmount: state.opportunities.filter(o => o.status === 'closed_win').reduce((sum, o) => sum + (o.amount || 0), 0),
    });
  },

  // Helper function to populate opportunities in expenses
  populateExpenseOpportunities: () => {
    const state = get();
    const updatedExpenses = state.expenses.map(expense => ({
      ...expense,
      opportunity: expense.opportunity_id ? state.opportunitiesMap.get(expense.opportunity_id) : undefined
    }));
    set({ expenses: updatedExpenses });
  },

  // --------------------------
  // LEADS LOGIC (LOCAL STORAGE)
  // --------------------------

  leads: [],

  fetchLeads: async () => {
    // Load from localStorage
    const stored = localStorage.getItem('leads');
    if (stored) {
      set({ leads: JSON.parse(stored) });
    }
  },

  addLead: async (lead) => {
    const newLead = {
      ...lead,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const leads = [...get().leads, newLead];
    set({ leads });
    localStorage.setItem('leads', JSON.stringify(leads));
  },

  updateLead: async (id, updates) => {
    const leads = get().leads.map((l) =>
      l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    );
    set({ leads });
    localStorage.setItem('leads', JSON.stringify(leads));
  },

  deleteLead: async (id) => {
    const leads = get().leads.filter((l) => l.id !== id);
    set({ leads });
    localStorage.setItem('leads', JSON.stringify(leads));
  },

  fetchContacts: async (force = false) => {
    // Skip if already loaded and not forced
    if (get().contactsLoaded && !force) {
      console.log('DEBUG: Contacts already loaded, skipping fetch. Current contacts:', get().contacts.length);
      return;
    }

    // Reset loaded flag if forcing refresh
    if (force) {
      set({ contactsLoaded: false });
    }

    try {
      console.log('DEBUG: Fetching contacts from API...');
      const response = await apiClient.getContacts({ limit: 100 }); // Reduced limit for better performance
      console.log('DEBUG: Get contacts API response:', response);
      if (response.success) {
        const contacts = (response.data as any[]).map((contact) => ({
          ...contact,
          company: contact.company_id ? { ...contact.company_id, id: contact.company_id._id } : undefined
        }));
        const contactsMap = new Map(contacts.map(c => [c.id, c]));
        console.log('DEBUG: Processed contacts:', contacts.length, contacts.slice(0, 2));
        set({ contacts, contactsMap, contactsLoaded: true });
        get().updateComputedCounts();
        console.log('DEBUG: Contacts loaded and set in state:', contacts.length);
      } else {
        console.error('DEBUG: Failed to fetch contacts:', response.error);
        set({ contacts: [], contactsLoaded: false });
      }
    } catch (error) {
      console.error('DEBUG: Error fetching contacts:', error);
      set({ contacts: [], contactsLoaded: false });
    }
  },

  fetchCompanies: async () => {
    // Skip if already loaded
    if (get().companiesLoaded) {
      console.log('Companies already loaded, skipping fetch');
      return;
    }

    try {
      console.log('Fetching companies from API...');
      const response = await apiClient.getCompanies();
      if (response.success) {
        const companies = (response.data as Company[]) || [];
        const companiesMap = new Map(companies.map(c => [c.id, c]));
        set({ companies, companiesMap, companiesLoaded: true });
        get().updateComputedCounts();
        console.log('Companies loaded:', companies.length);
      } else {
        console.error('Failed to fetch companies:', response.error);
        set({ companies: [], companiesLoaded: false });
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      set({ companies: [], companiesLoaded: false });
    }
  },

  fetchOpportunities: async () => {
    // Skip if already loaded
    if (get().opportunitiesLoaded) {
      console.log('Opportunities already loaded, skipping fetch');
      return;
    }

    try {
      console.log('Fetching opportunities from API...');
      const response = await apiClient.getOpportunities();
      if (response.success) {
        const opportunities = (response.data as Opportunity[]) || [];
        const opportunitiesMap = new Map(opportunities.map(o => [o.id, o]));
        set({ opportunities, opportunitiesMap, opportunitiesLoaded: true });
        get().updateComputedCounts();
        get().populateExpenseOpportunities(); // Populate opportunities in existing expenses
        console.log('Opportunities loaded:', opportunities.length);
      } else {
        console.error('Failed to fetch opportunities:', response.error);
        set({ opportunities: [], opportunitiesLoaded: false });
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      set({ opportunities: [], opportunitiesLoaded: false });
    }
  },

  fetchActivities: async () => {
    // Skip if already loaded
    if (get().activitiesLoaded) {
      console.log('Activities already loaded, skipping fetch');
      return;
    }

    try {
      console.log('Fetching activities from API...');
      const response = await apiClient.getActivities();
      if (response.success) {
        const state = get();
        const activities = (response.data as any[]).map(activity => ({
          ...activity,
          id: activity.id || activity._id,
          contact: activity.contact_id ? state.contactsMap.get(activity.contact_id) : undefined,
          company: activity.company_id ? state.companiesMap.get(activity.company_id) : undefined,
          opportunity: activity.opportunity_id ? state.opportunitiesMap.get(activity.opportunity_id) : undefined
        }));
        set({ activities, activitiesLoaded: true });
        get().updateComputedCounts();
        console.log('Activities loaded:', activities.length);
      } else {
        console.error('Failed to fetch activities:', response.error);
        set({ activities: [], activitiesLoaded: false });
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      set({ activities: [], activitiesLoaded: false });
    }
  },

  fetchExpenses: async () => {
    // Skip if already loaded
    if (get().expensesLoaded) {
      console.log('Expenses already loaded, skipping fetch');
      return;
    }

    try {
      console.log('Fetching expenses from API...');
      const response = await apiClient.getExpenses();
      if (response.success) {
        const apiExpenses = (response.data as any[]) || [];
        const expenses: Expense[] = apiExpenses.map(apiExpense => {
          const opportunityId = typeof apiExpense.opportunity_id === 'object' ? apiExpense.opportunity_id._id : apiExpense.opportunity_id;
          return {
            ...apiExpense,
            id: apiExpense._id || apiExpense.id,
            opportunity_id: opportunityId,
            opportunity: opportunityId ? get().opportunitiesMap.get(opportunityId) : undefined
          };
        });
        set({ expenses, expensesLoaded: true });
        get().updateComputedCounts();
        console.log('Expenses loaded:', expenses.length);
      } else {
        console.error('Failed to fetch expenses:', response.error);
        set({ expenses: [], expensesLoaded: false });
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      set({ expenses: [], expensesLoaded: false });
    }
  },

  fetchSettings: async (force = false) => {
    // Skip if already loaded and not forced
    if (get().settingsLoaded && !force) {
      console.log('Settings already loaded, skipping fetch');
      return;
    }

    try {
      console.log('Fetching settings from API...');
      const response = await apiClient.getSettings();
      if (response.success) {
        set({ settings: response.data as Settings, settingsLoaded: true });
        console.log('Settings loaded');
      } else {
        console.error('Failed to fetch settings:', response.error);
        // Load default settings as fallback
        const defaultSettings: Settings = {
          id: 'default',
          user_name: 'Demo User',
          user_email: 'demo@example.com',
          sectors: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Energy', 'Education', 'Retail', 'Media'],
          activity_types: ['Call', 'Email', 'Meeting', 'Demo', 'Proposal', 'Follow-up'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        set({ settings: defaultSettings, settingsLoaded: false });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Load default settings as fallback
      const defaultSettings: Settings = {
        id: 'default',
        user_name: 'Demo User',
        user_email: 'demo@example.com',
        sectors: ['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Energy', 'Education', 'Retail', 'Media'],
        activity_types: ['Call', 'Email', 'Meeting', 'Demo', 'Proposal', 'Follow-up'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      set({ settings: defaultSettings, settingsLoaded: false });
    }
  },

  // Real-time subscriptions removed - no longer needed without Supabase

  addContact: async (contact) => {
    console.log('Adding contact via API:', contact);
    try {
      const response = await apiClient.createContact(contact);
      console.log('Create contact API response:', response);
      if (response.success) {
        const apiContact = response.data as any;
        const newContact: Contact = {
          ...apiContact,
          company: apiContact.company_id ? { ...apiContact.company_id, id: apiContact.company_id._id } : undefined
        };
        console.log('New contact object:', newContact);
        set({ contacts: [newContact, ...get().contacts] });
        console.log('Contact added successfully, total contacts:', get().contacts.length + 1);
        console.log('Updated contacts array:', get().contacts);
        return newContact;
      } else {
        throw new Error(response.error || 'Failed to create contact');
      }
    } catch (error) {
      console.error('Error adding contact:', error);
      throw error;
    }
  },

  importContacts: async (contacts) => {
    console.log('Importing contacts via API:', contacts.length);
    try {
      const response = await apiClient.importContacts(contacts);
      if (response.success) {
        // Add imported contacts to local state
        const newContacts = (response.data as any[]).map((contact) => ({
          ...contact,
          company: contact.company_id ? { ...contact.company_id, id: contact.company_id._id } : undefined
        }));
        set({ contacts: [...newContacts, ...get().contacts] });
        console.log('Contacts imported successfully, total contacts:', get().contacts.length);
      } else {
        throw new Error(response.error || 'Failed to import contacts');
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      throw error;
    }
  },

  updateContact: async (id, contact) => {
    console.log('Updating contact via API:', id, contact);
    try {
      const response = await apiClient.updateContact(id, contact);
      if (response.success) {
        const apiContact = response.data as any;
        const updatedContact: Contact = {
          ...apiContact,
          company: apiContact.company_id ? { ...apiContact.company_id, id: apiContact.company_id._id } : undefined
        };
        set({ contacts: get().contacts.map(c => c.id === id ? updatedContact : c) });
        console.log('Contact updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update contact');
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  deleteContact: async (id) => {
    console.log('Deleting contact locally:', id);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    set({ contacts: get().contacts.filter(c => c.id !== id) });
    console.log('Contact deleted successfully');
  },

  addCompany: async (company) => {
    console.log('Adding company locally:', company);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const newCompany: Company = {
      ...company,
      id: 'company-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    set({ companies: [newCompany, ...get().companies] });
    console.log('Company added successfully, total companies:', get().companies.length + 1);
  },

  updateCompany: async (id, company) => {
    console.log('Updating company locally:', id, company);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const updatedCompany: Company = {
      ...get().companies.find(c => c.id === id)!,
      ...company,
      updated_at: new Date().toISOString()
    };

    set({ companies: get().companies.map(c => c.id === id ? updatedCompany : c) });
    console.log('Company updated successfully');
  },

  deleteCompany: async (id) => {
    console.log('Deleting company locally:', id);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    set({ companies: get().companies.filter(c => c.id !== id) });
    console.log('Company deleted successfully');
  },

  addOpportunity: async (opportunity) => {
    console.log('Adding opportunity locally:', opportunity);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const newOpportunity: Opportunity = {
      ...opportunity,
      id: 'opportunity-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      company: opportunity.company_id ? get().companies.find(c => c.id === opportunity.company_id) : undefined,
      contact: opportunity.contact_id ? get().contacts.find(c => c.id === opportunity.contact_id) : undefined
    };

    set({ opportunities: [newOpportunity, ...get().opportunities] });
    console.log('Opportunity added successfully, total opportunities:', get().opportunities.length + 1);
  },

  updateOpportunity: async (id, opportunity) => {
    console.log('Updating opportunity locally:', id, opportunity);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const updatedOpportunity: Opportunity = {
      ...get().opportunities.find(o => o.id === id)!,
      ...opportunity,
      updated_at: new Date().toISOString(),
      company: opportunity.company_id ? get().companies.find(c => c.id === opportunity.company_id) : get().opportunities.find(o => o.id === id)?.company,
      contact: opportunity.contact_id ? get().contacts.find(c => c.id === opportunity.contact_id) : get().opportunities.find(o => o.id === id)?.contact
    };

    set({ opportunities: get().opportunities.map(o => o.id === id ? updatedOpportunity : o) });
    console.log('Opportunity updated successfully');
  },

  deleteOpportunity: async (id) => {
    console.log('Deleting opportunity locally:', id);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    set({ opportunities: get().opportunities.filter(o => o.id !== id) });
    console.log('Opportunity deleted successfully');
  },

  addActivity: async (activity) => {
    console.log('Adding activity via API:', activity);
    try {
      const response = await apiClient.createActivity(activity);
      if (response.success) {
        const apiActivity = response.data as any;
        const newActivity: Activity = {
          ...apiActivity,
          contact: apiActivity.contact_id ? get().contacts.find(c => c.id === apiActivity.contact_id) : undefined,
          company: apiActivity.company_id ? get().companies.find(c => c.id === apiActivity.company_id) : undefined,
          opportunity: apiActivity.opportunity_id ? get().opportunities.find(o => o.id === apiActivity.opportunity_id) : undefined
        };
        set({ activities: [newActivity, ...get().activities] });
        console.log('Activity added successfully, total activities:', get().activities.length + 1);
      } else {
        throw new Error(response.error || 'Failed to create activity');
      }
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  },

  updateActivity: async (id, activity) => {
    console.log('Updating activity via API:', id, activity);
    try {
      const response = await apiClient.updateActivity(id, activity);
      if (response.success) {
        const apiActivity = response.data as any;
        const updatedActivity: Activity = {
          ...apiActivity,
          contact: apiActivity.contact_id ? get().contacts.find(c => c.id === apiActivity.contact_id) : undefined,
          company: apiActivity.company_id ? get().companies.find(c => c.id === apiActivity.company_id) : undefined,
          opportunity: apiActivity.opportunity_id ? get().opportunities.find(o => o.id === apiActivity.opportunity_id) : undefined
        };
        set({ activities: get().activities.map(a => a.id === id ? updatedActivity : a) });
        console.log('Activity updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update activity');
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  deleteActivity: async (id) => {
    console.log('Deleting activity via API:', id);
    try {
      const response = await apiClient.deleteActivity(id);
      if (response.success) {
        set({ activities: get().activities.filter(a => a.id !== id) });
        console.log('Activity deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete activity');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  },

  addExpense: async (expense) => {
    console.log('Adding expense via API:', expense);
    try {
      const response = await apiClient.createExpense(expense);
      if (response.success) {
        const apiExpense = response.data as any;
        const opportunityId = typeof apiExpense.opportunity_id === 'object' ? apiExpense.opportunity_id._id : apiExpense.opportunity_id;
        const newExpense: Expense = {
          ...apiExpense,
          id: apiExpense._id || apiExpense.id,
          opportunity_id: opportunityId,
          opportunity: opportunityId ? get().opportunitiesMap.get(opportunityId) : undefined
        };
        set({ expenses: [newExpense, ...get().expenses] });
        console.log('Expense added successfully, total expenses:', get().expenses.length + 1);
      } else {
        throw new Error(response.error || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  updateExpense: async (id, expense) => {
    console.log('Updating expense via API:', id, expense);
    try {
      const response = await apiClient.updateExpense(id, expense);
      if (response.success) {
        const apiExpense = response.data as any;
        const opportunityId = typeof apiExpense.opportunity_id === 'object' ? apiExpense.opportunity_id._id : apiExpense.opportunity_id;
        const updatedExpense: Expense = {
          ...apiExpense,
          id: apiExpense._id || apiExpense.id,
          opportunity_id: opportunityId,
          opportunity: opportunityId ? get().opportunitiesMap.get(opportunityId) : undefined
        };
        set({ expenses: get().expenses.map(e => e.id === id ? updatedExpense : e) });
        console.log('Expense updated successfully');
      } else {
        throw new Error(response.error || 'Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  deleteExpense: async (id) => {
    console.log('Deleting expense via API:', id);
    try {
      const response = await apiClient.deleteExpense(id);
      if (response.success) {
        set({ expenses: get().expenses.filter(e => e.id !== id) });
        console.log('Expense deleted successfully');
      } else {
        throw new Error(response.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },

  updateSettings: async (settings) => {
    console.log('Updating settings locally:', settings);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentSettings = get().settings;
    if (!currentSettings) return;

    const updatedSettings: Settings = {
      ...currentSettings,
      ...settings,
      updated_at: new Date().toISOString()
    };

    set({ settings: updatedSettings });
    console.log('Settings updated successfully');
  },

  importData: async (data) => {
    console.log('Importing data via API:', data);
    set({ loading: true });

    try {
      const response = await apiClient.importData(data);
      if (response.success) {
        // Refresh all data after import
        await Promise.all([
          get().fetchContacts(),
          get().fetchCompanies(),
          get().fetchOpportunities(),
          get().fetchActivities(),
          get().fetchExpenses()
        ]);
        console.log('Data imported successfully');
      } else {
        throw new Error(response.error || 'Import failed');
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));


