"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLogout = exports.checkLogin = void 0;
const checkLogin = (req, res, next) => {
    if (!req.session || !req.session.isLoggedIn || !req.session.userId) {
        res.status(401).json({
            message: 'Authentication required. Please log in to access this resource.',
        });
        return;
    }
    next();
};
exports.checkLogin = checkLogin;
const checkLogout = (req, res, next) => {
    if (req.session && req.session.isLoggedIn) {
        res.status(403).json({
            message: 'You are already logged in!',
        });
        return;
    }
    next();
};
exports.checkLogout = checkLogout;
