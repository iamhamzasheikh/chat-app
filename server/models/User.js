// import mongoose from "mongoose";

// const messageSchema = new mongoose.Schema({
//     senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
//     receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", require: true },
//     text: { type: String },
//     image: { type: String },
//     seen: { type: Boolean, default: false },

// }, { timestamps: true })


// const Message = mongoose.model("Message", messageSchema)

// export default Message;

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