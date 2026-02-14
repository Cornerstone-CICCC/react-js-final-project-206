import mongoose from 'mongoose';
import { Expense, IExpense } from '../models/expense.model';
import { User } from '../models/user.model';

// Get all expenses
const getAllShared = async (userId: string) => {
  return await Expense.find({
    $or: [{ paidBy: userId }, { sharedWith: userId }],
  })
  .populate('paidBy', 'email firstName lastName') // 결제자 정보(이메일 포함)
  .populate('sharedWith', 'email firstName lastName') // 공유받은 사람 정보
  .sort({ date: -1 });
};

// Get a single expense by ID
const getById = async (id: string) => {
  return await Expense.findById(id).populate('paidBy sharedWith', 'firstName lastName');
};

// Add new expense
const add = async (expenseData: Partial<IExpense> & { sharedWithEmail?: string }) => {
  const { title, amount, category, paidBy, date, note, sharedWithEmail } = expenseData;

  // 🚩 로그 1: 프론트에서 넘어온 데이터 확인
  console.log("📥 [요청 데이터 확인]:", { title, sharedWithEmail });

  if (!title || !amount || !category || !paidBy) return null;

  let sharedWithId: mongoose.Types.ObjectId | null = null;
  let status: 'Personal' | 'Pending' = 'Personal';

  // 2. 이메일이 있을 경우 상대방 유저 찾기
  if (sharedWithEmail) {
    const recipient = await User.findOne({ email: sharedWithEmail.trim().toLowerCase() });

    if (recipient) {
      // 🚩 로그 2: 유저를 찾았을 때
      console.log("👤 [유저 발견]:", recipient.firstName, recipient.lastName);
      sharedWithId = recipient._id as mongoose.Types.ObjectId;
      status = 'Pending';
    } else {
      // 🚩 로그 3: 유저를 못 찾았을 때 (이게 찍히면 이메일 형식이 DB와 다른 것)
      console.log("❓ [유저 못 찾음]:", sharedWithEmail);
    }
  }

  // 🚩 로그 4: 최종 저장 직전 상태 확인
  console.log("📊 [최종 저장 상태]:", status);

  const newExpense = await Expense.create({
    title, amount, category, note: note || '',
    status, paidBy, sharedWith: sharedWithId,
    sharedWithEmail: sharedWithEmail?.trim().toLowerCase(),
    date: date || new Date(),
  });

  // 🔔 소켓 전송 구간
  if (status === 'Pending') {
    const io = (global as any).io;
    console.log("📡 [소켓 엔진 확인]:", io ? "정상" : "없음(global.io 확인 필요)");
    
    if (io) {
      const sender = await User.findById(paidBy);
      io.emit('expense_update_received', {
        sharedWithEmail: sharedWithEmail?.trim().toLowerCase(),
        senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'Partner',
        data: { title: newExpense.title, amount: newExpense.amount }
      });
      console.log(`🚀 [알림 송출 완료] to: ${sharedWithEmail}`);
    }
  }

  return newExpense;
};

// Update an expense
const update = async (id: string, data: Partial<IExpense>) => {
  return await Expense.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

// Delete an expense
const remove = async (id: string) => {
  return await Expense.findByIdAndDelete(id);
};

// Get total spending summary
const getCategoryTotals = async (userId: string) => {
  const expenses = await getAllShared(userId);

  const totals: Record<string, number> = {};
  expenses.forEach((exp) => {
    totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
  });

  return totals;
};

// Get monthly spending summary
const getMonthlySummary = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  return await Expense.aggregate([
    {
      $match: {
        $or: [{ paidBy: userObjectId }, { sharedWith: userObjectId }],
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 },
    },
  ]);
};

export default {
  getAllShared,
  getById,
  add,
  update,
  remove,
  getCategoryTotals,
  getMonthlySummary,
};
