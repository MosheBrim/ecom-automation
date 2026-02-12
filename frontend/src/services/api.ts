import axios, { type AxiosInstance, type AxiosError } from 'axios';
import type {
  ApiResponse,
  SearchRequest,
  SearchResponse,
  BuyRequest,
  BuyResponse,
  AutomationStatus,
} from '@/types';

const API_BASE_URL = '/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse<unknown>>) => {
        const message = error.response?.data?.error?.message ?? error.message;
        return Promise.reject(new Error(message));
      }
    );
  }

  async search(request: SearchRequest): Promise<ApiResponse<SearchResponse>> {
    const response = await this.client.post<ApiResponse<SearchResponse>>('/search', request);
    return response.data;
  }

  async buy(request: BuyRequest): Promise<ApiResponse<BuyResponse>> {
    const response = await this.client.post<ApiResponse<BuyResponse>>('/checkout', request);
    return response.data;
  }

  async getStatus(requestId: string): Promise<ApiResponse<AutomationStatus>> {
    const response = await this.client.get<ApiResponse<AutomationStatus>>(`/status/${requestId}`);
    return response.data;
  }

  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    const response = await this.client.get<ApiResponse<{ status: string }>>('/health');
    return response.data;
  }
}

export const apiClient = new ApiClient();
