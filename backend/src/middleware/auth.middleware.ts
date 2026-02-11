import { Request, Response, NextFunction } from 'express';

export const checkLogin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session || !req.session.isLoggedIn || !req.session.userId) {
    res.status(401).json({
      message: 'Authentication required. Please log in to access this resource.',
    });
    return;
  }
  next();
};

export const checkLogout = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.isLoggedIn) {
    res.status(403).json({
      message: 'You are already logged in!',
    });
    return;
  }
  next();
};
