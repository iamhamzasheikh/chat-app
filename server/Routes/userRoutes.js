import express from 'express'
import { login, signup, updateProfile } from '../controllers/usercontroller.js';
import { checkAuth, protectRoute } from '../Middleware/auth.js';


const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.put('/update-profile', protectRoute, updateProfile);
userRouter.get('/check', protectRoute, checkAuth);

export default userRouter;