import { generateToken } from '../lib/utils.js';
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

// signup new user

export const signup = async (req, res) => {

    const { fullName, email, password, bio } = req.body;

    try {

        if (!fullName || !email || !password || !bio) {
            return req.json({ success: false, message: 'Missing Details' })
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.json({ success: false, message: 'Email already used' })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        })

        const token = generateToken(newUser._id);
        res.json({ success: true, userData: newUser, token, message: 'Account created successfully' })

    } catch (error) {
        res.json({ success: false, message: error.message });
        console.log(error.message);
    }
}