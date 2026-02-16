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
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = require("../models/user.model");
const user_service_1 = __importDefault(require("../services/user.service"));
const zxcvbn_1 = __importDefault(require("zxcvbn"));
/**
 * Sign up (add user)
 * @route POST /users/signup
 */
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password } = req.body;
    // Validate fields
    if (!(firstName === null || firstName === void 0 ? void 0 : firstName.trim()) || !(lastName === null || lastName === void 0 ? void 0 : lastName.trim()) || !(email === null || email === void 0 ? void 0 : email.trim()) || !(password === null || password === void 0 ? void 0 : password.trim())) {
        res.status(400).json({
            message: 'Missing required registration fields!',
        });
        return;
    }
    // Password strength check
    const passwordCheck = (0, zxcvbn_1.default)(password);
    if (passwordCheck.score < 3) {
        res.status(400).json({
            message: 'Password is too weak!',
            suggestions: passwordCheck.feedback.suggestions,
            warning: passwordCheck.feedback.warning,
        });
        return;
    }
    // Check email exists
    const existingEmail = yield user_service_1.default.getValidateByEmail(email);
    if (existingEmail) {
        res.status(409).json({
            message: 'Email already exists!',
        });
        return;
    }
    // Create user
    const newUser = yield user_service_1.default.add({ firstName, lastName, email, password });
    if (!newUser) {
        res.status(500).json({
            message: 'Failed to create user!',
        });
        return;
    }
    res.status(201).json({
        message: 'User successfully registered!',
    });
});
/**
 * Log in (check user)
 * @route POST /users/login
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!(email === null || email === void 0 ? void 0 : email.trim()) || !(password === null || password === void 0 ? void 0 : password.trim())) {
        res.status(400).json({
            message: 'Email or password cannot be empty!',
        });
        return;
    }
    const result = yield user_service_1.default.login({ email, password });
    if (!result) {
        res.status(401).json({
            message: 'Incorrect email or password!',
        });
        return;
    }
    const { user } = result;
    // Set cookie session
    if (req.session) {
        req.session.isLoggedIn = true;
        req.session.userId = user._id.toString();
        req.session.email = user.email;
    }
    res.status(200).json({
        message: 'Login successful!',
        user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
        },
    });
});
/**
 * Check Auth & Get Current User Info
 * @route GET /users/check-auth
 */
const checkAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session || !req.session.userId) {
        res.status(401).json({
            message: 'Session expired or not logged in!',
        });
        return;
    }
    const user = yield user_service_1.default.getById(req.session.userId);
    if (!user) {
        res.status(404).json({
            message: 'User does not exist!',
        });
        return;
    }
    res.status(200).json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    });
});
/**
 * Update Profile (Email, Names, or Password)
 * @route PUT /users/profile
 */
const updateAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session || !req.session.userId) {
        res.status(401).json({
            message: 'Not logged in!',
        });
        return;
    }
    const userId = req.session.userId;
    const { firstName, lastName, email, currPassword, newPassword } = req.body;
    try {
        const user = yield user_model_1.User.findById(userId).select('+password');
        if (!user) {
            res.status(404).json({
                message: 'User not found.',
            });
            return;
        }
        // Email duplication check
        if (email && email.trim() !== user.email) {
            const existingEmail = yield user_model_1.User.findOne({
                email: email.trim(),
                _id: { $ne: userId },
            });
            if (existingEmail) {
                res.status(409).json({
                    message: 'Email already exists!',
                });
                return;
            }
        }
        // Password validation and hashing
        let finalPassword = user.password;
        if (currPassword || newPassword) {
            if (!currPassword || !newPassword) {
                res.status(400).json({
                    message: 'Both current and new password are required.',
                });
                return;
            }
            // Password strength check
            const strength = (0, zxcvbn_1.default)(newPassword);
            if (strength.score < 3) {
                res.status(400).json({
                    message: 'New password is too weak!',
                    suggestions: strength.feedback.suggestions,
                });
                return;
            }
            // Verify current password
            const isMatch = yield bcrypt_1.default.compare(currPassword, user.password);
            if (!isMatch) {
                res.status(400).json({
                    message: 'Incorrect current password.',
                });
                return;
            }
            // Hash new password
            finalPassword = yield bcrypt_1.default.hash(newPassword, 12);
        }
        // Prepare update object
        const updateData = {
            firstName: firstName ? firstName.trim() : user.firstName,
            lastName: lastName ? lastName.trim() : user.lastName,
            email: email ? email.trim() : user.email,
            password: finalPassword,
        };
        // Final update
        const updatedUser = yield user_service_1.default.update(userId, updateData);
        if (!updatedUser) {
            res.status(404).json({
                message: 'User not found (during update)',
            });
            return;
        }
        // Update session info if email changed
        req.session.email = updatedUser.email;
        res.status(200).json({
            message: 'Profile updated successfully!',
            user: {
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
            },
        });
    }
    catch (err) {
        console.error('Update Error:', err);
        res.status(500).json({
            message: 'Server error during update',
        });
    }
});
/**
 * Log out
 * @route POST /users/logout
 */
const logout = (req, res) => {
    if (req.session) {
        req.session = null;
    }
    res.status(200).json({
        message: 'Logout successful!',
    });
};
/**
 * Delete Account
 * @route DELETE /users/delete
 */
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session || !req.session.userId) {
        res.status(401).json({
            message: 'Not logged in!',
        });
        return;
    }
    const deleted = yield user_service_1.default.remove(req.session.userId);
    if (!deleted) {
        res.status(400).json({
            message: 'Failed to delete user!',
        });
        return;
    }
    req.session = null;
    res.status(200).json({
        message: 'Account deleted successfully!',
    });
});
/**
 * Search User by Email
 * @route GET /users/search?email=...
 */
const searchByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
        res.status(400).json({ message: 'Email is required' });
        return;
    }
    const user = yield user_service_1.default.getValidateByEmail(email.trim().toLowerCase());
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    res.status(200).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    });
});
exports.default = {
    signup,
    login,
    checkAuth,
    updateAccount,
    logout,
    deleteAccount,
    searchByEmail,
};
