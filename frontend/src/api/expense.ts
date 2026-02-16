import { BASE_URL } from '.';
import type { IUser } from './user';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Rent'
  | 'Household'
  | 'Health'
  | 'Education'
  | 'Other';
export type ExpenseStatus = 'Pending' | 'Accepted' | 'Personal' | 'Rejected';

export interface IExpense {
  _id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  status: ExpenseStatus;
  paidBy: string | IUser;
  sharedWith: string | IUser | null;
  sharedWithEmail: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  title: string;
  amount: number;
  category: string;
  date?: string;
  note?: string;
  sharedWith?: string;
}

export const getAllExpenses = async (params?: {
  search?: string;
  limit?: number;
}): Promise<IExpense[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${BASE_URL}/expenses?${query.toString()}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return [];

    const data: IExpense[] = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getExpenseById = async (id: string): Promise<IExpense | null> => {
  try {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Fetch detail failed', error);
    return null;
  }
};

export const getExpenseSummary = async (): Promise<Record<string, number> | null> => {
  try {
    const res = await fetch(`${BASE_URL}/expenses/summary`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return null;

    const data: Record<string, number> = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getMonthlyStats = async (): Promise<any[]> => {
  try {
    const res = await fetch(`${BASE_URL}/expenses/monthly`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return [];

    const data: any[] = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getPendingRequests = async (): Promise<IExpense[]> => {
  try {
    const res = await fetch(`${BASE_URL}/expenses/pending`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) return [];

    const data: IExpense[] = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const createExpense = async (expenseInfo: CreateExpenseData): Promise<IExpense | null> => {
  try {
    const res = await fetch(`${BASE_URL}/expenses`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(expenseInfo),
    });

    if (!res.ok) return null;

    const data: IExpense = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const respondToExpense = async (
  id: string,
  status: 'Accepted' | 'Rejected',
): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/expenses/${id}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const updateExpense = async (id: string, updates: Partial<IExpense>): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch (error) {
    console.error('Update failed', error);
    return false;
  }
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
