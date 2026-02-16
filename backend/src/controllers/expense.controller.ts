import { Request, Response } from 'express';
import expenseService from '../services/expense.service';
import { Expense } from '../models/expense.model';

/**
 * Get All Shared Expenses
 * Fetches transactions where the user is either the payer OR the receiver.
 * @route GET /expenses
 */
const getAllExpenses = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      message: 'Not logged in!',
    });
    return;
  }

  try {
    const expenses = await expenseService.getAllShared(req.session.userId);
    res.status(200).json(expenses);
  } catch (err) {
    console.error('Get Expenses Error:', err);
    res.status(500).json({
      message: 'Failed to fetch expenses.',
    });
  }
};

/**
 * Get Pending Invitations (Notifications)
 * Fetches expenses shared WITH the user that are still 'Pending'.
 * @route GET /expenses/pending
 */
const getPendingRequests = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({ message: 'Not logged in!' });
    return;
  }

  try {
    const pendingExpenses = await Expense.find({
      sharedWith: req.session.userId,
      status: 'Pending',
    }).populate('paidBy', 'firstName lastName email');

    res.status(200).json(pendingExpenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
};

/**
 * Respond to Expense Invitation
 * Allows the receiver to Accept or Reject a shared expense.
 * @route PUT /expenses/:id/status
 */
const respondToExpense = async (req: Request<{ id: string }>, res: Response) => {
  const { status } = req.body;

  if (!req.session || !req.session.userId) {
    res.status(401).json({ message: 'Not logged in!' });
    return;
  }

  if (!['Accepted', 'Rejected'].includes(status)) {
    res.status(400).json({ message: 'Invalid status. Use Accepted or Rejected.' });
    return;
  }

  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      sharedWith: req.session.userId,
    }).populate('sharedWith', 'firstName lastName'); // 응답자 이름 가져오기

    if (!expense) {
      res.status(404).json({ message: 'Expense invitation not found.' });
      return;
    }

    const oldStatus = expense.status;
    expense.status = status;
    
   // controllers/expense.controller.ts 내 respondToExpense 함수 수정
if (status === 'Rejected') {
  // await Expense.findByIdAndDelete(req.params.id); // ❌ 삭제 코드를 지우세요.
  expense.status = 'Rejected'; // ✅ 상태만 Rejected로 변경
  await expense.save();
} else {
  await expense.save();
}

    // 🔔 [추가] 결제자(paidBy)에게 응답 알림 보내기
    const io = (global as any).io;
    if (io) {
      io.emit('expense_response_received', {
        targetUserId: expense.paidBy.toString(), // 알림을 받을 사람 (결제자)
        responderName: (expense.sharedWith as any).firstName, // 응답한 사람 이름
        status: status, // Accepted 또는 Rejected
        title: expense.title
      });
    }

    res.status(200).json({ message: `Expense ${status}!`, status });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Get Category Totals (For Charts)
 * @route GET /expenses/summary
 */
const getExpenseSummary = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      message: 'Not logged in!',
    });
    return;
  }

  try {
    const summary = await expenseService.getCategoryTotals(req.session.userId);
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({
      message: 'Failed to generate summary.',
    });
  }
};

/**
 * Get Monthly Stats (For Line/Bar Charts)
 * @route GET /expenses/monthly
 */
const getMonthlyStats = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({
      message: 'Not logged in!',
    });
    return;
  }

  try {
    const stats = await expenseService.getMonthlySummary(req.session.userId);
    res.status(200).json(stats);
  } catch (err) {
    console.error('Monthly stats Error:', err);
    res.status(500).json({ message: 'Failed to fetch monthly statistics.' });
  }
};

/**
 * Get Single Expense by ID
 * @route GET /expenses/:id
 */
const getExpenseById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const expense = await expenseService.getById(req.params.id);

    if (!expense) {
      res.status(404).json({
        message: 'Expense not found.',
      });
      return;
    }

    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({
      message: 'Server error.',
    });
  }
};

/**
 * Create New Expense
 */
const createExpense = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({ message: 'Not logged in!' });
    return;
  }

  // 🚩 수정: sharedWith를 sharedWithEmail로 변경하여 프론트엔드와 일치시킴
  const { title, amount, category, date, note, sharedWithEmail } = req.body;

  if (!title || !amount || !category) {
    res.status(400).json({ message: 'Title, amount, and category are required.' });
    return;
  }

  try {
    const newExpense = await expenseService.add({
      title,
      amount,
      category,
      date,
      note,
      paidBy: req.session.userId as any,
      sharedWithEmail: sharedWithEmail, // 🚩 전달되는 이름 확인!
    });

    if (!newExpense) {
      res.status(400).json({ message: 'Failed to create new expense.' });
      return;
    }

    res.status(201).json(newExpense);
  } catch (err: any) {
    console.error('Create Expense Error:', err);
    if (err.message.includes('not found') || err.message.includes('yourself')) {
      res.status(400).json({ message: err.message });
      return;
    }
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Update Expense
 * @route PUT /expenses/:id
 */
const updatedExpense = async (req: Request<{ id: string }>, res: Response) => {
  // 1. 필요한 필드들을 꺼냅니다.
  const { title, amount, category, date, note, status } = req.body;
  
  try {
    // 2. 업데이트할 데이터 객체를 명확히 만듭니다.
    // status가 undefined면 아예 제외해서 기존 DB 값을 보존하게 합니다.
    const updateData = {
      title,
      amount,
      category,
      date,
      note,
      ...(status && { status }) // status 값이 존재할 때만 객체에 추가
    };

    const updated = await expenseService.update(req.params.id, updateData);

    if (!updated) {
      res.status(404).json({ message: 'Unable to update Expense: Not found' });
      return;
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Delete Expense
 * @route DELETE /expenses/:id
 */
const deleteExpense = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const deleted = await expenseService.remove(req.params.id);

    if (!deleted) {
      res.status(404).json({
        message: 'Expense not found.',
      });
      return;
    }

    res.status(200).json({
      message: 'Expense deleted successfully!',
    });
  } catch (err) {
    res.status(500).json({
      message: 'Server error.',
    });
  }
};

export default {
  getAllExpenses,
  getPendingRequests,
  respondToExpense,
  getExpenseSummary,
  getMonthlyStats,
  getExpenseById,
  createExpense,
  updatedExpense,
  deleteExpense,
};
