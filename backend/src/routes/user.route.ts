import { Router } from 'express';
import authController from '../controllers/user.controller';
import { checkLogin, checkLogout } from '../middleware/auth.middleware';

const userRouter = Router();

userRouter.post('/signup', checkLogout, authController.signup);
userRouter.post('/login', checkLogout, authController.login);

userRouter.get('/check-auth', checkLogin, authController.checkAuth);
userRouter.put('/profile', checkLogin, authController.updateAccount);
userRouter.post('/logout', checkLogin, authController.logout);
userRouter.delete('/delete', checkLogin, authController.deleteAccount);

export default userRouter;
