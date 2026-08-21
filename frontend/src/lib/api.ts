// In production the browser talks to the same-origin Next.js proxy. This avoids
// baking a Koyeb backend URL into the client bundle and keeps local development
// working without an environment file.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/backend';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add existing headers if they exist
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Generic HTTP methods
  async get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'consumer' | 'provider';
  }) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/logout', { method: 'POST' });
    } catch (error) {
      // Ignore network errors during logout - we'll clear token anyway
      console.warn('Logout request failed, clearing token locally:', error);
    } finally {
      this.clearToken();
    }
  }

  async me() {
    return this.request('/me');
  }

  // Project endpoints
  async getProjects(params?: {
    search?: string;
    category?: string;
    status?: string;
    sort_by?: string;
    sort_order?: string;
    page?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const query = searchParams.toString();
    return this.request(`/projects${query ? `?${query}` : ''}`);
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  }

  async createProject(data: {
    title: string;
    description: string;
    category: string;
    skills: string[];
    budget: number;
    deadline?: string;
    images?: string[];
  }) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<{
    title: string;
    description: string;
    category: string;
    skills: string[];
    budget: number;
    status: string;
    deadline: string;
    images: string[];
  }>) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Bid endpoints
  async getProjectBids(projectId: string) {
    return this.request(`/projects/${projectId}/bids`);
  }

  async createBid(projectId: string, data: {
    amount: number;
    proposal: string;
    delivery_time: number;
  }) {
    return this.request(`/projects/${projectId}/bids`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBid(bidId: string, data: {
    amount?: number;
    proposal?: string;
    delivery_time?: number;
  }) {
    return this.request(`/bids/${bidId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async acceptBid(bidId: string) {
    return this.request(`/bids/${bidId}/accept`, {
      method: 'POST',
    });
  }

  async deleteBid(bidId: string) {
    return this.request(`/bids/${bidId}`, {
      method: 'DELETE',
    });
  }

  // Payment endpoints
  async getPayments() {
    return this.request('/payments');
  }

  async getPayment(id: string) {
    return this.request(`/payments/${id}`);
  }

  async createEscrow(projectId: string, data: {
    amount: number;
    description?: string;
  }) {
    return this.request(`/projects/${projectId}/escrow`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async releaseEscrow(paymentId: string) {
    return this.request(`/payments/${paymentId}/release`, {
      method: 'POST',
    });
  }

  async markProjectCompleted(projectId: string) {
    return this.request(`/projects/${projectId}/complete`, {
      method: 'POST',
    });
  }

  async requestRefund(paymentId: string, data: {
    reason: string;
  }) {
    return this.request(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Dispute endpoints
  async getDisputes() {
    return this.request('/disputes');
  }

  async getDispute(id: string) {
    return this.request(`/disputes/${id}`);
  }

  async createDispute(data: {
    project_id: number;
    type: 'payment' | 'quality' | 'deadline' | 'communication' | 'other';
    description: string;
    evidence?: string[];
  }) {
    return this.request('/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDispute(id: string, data: {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed';
    resolution?: string;
    admin_notes?: string;
  }) {
    return this.request(`/disputes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async addDisputeMessage(disputeId: string, data: {
    message: string;
    attachments?: string[];
  }) {
    return this.request(`/disputes/${disputeId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async closeDispute(disputeId: string, data: {
    resolution: string;
    winner?: 'consumer' | 'provider' | 'split';
  }) {
    return this.request(`/disputes/${disputeId}/close`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Review endpoints
  async getReviews() {
    return this.request('/reviews');
  }

  async getReview(id: string) {
    return this.request(`/reviews/${id}`);
  }

  async getUserReviews(userId: string) {
    return this.request(`/users/${userId}/reviews`);
  }

  async getProjectReviews(projectId: string) {
    return this.request(`/projects/${projectId}/reviews`);
  }

  async createReview(data: {
    project_id: number;
    reviewee_id: number;
    rating: number;
    comment: string;
    type: 'consumer_to_provider' | 'provider_to_consumer';
  }) {
    // Transform reviewee_id to reviewed_user_id for API compatibility
    const apiData = {
      project_id: data.project_id,
      reviewed_user_id: data.reviewee_id,
      rating: data.rating,
      comment: data.comment,
      type: data.type,
    };
    
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  async updateReview(id: string, data: {
    rating?: number;
    comment?: string;
  }) {
    return this.request(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReview(id: string) {
    return this.request(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Wallet endpoints
  async getWallet() {
    return this.request('/wallet');
  }

  async getWalletBalance() {
    return this.request('/wallet/balance');
  }

  async getWalletTransactions() {
    return this.request('/wallet/transactions');
  }

  async addFunds(data: {
    amount: number;
    payment_method: string;
  }) {
    return this.request('/wallet/add-funds', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async withdraw(data: {
    amount: number;
    address: string;
  }) {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
