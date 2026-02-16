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
const invite_service_1 = __importDefault(require("../services/invite.service"));
/**
 * Send an Invitation
 * @route POST /invites
 */
const sendInvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session || !req.session.userId) {
        res.status(401).json({
            message: 'Not logged in!',
        });
        return;
    }
    const { receiverEmail } = req.body;
    if (!receiverEmail) {
        res.status(400).json({
            message: 'Receiver email is required.',
        });
        return;
    }
    try {
        const invite = yield invite_service_1.default.send(req.session.userId, receiverEmail);
        res.status(201).json({
            message: 'Invitation sent successfully!',
            invite,
        });
    }
    catch (err) {
        res.status(400).json({
            message: err.message || 'Failed to send invitation.',
        });
    }
});
/**
 * Get My Pending Invitations
 * @route GET /invites
 */
const getMyInvites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session || !req.session.email) {
        res.status(401).json({
            message: 'Not logged in!',
        });
        return;
    }
    try {
        const invites = yield invite_service_1.default.getReceived(req.session.email);
        res.status(200).json(invites);
    }
    catch (err) {
        res.status(500).json({
            message: 'Failed to fetch invitations.',
        });
    }
});
/**
 * Accept Invitation
 * @route POST /invites/:id/accept
 */
const acceptInvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield invite_service_1.default.accept(req.params.id);
        res.status(200).json({
            message: 'Invitation accepted! You are now linked.',
            result,
        });
    }
    catch (err) {
        res.status(400).json({
            message: err.message || 'Failed to accept invitation.',
        });
    }
});
/**
 * Reject Invitation
 * @route POST /invites/:id/reject
 */
const rejectInvite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield invite_service_1.default.reject(req.params.id);
        res.status(200).json({
            message: 'Invitation rejected.',
        });
    }
    catch (err) {
        res.status(500).json({
            message: 'Server error.',
        });
    }
});
exports.default = {
    sendInvite,
    getMyInvites,
    acceptInvite,
    rejectInvite,
};
