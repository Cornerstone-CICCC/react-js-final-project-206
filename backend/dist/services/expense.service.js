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
    // 🚩 로그 1: 프론트에서 넘어온 데이터 확인
    console.log("📥 [요청 데이터 확인]:", { title, sharedWithEmail });
    if (!title || !amount || !category || !paidBy)
        return null;
    let sharedWithId = null;
    let status = 'Personal';
    // 2. 이메일이 있을 경우 상대방 유저 찾기
    if (sharedWithEmail) {
        const recipient = yield user_model_1.User.findOne({ email: sharedWithEmail.trim().toLowerCase() });
        if (recipient) {
            // 🚩 로그 2: 유저를 찾았을 때
            console.log("👤 [유저 발견]:", recipient.firstName, recipient.lastName);
            sharedWithId = recipient._id;
            status = 'Pending';
        }
        else {
            // 🚩 로그 3: 유저를 못 찾았을 때 (이게 찍히면 이메일 형식이 DB와 다른 것)
            console.log("❓ [유저 못 찾음]:", sharedWithEmail);
        }
    }
    // 🚩 로그 4: 최종 저장 직전 상태 확인
    console.log("📊 [최종 저장 상태]:", status);
    const newExpense = yield expense_model_1.Expense.create({
        title, amount, category, note: note || '',
        status, paidBy, sharedWith: sharedWithId,
        sharedWithEmail: sharedWithEmail === null || sharedWithEmail === void 0 ? void 0 : sharedWithEmail.trim().toLowerCase(),
        date: date || new Date(),
    });
    // 🔔 소켓 전송 구간
    if (status === 'Pending') {
        const io = global.io;
        console.log("📡 [소켓 엔진 확인]:", io ? "정상" : "없음(global.io 확인 필요)");
        if (io) {
            const sender = yield user_model_1.User.findById(paidBy);
            io.emit('expense_update_received', {
                sharedWithEmail: sharedWithEmail === null || sharedWithEmail === void 0 ? void 0 : sharedWithEmail.trim().toLowerCase(),
                senderName: sender ? `${sender.firstName} ${sender.lastName}` : 'Partner',
                data: { title: newExpense.title, amount: newExpense.amount }
            });
            console.log(`🚀 [알림 송출 완료] to: ${sharedWithEmail}`);
        }
    }
    return newExpense;
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
