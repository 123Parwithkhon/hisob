import { api } from './api';

export interface WorkUnit {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    transactions: number;
  };
}

export interface WorkUnitStats {
  totalAmount: number;
  totalQuantity: number;
  avgPerUnit: number;
  transactionCount: number;
}

export async function fetchWorkUnits(): Promise<WorkUnit[]> {
  const response = await api.get('/work-units');
  return response.data.data;
}

export async function createWorkUnit(data: { name: string }): Promise<WorkUnit> {
  const response = await api.post('/work-units', data);
  return response.data.data;
}

export async function deleteWorkUnit(id: string): Promise<void> {
  await api.delete(`/work-units/${id}`);
}

export async function getWorkUnitStats(id: string): Promise<WorkUnitStats> {
  const response = await api.get(`/work-units/${id}/stats`);
  return response.data.data;
}