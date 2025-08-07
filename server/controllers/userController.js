import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import 'dotenv/config'
import transporter from '../lib/nodeMailer.js';
import Otp from '../models/Otp.js';




// // signup new user

// export const signup = async (req, res) => {

//     const { fullName, email, password, bio } = req.body;

//     try {

//         if (!fullName || !email || !password || !bio) {
//             return res.json({ success: false, message: 'Missing Details' })
//         }

//         const user = await User.findOne({ email });

//         if (user) {
//             return res.json({ success: false, message: 'Email already used' })
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         const newUser = await User.create({
//             fullName, email, password: hashedPassword, bio
//         })

//         const token = generateToken(newUser._id);
//         res.json({ success: true, userData: newUser, token, message: 'Account created successfully' })

//     } catch (error) {
//         res.json({ success: false, message: error.message });
//         console.log(error.message);
//     }
// }



//request new user or signup using OTP verification

export const signup = async (req, res) => {

    const { fullName, email, password, bio } = req.body;

    try {

        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: 'Missing details' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'Email already used' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Remove any previous OTPs for the same email
        await Otp.deleteMany({ email });

        //save new OTP
        await Otp.create({ email, otp });

        //send OTP via email
        // Send email
        const mailOptions = {
            from: 'zafarhamza789@gmail.com',
            to: email,
            subject: 'Your OTP for Signup',
            html: `<h2>OTP for Signup verification is: ${otp}</h2><p>This OTP is valid for 2 minutes.</p>`
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: `OTP sent to your Email: ${email}` });


    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }

}

export const verifySignupOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const record = await Otp.findOne({ email });

        if (!record) {
            return res.status(400).json({ success: false, message: 'OTP not found or expired' });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        // At this point, OTP is correct → create user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = await User.create({
            fullName: req.body.fullName,
            email,
            password: hashedPassword,
            bio: req.body.bio,
        });

        await Otp.deleteMany({ email }); // Cleanup

        // token 
        const token = generateToken(user._id);
        res.json({ success: true, token, userData: user, message: 'Signup successful' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};



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

        if (!user)
            return res.status(400).json({ message: 'User not found' });

        if (user.resetOtp !== otp || user.resetOtpExpireAt < Date.now())
            return res.status(400).json({ message: 'Invalid OTP' });

        //otp is valid
        user.resetOtp = otp;
        user.otpVerified = true;
        // user.resetOtpExpireAt = 0;
        await user.save();

        res.json({ success: true, message: 'OTP verified' })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


// now make function to reset the password


export const resetPasswordWithOtp = async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    try {

        if (newPassword.trim() !== confirmPassword.trim()) {
            return res.json({ success: false, message: 'Password do not match' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        if (!user.resetOtp) {
            return res.json({ success: false, message: 'NO Password request found' })
        }

        // After OTP verification, give user more time to reset password
        if (user.resetOtpExpireAt < Date.now() + 5 * 60 * 1000) {
            return res.json({ success: false, message: 'OTP has Expired' })
        }

        const userOtp = user.resetOtp.toString().trim();
        const inputOtp = otp.toString().trim();

        // Verify OTP matches
        if (userOtp !== inputOtp) {
            return res.json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
        user.resetOtp = null;
        user.resetOtpExpireAt = null;
        user.otpVerified = false;
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

// to block user

export const blockUser = async (req, res) => {

    try {
        const currentUserId = req.user._id; 
        const userToBlockId = req.params.id;

        const user = await User.findById(currentUserId);
        if (!user.blockedUsers.includes(userToBlockId)) {
            user.blockedUsers.push(userToBlockId);
            await user.save();
        }

        res.status(200).json({ success: true, message: 'User blocked' });
        
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// Unblock user controller
export const unblockUser = async (req, res) => {

    try {
        const currentUserId = req.user._id;
        const userToUnblockId = req.params.id;

        await User.findByIdAndUpdate(currentUserId, {
            $pull: { blockedUsers: userToUnblockId }
        });

        res.status(200).json({ success: true, message: 'User unblocked' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};







// controller for login via google

// export const googleAuth = async (req, res) => {
//     const { email, fullName, googleId, avatar } = req.body;

//     try {
//         let user = await User.findOne({ email });

//         if (!user) {
//             const hashedPassword = await bcrypt.hash(googleId, 10);
//             user = new User({
//                 fullName,
//                 email,
//                 password: hashedPassword,
//                 avatar,
//                 bio: 'Google User',
//             });
//             await user.save();
//         }

//         const token = generateToken(user._id);
//         res.json({ success: true, token });
//     } catch (error) {
//         res.status(500).json({ success: false, message: 'Auth failed' });
//     }
// };


export const googleAuth = async (req, res) => {
    try {
        console.log('[GoogleAuth] Incoming request body:', req.body);

        const { email, fullName, googleId, avatar } = req.body;

        if (!email || !googleId || !fullName) {
            console.warn('[GoogleAuth] Missing fields');
            return res.status(400).json({ success: false, message: 'Missing required Google user data' });
        }

        let user = await User.findOne({ email });

        if (!user) {
            console.log('[GoogleAuth] Creating new user for email:', email);

            const hashedPassword = await bcrypt.hash(googleId, 10);
            user = new User({
                fullName,
                email,
                password: hashedPassword,
                avatar,
                bio: 'Google User',
            });

            await user.save();
        } else {
            console.log('[GoogleAuth] Existing user found:', email);
        }

        const token = generateToken(user._id);
        console.log('[GoogleAuth] Token generated:', token);

        return res.json({ success: true, token });

    } catch (error) {
        console.error('[GoogleAuth] Error occurred:', error);
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack,
        });
    }
};
