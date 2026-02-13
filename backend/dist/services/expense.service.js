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
const mongoose_1 = __importDefault(require("mongoose"));
const expense_model_1 = require("../models/expense.model");
const user_model_1 = require("../models/user.model");
// Get all expenses
const getAllShared = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield expense_model_1.Expense.find({
        $or: [{ paidBy: userId }, { sharedWith: userId }],
    })
        .populate('paidBy', 'email firstName lastName') // 결제자 정보(이메일 포함)
        .populate('sharedWith', 'email firstName lastName') // 공유받은 사람 정보
        .sort({ date: -1 });
});
// Get a single expense by ID
const getById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield expense_model_1.Expense.findById(id).populate('paidBy sharedWith', 'firstName lastName');
});
// Add new expense
const add = (expenseData) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, amount, category, paidBy, date, note, sharedWithEmail } = expenseData;
    // Required fields check
    if (!title || !amount || !category || !paidBy)
        return null;
    let sharedWithId = null;
    let status = 'Personal';
    // If user provided an email, look up the person
    if (sharedWithEmail) {
        const recipient = yield user_model_1.User.findOne({ email: sharedWithEmail.trim().toLowerCase() });
        if (!recipient) {
            throw new Error(`User with email ${sharedWithEmail} not found.`);
        }
        if (recipient._id.toString() === paidBy.toString()) {
            throw new Error('You cannot share an expense with yourself.');
        }
        sharedWithId = recipient._id;
        status = 'Pending';
    }
    return yield expense_model_1.Expense.create({
        title,
        amount,
        category,
        note: note || '',
        status,
        paidBy,
        sharedWith: sharedWithId,
        sharedWithEmail: sharedWithEmail === null || sharedWithEmail === void 0 ? void 0 : sharedWithEmail.trim().toLowerCase(), // Added by Bella
        date: date || new Date(),
    });
});
// Update an expense
const update = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield expense_model_1.Expense.findByIdAndUpdate(id, data, { new: true, runValidators: true });
});
// Delete an expense
const remove = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield expense_model_1.Expense.findByIdAndDelete(id);
});
// Get total spending summary
const getCategoryTotals = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const expenses = yield getAllShared(userId);
    const totals = {};
    expenses.forEach((exp) => {
        totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });
    return totals;
});
// Get monthly spending summary
const getMonthlySummary = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    return yield expense_model_1.Expense.aggregate([
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
});
exports.default = {
    getAllShared,
    getById,
    add,
    update,
    remove,
    getCategoryTotals,
    getMonthlySummary,
};
