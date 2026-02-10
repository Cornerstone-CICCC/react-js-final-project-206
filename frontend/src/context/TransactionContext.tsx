import React, { createContext, useContext, useState, type ReactNode } from 'react';

// 1. Transaction 타입 정의 (기존 코드에 맞춰 확인)
export interface Transaction {
  id: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  shareWith?: string; // 이메일 주소 등
  recipientName?: string; // 수신자 이름 (추가!)
  memo?: string;
  status?: 'pending' | 'accepted' | 'declined'; // 상태 (추가!)
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: number) => void;
  updateTransaction: (id: number, updates: Partial<Transaction>) => void; // 2. 타입 정의 추가
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([
    // 초기 더미 데이터 (있다면 유지)
    { id: 1, title: 'Groceries', amount: 120.5, category: 'Food', date: '2026-02-09' },
  ]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...tx, id: Date.now() };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  // 3. 수정 로직 추가 (이 부분이 핵심!)
  const updateTransaction = (id: number, updates: Partial<Transaction>) => {
    setTransactions((prev) => prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)));
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        updateTransaction, // 4. value에 추가
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
