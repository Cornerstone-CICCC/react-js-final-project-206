import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

export interface Transaction {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  paidBy: string | any;
  sharedWith?: {
    _id: string;
    name: string;
    email: string;
  };
  sharedWithEmail?: string;
  status: 'Personal' | 'Pending' | 'Accepted' | 'Rejected';
}

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
  addTransaction: (txData: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  updateTransactionStatus: (id: string, status: 'Accepted' | 'Rejected') => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Load data
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/expenses');
      setTransactions(response.data);
    } catch (err) {
      console.error('지출 내역 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Add expense
  const addTransaction = async (txData: any) => {
    try {
      const response = await api.post('/expenses', txData);
      setTransactions((prev) => [response.data, ...prev]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create the expense.');
      throw err;
    }
  };

  // 3. Delete expense (ID required to avoid 404 error)
  const deleteTransaction = async (id: string) => {
    try {
      await api.delete(`/expenses/${id}`);
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    } catch (err) {
      console.error('삭제 실패 (ID 확인):', id, err);
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    }
  };

  // 4. General information update (Merged duplicate logic and prevented controlled input warning)
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const response = await api.put(`/expenses/${id}`, updates);

      setTransactions((prev) =>
        prev.map((tx) =>
          tx._id === id
            ? {
                ...tx,
                ...response.data,
                note: response.data.note ?? tx.note ?? '',
                sharedWithEmail: response.data.sharedWithEmail ?? tx.sharedWithEmail ?? '',
              }
            : tx,
        ),
      );
    } catch (err) {
      console.error('업데이트 실패:', err);
      throw err;
    }
  };
  // 5. State update (for Accept/Reject only)
  const updateTransactionStatus = async (id: string, status: 'Accepted' | 'Rejected') => {
    try {
      const response = await api.put(`/expenses/${id}/status`, { status });

      if (status === 'Rejected') {
        setTransactions((prev) => prev.filter((tx) => tx._id !== id));
      } else {
        setTransactions((prev) =>
          prev.map((tx) => (tx._id === id ? { ...tx, status: 'Accepted' } : tx)),
        );
      }
    } catch (err) {
      console.error('State update failed (Retrying with a regular update):', err);
      await updateTransaction(id, { status: status === 'Accepted' ? 'Accepted' : 'Personal' });
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        fetchTransactions,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        updateTransactionStatus,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within TransactionProvider');
  }
  return context;
}
