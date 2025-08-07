import Message from '../models/Message.js';
import User from '../models/User.js'
import cloudinary from '../lib/cloudinary.js';
import { io, userSocketMap } from '../server.js';

// get all users excepts the current login user 

// export const getUsersFromSidebar = async (req, res) => {

//     try {

//         const userId = req.user._id;

//         const filterUsers = await User.find({ _id: { $ne: userId } }).select('-password')

//         // count unseen message

//         const unseenMessage = {}
//         const promises = filterUsers.map(async (user) => {

//             const messages = await Message.find({
//                 senderId: user._id,
//                 receiverId: userId,
//                 seen: false
//             });
//             if (messages.length > 0) {
//                 unseenMessage[user._id] = messages.length;
//             }
//         })

//         await Promise.all(promises);
//         res.json({ success: true, users: filterUsers, unseenMessages })

//     } catch (error) {
//         console.log(error.message);
//         res.json({ success: false, message: filterUsers, unseenMessages })
//     }

// }

export const getUsersFromSidebar = async (req, res) => {
    try {
        const userId = req.user._id;

        const filterUsers = await User.find({ _id: { $ne: userId } }).select('-password');

        // count unseen messages
        const unseenMessages = {};
        const promises = filterUsers.map(async (user) => {
            const messages = await Message.find({
                senderId: user._id,
                receiverId: userId,
                seen: false
            });

            if (messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
        });

        await Promise.all(promises);

        res.json({ success: true, users: filterUsers, unseenMessages });

    } catch (error) {
        console.error("Error in getUsersFromSidebar:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};


// get all messages from selected user

export const getMessage = async (req, res) => {
    try {

        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [{
                senderId: myId,
                receiverId: selectedUserId,
            },
            {
                senderId: selectedUserId,
                receiverId: myId,
            }]
        })

        await Message.updateMany({ senderId: selectedUserId, receiverId: myId }, { seen: true })
        res.json({ success: true, messages })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}

// api to mark message as unseen using message id

export const markMessageAsSeen = async (req, res) => {

    try {

        const { id } = req.params;
        await Message.findByIdAndUpdate(id, { seen: true });
        res.json({ success: true });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


// send message to selected user


export const sendMessage = async (req, res) => {

    try {

        const { text, image } = req.body;
        const { id: receiverId } = req.params; // ✅ Correct: Destructure `id` from params
        const senderId = req.user._id; // Also ensure `_id` is used if your schema expects it

        console.log("Sender ID:", senderId); // Debug
        console.log("Receiver ID:", receiverId); // Debug

        const senderUser = await User.findById(senderId);
        const receiverUser = await User.findById(receiverId);

        if (!senderUser || !receiverUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
            });
        }

        // ✅ Block check
        if (
            senderUser.blockedUsers.includes(receiverId) ||
            receiverUser.blockedUsers.includes(senderId)
        ) {
            return res.status(403).json({
                success: false,
                message: 'You cannot send messages to this user.',
            });
        }



        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }


        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        //Emit the new message to the receivers sockets

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        //emit the new message to the sender

        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
            io.to(senderSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, newMessage });



    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}