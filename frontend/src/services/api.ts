import type {
  Escola,
  EscolaDetalhada,
  ApiResponse,
  RankingItem,
  FilterParams
} from '../types';

const API_BASE_URL = '/api';

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

export const escolasService = {
  async getAll(params?: FilterParams): Promise<ApiResponse<Escola[]>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return fetchAPI<ApiResponse<Escola[]>>(
      `/escolas${query ? `?${query}` : ''}`
    );
  },

  async getById(id: string): Promise<ApiResponse<EscolaDetalhada>> {
    return fetchAPI<ApiResponse<EscolaDetalhada>>(`/escolas/${id}`);
  },

  async getRanking(params?: { uf?: string; tipo?: string; municipio?: string; rede_ensino?: string; limit?: number }): Promise<ApiResponse<RankingItem[]>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    return fetchAPI<ApiResponse<RankingItem[]>>(
      `/ranking${query ? `?${query}` : ''}`
    );
  },

  async compareEscolas(ids: string[]): Promise<ApiResponse<Escola[]>> {
    const response = await fetch(`${API_BASE_URL}/comparar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return response.json();
  },

  async getHealth(): Promise<{status: string; timestamp: string}> {
    return fetchAPI('/health');
  },
};
