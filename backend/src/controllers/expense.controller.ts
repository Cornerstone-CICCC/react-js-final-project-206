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
    res.status(401).json({ message: 'Not logged in!' });
    return;
  }

  try {
    const expenses = await expenseService.getAllShared(req.session.userId);
    res.status(200).json(expenses);
  } catch (err) {
    console.error('Get Expenses Error:', err);
    res.status(500).json({ message: 'Failed to fetch expenses.' });
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
    console.error('Pending Requests Error:', err);
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
    });

    if (!expense) {
      res.status(404).json({ message: 'Expense invitation not found.' });
      return;
    }

    const payerId = expense.paidBy ? expense.paidBy.toString() : null;
    const io = req.app.get('io');

    if (status === 'Rejected') {
      expense.status = 'Personal';
      expense.sharedWith = undefined;
      expense.sharedWithEmail = '';
      await expense.save();

      if (io) {
        if (payerId) io.to(payerId).emit('database_change');
        io.to(req.session.userId).emit('database_change');
      }

      res.status(200).json({ message: 'Expense rejected.' });
    } else {
      expense.status = 'Accepted';
      await expense.save();

      if (io) {
        if (payerId) io.to(payerId).emit('database_change');
        io.to(req.session.userId).emit('database_change');
      }
      res.status(200).json({ message: 'Expense accepted!', expense });
    }
  } catch (err) {
    console.error('Respond Expense Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Get Category Totals (For Charts)
 * @route GET /expenses/summary
 */
const getExpenseSummary = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({ message: 'Not logged in!' });
    return;
  }

  try {
    const summary = await expenseService.getCategoryTotals(req.session.userId);
    res.status(200).json(summary);
  } catch (err) {
    console.error('Summary Error:', err);
    res.status(500).json({ message: 'Failed to generate summary.' });
  }
};

/**
 * Get Monthly Stats (For Line/Bar Charts)
 * @route GET /expenses/monthly
 */
const getMonthlyStats = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({ message: 'Not logged in!' });
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
      res.status(404).json({ message: 'Expense not found.' });
      return;
    }

    res.status(200).json(expense);
  } catch (err) {
    console.error('Get Expense By ID Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Create New Expense
 * @route POST /expenses
 */
const createExpense = async (req: Request, res: Response) => {
  if (!req.session || !req.session.userId) {
    res.status(401).json({ message: 'Not logged in!' });
    return;
  }

  const { title, amount, category, date, note, sharedWith } = req.body;

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
      sharedWithEmail: sharedWith,
    });

    if (!newExpense) {
      res.status(400).json({ message: 'Failed to create new expense.' });
      return;
    }

    const io = req.app.get('io');

    if (io && newExpense.sharedWith) {
      const recipientId = (newExpense.sharedWith as any)._id
        ? (newExpense.sharedWith as any)._id.toString()
        : newExpense.sharedWith.toString();

      io.to(recipientId).emit('expense_update_received', {
        message: `New expense shared: ${newExpense.title}`,
        data: newExpense,
      });

      io.to(req.session.userId).emit('database_change');
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
  try {
    const oldExpense = await Expense.findById(req.params.id);
    const updated = await expenseService.update(req.params.id, req.body);

    if (!updated) {
      res.status(404).json({ message: 'Unable to update Expense: Not found' });
      return;
    }

    const io = req.app.get('io');

    if (io) {
      if (req.session?.userId) {
        io.to(req.session.userId).emit('database_change');
      }

      if (updated.sharedWith) {
        const recipientId = (updated.sharedWith as any)._id
          ? (updated.sharedWith as any)._id.toString()
          : updated.sharedWith.toString();

        io.to(recipientId).emit('expense_update_received', {
          message: `Update: ${updated.title} is now ${updated.status}`,
          data: updated,
        });

        io.to(recipientId).emit('database_change');
      }

      if (oldExpense?.sharedWith && !updated.sharedWith) {
        io.to(oldExpense.sharedWith.toString()).emit('database_change');
      }
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error('Update Expense Error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

/**
 * Delete Expense
 * @route DELETE /expenses/:id
 */
const deleteExpense = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const expense = await Expense.findById(req.params.id);
    const deleted = await expenseService.remove(req.params.id);

    if (!deleted) {
      res.status(404).json({ message: 'Expense not found.' });
      return;
    }

    const io = req.app.get('io');
    if (io && expense) {
      const pId = expense.paidBy?.toString();
      const sId = expense.sharedWith?.toString();

      if (pId) io.to(pId).emit('database_change');
      if (sId) io.to(sId).emit('database_change');
    }

    res.status(200).json({ message: 'Expense deleted successfully!' });
  } catch (err) {
    console.error('Delete Expense Error:', err);
    res.status(500).json({ message: 'Server error.' });
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
