const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(email: string, name: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
  }

  async login(email: string, password: string) {
    const response: any = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  async getCurrentUser() {
    return this.request('/auth/me', { method: 'GET' });
  }

  // Products
  async getProducts() {
    return this.request('/products', { method: 'GET' });
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`, { method: 'GET' });
  }

  async createProduct(url: string, marketplace?: string) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify({ url, marketplace }),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  async refreshProductPrices(id: string) {
    return this.request(`/products/${id}/refresh`, { method: 'POST' });
  }

  // Campaigns
  async getCampaigns(includeInactive = false) {
    return this.request(
      `/campaigns?includeInactive=${includeInactive}`,
      { method: 'GET' }
    );
  }

  async getCampaign(id: string) {
    return this.request(`/campaigns/${id}`, { method: 'GET' });
  }

  async getCampaignBySlug(slug: string) {
    return this.request(`/campaigns/slug/${slug}`, { method: 'GET' });
  }

  async createCampaign(data: any) {
    return this.request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaign(id: string, data: any) {
    return this.request(`/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCampaign(id: string) {
    return this.request(`/campaigns/${id}`, { method: 'DELETE' });
  }

  // Links
  async getLinks(campaignId?: string) {
    const query = campaignId ? `?campaignId=${campaignId}` : '';
    return this.request(`/links${query}`, { method: 'GET' });
  }

  async createLink(productId: string, campaignId: string, marketplace: string) {
    return this.request('/links', {
      method: 'POST',
      body: JSON.stringify({ productId, campaignId, marketplace }),
    });
  }

  async deleteLink(id: string) {
    return this.request(`/links/${id}`, { method: 'DELETE' });
  }

  // Analytics
  async getDashboardOverview() {
    return this.request('/analytics/dashboard', { method: 'GET' });
  }

  async getCampaignStats(campaignId?: string) {
    const query = campaignId ? `?campaignId=${campaignId}` : '';
    return this.request(`/analytics/campaigns${query}`, { method: 'GET' });
  }

  async getProductStats(productId?: string) {
    const query = productId ? `?productId=${productId}` : '';
    return this.request(`/analytics/products${query}`, { method: 'GET' });
  }

  async getClickTrends(days = 7) {
    return this.request(`/analytics/trends?days=${days}`, { method: 'GET' });
  }

  async getMarketplaceComparison() {
    return this.request('/analytics/marketplace-comparison', { method: 'GET' });
  }
}

export const api = new ApiClient(API_URL);

