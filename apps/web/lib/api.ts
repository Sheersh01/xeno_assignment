import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
});

// Customers
export const getCustomers = async (query?: string) => (await api.get("/customers", { params: { query } })).data;
export const getDashboardStats = async () => (await api.get("/stats")).data;

// Segments
export const getSegments = async () => (await api.get("/segments")).data;

// Campaigns
export const getCampaigns = async () => (await api.get("/campaigns")).data;
export const getCampaignById = async (id: string) => (await api.get(`/campaigns/${id}`)).data;
export const createCampaign = async (data: any) => (await api.post("/campaigns", data)).data;
export const deleteCampaign = async (id: string) => (await api.delete(`/campaigns/${id}`)).data;
export const launchCampaign = async (id: string) => (await api.post(`/campaigns/${id}/launch`)).data;
export const getCampaignStats = async (id: string) => (await api.get(`/campaigns/${id}/stats`)).data;

// AI
export const buildSegment = async (prompt: string) => (await api.post("/ai/segment-builder", { prompt })).data;
export const explainSegment = async (query: any) => (await api.post("/ai/segment-explainer", { query })).data;
export const generateMessage = async (goal: string, segmentDescription: string) => 
  (await api.post("/ai/generate-message", { goal, segmentDescription })).data;
export const recommendChannel = async (segmentId: string) => 
  (await api.post("/ai/recommend-channel", { segmentId })).data;

export default api;
