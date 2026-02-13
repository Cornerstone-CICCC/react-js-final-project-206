import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api'; // Axios 인스턴스 임포트
import { useAuth } from './AuthContext'; // 로그인 상태 확인용

// 1. Transaction 타입 정의
export interface Transaction {
  note: string;
  id?: number | string; // 통합 ID (로컬용 또는 MongoDB용)
  _id?: string; // MongoDB용 실제 ID
  title: string;
  amount: number;
  category: string;
  date: string;
  sharedWith?: // 필드명 sharedWith로 통일
    | string
    | {
        firstName: string;
        lastName: string;
        email: string;
      };
  recipientName?: string;
  memo?: string;
  status?:
    | 'pending'
    | 'accepted'
    | 'declined'
    | 'Pending'
    | 'Accepted'
    | 'Rejected'
    | 'approved'
    | 'rejected'
    | 'Personal';
}

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  addTransaction: (tx: any) => void;
  updateTransaction: (id: number | string, data: any) => void;
  deleteTransaction: (id: number | string) => void;
  fetchTransactions: () => Promise<void>; // 새로고침 대비 데이터 불러오기 함수
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { auth } = useAuth(); // 사용자 인증 정보

  // [수정] DB에서 지출 내역 가져오기 및 데이터 정규화
  const fetchTransactions = async () => {
    if (!auth.isAuthenticated) return;
    try {
      setLoading(true);
      const response = await api.get('/expenses'); // 백엔드 라우터

      // 데이터 정규화 로직 추가
      const rawData = Array.isArray(response.data) ? response.data : [];
      const mappedData = rawData.map((tx: any) => ({
        ...tx,
        id: tx._id, // MongoDB의 _id를 id로 매핑
        // 백엔드 모델이 sharedWith를 사용하므로, 혹시 모를 shareWith 오타를 대비해 통합
        sharedWith: tx.sharedWith || tx.shareWith || null,
        // 백엔드 모델의 note를 프론트엔드의 memo와 연동 가능하도록 보장
        note: tx.note || tx.memo || '',
      }));

      setTransactions(mappedData);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // [추가] 앱 로드 시 또는 로그인 시 데이터 초기화
  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchTransactions();
    } else {
      setTransactions([]);
    }
  }, [auth.isAuthenticated]);

  const addTransaction = (tx: Transaction) => {
    // 새 내역 추가 시에도 필드 정규화 적용하여 상태 업데이트
    const normalizedTx = {
      ...tx,
      id: tx._id || tx.id,
      sharedWith: tx.sharedWith || (tx as any).shareWith || null,
    };
    setTransactions((prev) => [normalizedTx, ...prev]);
  };

  const deleteTransaction = async (id: number | string) => {
    try {
      // 실제 DB 삭제 요청
      await api.delete(`/expenses/${id}`);
      setTransactions((prev) => prev.filter((tx) => tx._id !== id && tx.id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const updateTransaction = async (id: number | string, updates: Partial<Transaction>) => {
    try {
      // 실제 DB 수정 요청
      await api.put(`/expenses/${id}`, updates);
      setTransactions((prev) =>
        prev.map((tx) => (tx._id === id || tx.id === id ? { ...tx, ...updates } : tx)),
      );
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        setTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        fetchTransactions,
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
