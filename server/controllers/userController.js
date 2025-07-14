import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import 'dotenv/config'
import transporter from '../lib/nodeMailer.js';




// signup new user

export const signup = async (req, res) => {

    const { fullName, email, password, bio } = req.body;

    try {

        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: 'Missing Details' })
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

// login-a-user


export const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        const userData = await User.findOne({ email });

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if (!isPasswordCorrect) {
            return res.json({ success: false, message: 'Invalid Password' })
        }

        const token = generateToken(userData._id);
        return res.json({ success: true, userData, token, message: 'Login Successful' })


    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })

    }
}

// if user forgot his password

// const transporter = nodemailer.createTransport({

//     host: 'smtp-relay.brevo.com',
//     port: 587,
//     secure: false, // use STARTTLS
//     auth: {
//         user: process.env.SENDER_EMAIL,
//         pass: process.env.SENDER_PASS,
//     }

// });

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    console.log("received email", email)

    try {

        const user = await User.findOne({ email });

        if (!user)
            return res.json({ success: false, message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); //6-digit otp

        const expiry = Date.now() + 10 * 60 * 1000 // after 10 mints 

        user.resetOtp = otp;
        user.resetOtpExpireAt = expiry;
        await user.save();

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'OTP for the Reset Password',
            html: `<p>Your OTP is: <b>${otp}</b><br>It is valid for 10 minutes.</p>`
        });

        res.json({ success: true, message: 'OTP is sent to Email' })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });

    }
}

// verify the otp

export const verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {

        const user = await User.findOne({ email });

        if (!user || user.resetOtp !== otp || user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'Invalid OTP' })
        }

        res.json({ success: true, message: 'OTP verified' })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


// now make function to reset the password


export const resetPasswordWithOtp = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    try {

        if (newPassword !== confirmPassword) {
            return res.json({ success: false, message: 'Password do not match' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP is Expired' })
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        res.json({ success: true, message: 'Password Reset Successfully' });


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });

    }
}






// controller to update user profile details

export const updateProfile = async (req, res) => {
    try {

        const { profilePic, bio, fullName } = req.body;

        const userID = req.user._id;

        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userID, { bio, fullName }, { new: true })
        }
        else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userID, { profilePic: upload.secure_url, bio, fullName }, { new: true });
        }

        res.json({ success: true, user: updatedUser })

    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }

}