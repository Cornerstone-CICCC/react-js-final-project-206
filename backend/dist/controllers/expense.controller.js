"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const expense_service_1 = __importDefault(require("../services/expense.service"));
const expense_model_1 = require("../models/expense.model");
/**
 * Get All Shared Expenses
 * Fetches transactions where the user is either the payer OR the receiver.
 * @route GET /expenses
 */
const getAllExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session || !req.session.userId) {
        res.status(401).json({ message: 'Not logged in!' });
        return;
    }
    try {
        const expenses = yield expense_service_1.default.getAllShared(req.session.userId);
        res.status(200).json(expenses);
    }
    catch (err) {
        console.error('Get Expenses Error:', err);
        res.status(500).json({ message: 'Failed to fetch expenses.' });
    }
});
/**
 * Get Pending Invitations (Notifications)
 * Fetches expenses shared WITH the user that are still 'Pending'.
 * @route GET /expenses/pending
 */
const getPendingRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session || !req.session.userId) {
        res.status(401).json({ message: 'Not logged in!' });
        return;
    }
    try {
        const pendingExpenses = yield expense_model_1.Expense.find({
            sharedWith: req.session.userId,
            status: 'Pending',
        }).populate('paidBy', 'firstName lastName email');
        res.status(200).json(pendingExpenses);
    }
    catch (err) {
        console.error('Pending Requests Error:', err);
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
});
/**
 * Respond to Expense Invitation
 * Allows the receiver to Accept or Reject a shared expense.
 * @route PUT /expenses/:id/status
 */
const respondToExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const expense = yield expense_model_1.Expense.findOne({
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
            yield expense.save();
            if (io) {
                if (payerId)
                    io.to(payerId).emit('database_change');
                io.to(req.session.userId).emit('database_change');
            }
            res.status(200).json({ message: 'Expense rejected.' });
        }
        else {
            expense.status = 'Accepted';
            yield expense.save();
            if (io) {
                if (payerId)
                    io.to(payerId).emit('database_change');
                io.to(req.session.userId).emit('database_change');
            }
            res.status(200).json({ message: 'Expense accepted!', expense });
        }
    }
    catch (err) {
        console.error('Respond Expense Error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});
/**
 * Get Category Totals (For Charts)
 * @route GET /expenses/summary
 */
const getExpenseSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session || !req.session.userId) {
        res.status(401).json({ message: 'Not logged in!' });
        return;
    }
    try {
        const summary = yield expense_service_1.default.getCategoryTotals(req.session.userId);
        res.status(200).json(summary);
    }
    catch (err) {
        console.error('Summary Error:', err);
        res.status(500).json({ message: 'Failed to generate summary.' });
    }
});
/**
 * Get Monthly Stats (For Line/Bar Charts)
 * @route GET /expenses/monthly
 */
const getMonthlyStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session || !req.session.userId) {
        res.status(401).json({ message: 'Not logged in!' });
        return;
    }
    try {
        const stats = yield expense_service_1.default.getMonthlySummary(req.session.userId);
        res.status(200).json(stats);
    }
    catch (err) {
        console.error('Monthly stats Error:', err);
        res.status(500).json({ message: 'Failed to fetch monthly statistics.' });
    }
});
/**
 * Get Single Expense by ID
 * @route GET /expenses/:id
 */
const getExpenseById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expense = yield expense_service_1.default.getById(req.params.id);
        if (!expense) {
            res.status(404).json({ message: 'Expense not found.' });
            return;
        }
        res.status(200).json(expense);
    }
    catch (err) {
        console.error('Get Expense By ID Error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});
/**
 * Create New Expense
 * @route POST /expenses
 */
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const newExpense = yield expense_service_1.default.add({
            title,
            amount,
            category,
            date,
            note,
            paidBy: req.session.userId,
            sharedWithEmail: sharedWith,
        });
        if (!newExpense) {
            res.status(400).json({ message: 'Failed to create new expense.' });
            return;
        }
        const io = req.app.get('io');
        if (io && newExpense.sharedWith) {
            const recipientId = newExpense.sharedWith._id
                ? newExpense.sharedWith._id.toString()
                : newExpense.sharedWith.toString();
            io.to(recipientId).emit('expense_update_received', {
                message: `New expense shared: ${newExpense.title}`,
                data: newExpense,
            });
            io.to(req.session.userId).emit('database_change');
        }
        res.status(201).json(newExpense);
    }
    catch (err) {
        console.error('Create Expense Error:', err);
        if (err.message.includes('not found') || err.message.includes('yourself')) {
            res.status(400).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: 'Server error.' });
    }
});
/**
 * Update Expense
 * @route PUT /expenses/:id
 */
const updatedExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const oldExpense = yield expense_model_1.Expense.findById(req.params.id);
        const updated = yield expense_service_1.default.update(req.params.id, req.body);
        if (!updated) {
            res.status(404).json({ message: 'Unable to update Expense: Not found' });
            return;
        }
        const io = req.app.get('io');
        if (io) {
            if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.userId) {
                io.to(req.session.userId).emit('database_change');
            }
            if (updated.sharedWith) {
                const recipientId = updated.sharedWith._id
                    ? updated.sharedWith._id.toString()
                    : updated.sharedWith.toString();
                io.to(recipientId).emit('expense_update_received', {
                    message: `Update: ${updated.title} is now ${updated.status}`,
                    data: updated,
                });
                io.to(recipientId).emit('database_change');
            }
            if ((oldExpense === null || oldExpense === void 0 ? void 0 : oldExpense.sharedWith) && !updated.sharedWith) {
                io.to(oldExpense.sharedWith.toString()).emit('database_change');
            }
        }
        res.status(200).json(updated);
    }
    catch (err) {
        console.error('Update Expense Error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});
/**
 * Delete Expense
 * @route DELETE /expenses/:id
 */
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const expense = yield expense_model_1.Expense.findById(req.params.id);
        const deleted = yield expense_service_1.default.remove(req.params.id);
        if (!deleted) {
            res.status(404).json({ message: 'Expense not found.' });
            return;
        }
        const io = req.app.get('io');
        if (io && expense) {
            const pId = (_a = expense.paidBy) === null || _a === void 0 ? void 0 : _a.toString();
            const sId = (_b = expense.sharedWith) === null || _b === void 0 ? void 0 : _b.toString();
            if (pId)
                io.to(pId).emit('database_change');
            if (sId)
                io.to(sId).emit('database_change');
        }
        res.status(200).json({ message: 'Expense deleted successfully!' });
    }
    catch (err) {
        console.error('Delete Expense Error:', err);
        res.status(500).json({ message: 'Server error.' });
    }
});
exports.default = {
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
