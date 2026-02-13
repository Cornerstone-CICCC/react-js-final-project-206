"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const userRouter = (0, express_1.Router)();
userRouter.post('/signup', auth_middleware_1.checkLogout, user_controller_1.default.signup);
userRouter.post('/login', auth_middleware_1.checkLogout, user_controller_1.default.login);
userRouter.get('/check-auth', auth_middleware_1.checkLogin, user_controller_1.default.checkAuth);
userRouter.put('/profile', auth_middleware_1.checkLogin, user_controller_1.default.updateAccount);
userRouter.post('/logout', auth_middleware_1.checkLogin, user_controller_1.default.logout);
userRouter.delete('/delete', auth_middleware_1.checkLogin, user_controller_1.default.deleteAccount);
userRouter.get('/search', auth_middleware_1.checkLogin, user_controller_1.default.searchByEmail); // Added by Bella
exports.default = userRouter;
