const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Contacts
  async getContacts(params?: { page?: number; limit?: number; search?: string; company?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.company) queryParams.append('company', params.company);
    if (params?.status) queryParams.append('status', params.status);

    return this.request(`/contacts?${queryParams}`);
  }

  async getContact(id: string) {
    return this.request(`/contacts/${id}`);
  }

  async createContact(contact: any) {
    return this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  async updateContact(id: string, contact: any) {
    return this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
  }

  async deleteContact(id: string) {
    return this.request(`/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async importContacts(contacts: any[]) {
    return this.request('/contacts/import', {
      method: 'POST',
      body: JSON.stringify({ contacts }),
    });
  }

  // Companies
  async getCompanies(params?: { page?: number; limit?: number; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    return this.request(`/companies?${queryParams}`);
  }

  async getCompany(id: string) {
    return this.request(`/companies/${id}`);
  }

  async createCompany(company: any) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
  }

  async updateCompany(id: string, company: any) {
    return this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(company),
    });
  }

  async deleteCompany(id: string) {
    return this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  // Opportunities
  async getOpportunities(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    return this.request(`/opportunities?${queryParams}`);
  }

  async getOpportunity(id: string) {
    return this.request(`/opportunities/${id}`);
  }

  async createOpportunity(opportunity: any) {
    return this.request('/opportunities', {
      method: 'POST',
      body: JSON.stringify(opportunity),
    });
  }

  async updateOpportunity(id: string, opportunity: any) {
    return this.request(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(opportunity),
    });
  }

  async deleteOpportunity(id: string) {
    return this.request(`/opportunities/${id}`, {
      method: 'DELETE',
    });
  }

  // Activities
  async getActivities(params?: { page?: number; limit?: number; contact?: string; opportunity?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.contact) queryParams.append('contact', params.contact);
    if (params?.opportunity) queryParams.append('opportunity', params.opportunity);

    return this.request(`/activities?${queryParams}`);
  }

  async getActivity(id: string) {
    return this.request(`/activities/${id}`);
  }

  async createActivity(activity: any) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  async updateActivity(id: string, activity: any) {
    return this.request(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(activity),
    });
  }

  async deleteActivity(id: string) {
    return this.request(`/activities/${id}`, {
      method: 'DELETE',
    });
  }

  // Expenses
  async getExpenses(params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    return this.request(`/expenses?${queryParams}`);
  }

  async createExpense(expense: any) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  async updateExpense(id: string, expense: any) {
    return this.request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
  }

  async deleteExpense(id: string) {
    return this.request(`/expenses/${id}`, {
      method: 'DELETE',
    });
  }

  // Leads
  async getLeads(params?: { page?: number; limit?: number; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    return this.request(`/leads?${queryParams}`);
  }

  async createLead(lead: any) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
  }

  async updateLead(id: string, lead: any) {
    return this.request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lead),
    });
  }

  async deleteLead(id: string) {
    return this.request(`/leads/${id}`, {
      method: 'DELETE',
    });
  }

  // Competitors
  async getCompetitors(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);

    return this.request(`/competitors?${queryParams}`);
  }

  async getCompetitor(id: string) {
    return this.request(`/competitors/${id}`);
  }

  async createCompetitor(competitor: any) {
    return this.request('/competitors', {
      method: 'POST',
      body: JSON.stringify(competitor),
    });
  }

  async updateCompetitor(id: string, competitor: any) {
    return this.request(`/competitors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(competitor),
    });
  }

  async deleteCompetitor(id: string) {
    return this.request(`/competitors/${id}`, {
      method: 'DELETE',
    });
  }

  // Auth
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { name: string; email: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Settings
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settings: any) {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Import
  async importData(data: { companies?: any[]; contacts?: any[]; opportunities?: any[] }) {
    return this.request('/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async validateImportData(data: { companies?: any[]; contacts?: any[]; opportunities?: any[] }) {
    return this.request('/import/validate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;