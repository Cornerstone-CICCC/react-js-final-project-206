"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const invite_controller_1 = __importDefault(require("../controllers/invite.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const inviteRouter = (0, express_1.Router)();
inviteRouter.use(auth_middleware_1.checkLogin);
inviteRouter.post('/', invite_controller_1.default.sendInvite);
inviteRouter.get('/', invite_controller_1.default.getMyInvites);
inviteRouter.post('/:id/accept', invite_controller_1.default.acceptInvite);
inviteRouter.post('/:id/reject', invite_controller_1.default.rejectInvite);
exports.default = inviteRouter;
