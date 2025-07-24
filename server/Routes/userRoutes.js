import express from 'express'
import { login, signup, updateProfile, sendResetOtp, verifyResetOtp, resetPasswordWithOtp, verifySignupOtp } from '../controllers/userController.js';
import { checkAuth, protectRoute } from '../Middleware/auth.js';


const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/verify-otp', verifySignupOtp);

userRouter.post('/login', login);
userRouter.put('/update-profile', protectRoute, updateProfile);
userRouter.get('/check', protectRoute, checkAuth);

// Forget passwords routes

userRouter.post('/forgot-password', sendResetOtp);
userRouter.post('/verify-otp', verifyResetOtp);
userRouter.post('/reset-password', resetPasswordWithOtp);

export default userRouter;