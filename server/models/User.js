import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    fullname: { type: String, required: true },
    password: { type: String, minlength: 6, required: true },
    profilePic: { type: String, default: '' },
    bio: { type: String, required: true }

}, { timestamps: true })


const User = mongoose.model("User", userSchema)

export default User;