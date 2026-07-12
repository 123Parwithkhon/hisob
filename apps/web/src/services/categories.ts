import { api } from './api';

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
  isDefault: boolean;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get('/categories');
  return response.data.data;
}

export async function fetchCategoriesByType(type: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
  const response = await api.get(`/categories/${type}`);
  return response.data.data;
}

export async function createCategory(data: {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
}): Promise<Category> {
  const response = await api.post('/categories', data);
  return response.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}