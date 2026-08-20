import apiClient from './api';

export interface RAGResponse {
  success: boolean;
  question: string;
  answer: string;
  sources: Array<{
    title: string;
    source: string;
    snippet?: string;
  }>;
}

export interface RecommendationResponse {
  success: boolean;
  providerStats?: any;
  patterns?: any;
  recommendations: string;
}

export interface SustainabilitySummaryResponse {
  success: boolean;
  metrics: {
    totalListings: number;
    foodRescued: number;
    wasteReducedKg: number;
    co2SavedKg: number;
    activeOrgs: number;
  };
  summary: string;
}

export interface AgentAction {
  tool: string;
  input: any;
  output: any;
}

export interface AgentResponse {
  success: boolean;
  query: string;
  iterations: number;
  actions: AgentAction[];
  response: string;
}

export const aiService = {
  // 1. Food Safety & Guidelines RAG
  queryRAG: async (question: string): Promise<RAGResponse> => {
    const res = await apiClient.post<RAGResponse>('/ai/rag', { question });
    return res.data;
  },

  // 2. Provider Waste Reduction Recommendations (GenAI)
  getRecommendations: async (payload: {
    providerId?: string;
    stats?: any;
  }): Promise<RecommendationResponse> => {
    const res = await apiClient.post<RecommendationResponse>('/ai/recommendations', payload);
    return res.data;
  },

  // 3. Platform Executive Sustainability Summary (GenAI / ESG)
  getSustainabilitySummary: async (payload: {
    totalListings?: number;
    foodRescued?: number;
    totalWasteReducedKg?: number;
    totalCo2SavedKg?: number;
    activeOrgs?: number;
  }): Promise<SustainabilitySummaryResponse> => {
    const res = await apiClient.post<SustainabilitySummaryResponse>('/ai/sustainability-summary', payload);
    return res.data;
  },

  // 4. Agentic AI Food Matching Loop
  runAgent: async (query: string): Promise<AgentResponse> => {
    const res = await apiClient.post<AgentResponse>('/ai/agent', { query });
    return res.data;
  },
};

export default aiService;
