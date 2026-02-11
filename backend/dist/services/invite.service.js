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
Object.defineProperty(exports, "__esModule", { value: true });
const invite_model_1 = require("../models/invite.model");
const user_model_1 = require("../models/user.model");
// Send an invitation
const send = (senderId, receiverEmail) => __awaiter(void 0, void 0, void 0, function* () {
    const sender = yield user_model_1.User.findById(senderId);
    const receiver = yield user_model_1.User.findOne({ email: receiverEmail.toLowerCase() });
    if (!sender)
        throw new Error('Sender account not found.');
    if (!receiver)
        throw new Error('User with this email not found.');
    // Prevent self-invite
    if (sender._id.toString() === receiver._id.toString()) {
        throw new Error('You cannot invite yourself.');
    }
    // Check if already friends
    const isFriend = (sender.friends || []).some((friendId) => friendId.toString() === receiver._id.toString());
    if (isFriend) {
        throw new Error('You are already friends with this user.');
    }
    // Check if an invitation is already pending
    const existingInvite = yield invite_model_1.Invite.findOne({
        senderId,
        receiverEmail: receiverEmail.toLowerCase(),
        status: 'pending',
    });
    if (existingInvite) {
        throw new Error('An invitation is already pending.');
    }
    return yield invite_model_1.Invite.create({
        senderId,
        receiverEmail: receiverEmail.toLowerCase(),
        status: 'pending',
    });
});
// Get invitations received by the current user
const getReceived = (userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    return yield invite_model_1.Invite.find({
        receiverEmail: userEmail.toLowerCase(),
        status: 'pending',
    }).populate('senderId', 'firstName lastName email');
});
// Accept an invitation
const accept = (invitationId) => __awaiter(void 0, void 0, void 0, function* () {
    const invite = yield invite_model_1.Invite.findById(invitationId);
    if (!invite || invite.status !== 'pending') {
        throw new Error('Invalid or expired invitation.');
    }
    // Find both users
    const sender = yield user_model_1.User.findById(invite.senderId);
    const receiver = yield user_model_1.User.findOne({ email: invite.receiverEmail });
    if (!sender || !receiver) {
        throw new Error('One of the users no longer exists.');
    }
    // Update partnerId for both users
    yield user_model_1.User.findByIdAndUpdate(sender._id, { $addToSet: { friends: receiver._id } });
    yield user_model_1.User.findByIdAndUpdate(receiver._id, { $addToSet: { friends: sender._id } });
    // Mark invitation as accepted
    invite.status = 'accepted';
    return yield invite.save();
});
// Reject/Cancel an invitation
const reject = (invitationId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield invite_model_1.Invite.findByIdAndUpdate(invitationId, { status: 'rejected' }, { new: true });
});
exports.default = {
    send,
    getReceived,
    accept,
    reject,
};
