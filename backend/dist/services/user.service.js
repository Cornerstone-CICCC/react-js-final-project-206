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
const user_model_1 = require("../models/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Get all users
const getAll = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.find();
});
// Get user by id
const getById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.findById(id);
});
// Validation check
const getValidateByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.findOne({ email });
});
// Get user by email for login
const getByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.findOne({ email }).select('+password');
});
// Create user
const add = (newUser) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password } = newUser;
    // Required fields check
    if (!firstName || !lastName || !email || !password)
        return null;
    // Check if user already exists
    const existingUser = yield user_model_1.User.findOne({ email });
    if (existingUser) {
        return null;
    }
    // Hash password
    const hashedPassword = yield bcrypt_1.default.hash(password, 12);
    const user = yield user_model_1.User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
    });
    return user;
});
// Update user
const update = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
});
// Delete user
const remove = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.findByIdAndDelete(id);
});
// Login user
const login = (details) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = details;
    const foundUser = yield getByEmail(email);
    if (!foundUser)
        return null;
    // Compare provided password with hashed DB password
    const isMatch = yield bcrypt_1.default.compare(password, foundUser.password);
    if (!isMatch)
        return null;
    // Clean up sensitive data
    const userObj = foundUser.toObject();
    delete userObj.password;
    return {
        user: userObj,
    };
});
exports.default = {
    getAll,
    getById,
    getByEmail,
    getValidateByEmail,
    add,
    update,
    remove,
    login,
};
