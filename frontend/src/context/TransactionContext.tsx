import React, { createContext, useContext, useState, type ReactNode } from 'react';

// 1. Transaction 타입 정의
export interface Transaction {
  note: string;
  id?: number; // 기존 로컬 ID
  _id?: string; // MongoDB용 ID (추가)
  title: string;
  amount: number;
  category: string;
  date: string;
  shareWith?: string;
  recipientName?: string;
  memo?: string;
  status?: 'pending' | 'accepted' | 'declined' | 'Pending' | 'Accepted' | 'Rejected'; // 대소문자 호환
}

interface TransactionContextType {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (data: any) => void;
  // 매개변수 타입을 interface와 동일하게 맞춤
  updateTransaction: (id: number | string, data: any) => void;
  deleteTransaction: (id: number | string) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...tx, id: Date.now() };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  // 2. 삭제 로직 수정 (매개변수 id 타입을 number | string으로 변경)
  const deleteTransaction = (id: number | string) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id && tx._id !== id));
  };

  // 3. 수정 로직 수정 (매개변수 id 타입을 number | string으로 변경)
  const updateTransaction = (id: number | string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id || tx._id === id ? { ...tx, ...updates } : tx)),
    );
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        setTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
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
