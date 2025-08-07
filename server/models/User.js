import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    password: { type: String, minlength: 6, required: true },
    profilePic: { type: String, default: '' },
    bio: { type: String, required: true },
    isBlocked: { type: Boolean, default: false },

    blockedUsers: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    ],

    //Reset Password

    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: Number, default: 0 }

}, { timestamps: true })


const User = mongoose.model("User", userSchema)

export default User;