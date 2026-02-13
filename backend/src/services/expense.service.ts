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

  // Required fields check
  if (!title || !amount || !category || !paidBy) return null;

  let sharedWithId: mongoose.Types.ObjectId | null = null;
  let status: 'Personal' | 'Pending' = 'Personal';

  // If user provided an email, look up the person
  if (sharedWithEmail) {
    const recipient = await User.findOne({ email: sharedWithEmail.trim().toLowerCase() });

    if (!recipient) {
      throw new Error(`User with email ${sharedWithEmail} not found.`);
    }

    if (recipient._id.toString() === paidBy.toString()) {
      throw new Error('You cannot share an expense with yourself.');
    }

    sharedWithId = recipient._id as mongoose.Types.ObjectId;
    status = 'Pending';
  }

  return await Expense.create({
   title,
    amount,
    category,
    note: note || '',
    status,
    paidBy,
    sharedWith: sharedWithId,
    sharedWithEmail: sharedWithEmail?.trim().toLowerCase(), // Added by Bella
    date: date || new Date(),
  });
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
