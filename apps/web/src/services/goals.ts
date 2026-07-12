import { api } from './api';

export interface GoalForecast {
  daysLeft: number | null;
  achievable: boolean;
  monthlySavings?: number;
  message: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  target: number;
  current: number;
  remaining: number;
  progress: number;
  deadline?: string;
  forecast: GoalForecast;
  createdAt: string;
}

export async function fetchGoals(): Promise<Goal[]> {
  const response = await api.get('/goals');
  return response.data.data;
}

export async function createGoal(data: {
  title: string;
  description?: string;
  target: number;
  deadline?: string;
}): Promise<Goal> {
  const response = await api.post('/goals', data);
  return response.data.data;
}

export async function updateGoal(
  id: string,
  data: { title?: string; description?: string; target?: number; deadline?: string }
): Promise<Goal> {
  const response = await api.patch(`/goals/${id}`, data);
  return response.data.data;
}

export async function contributeToGoal(id: string, amount: number): Promise<Goal> {
  const response = await api.post(`/goals/${id}/contribute`, { amount });
  return response.data.data;
}

export async function deleteGoal(id: string): Promise<void> {
  await api.delete(`/goals/${id}`);
}