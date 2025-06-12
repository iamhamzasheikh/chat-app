import Message from '../models/Message.js';
import User from '../models/User.js'
import cloudinary from '../lib/cloudinary.js';

// get all users excepts the current login user 

export const getUsersFromSidebar = async (req, res) => {

    try {

        const userId = req.user._id;

        const filterUsers = await User.find({ _id: { $ne: userId } }).select('-password')

        // count unseen message

        const unseenMessage = {}
        const promises = filterUsers.map(async (user) => {

            const messages = await Message.find({
                senderId: user._id,
                receiverId: user._id,
                seen: false
            });
            if (messages.length > 0) {
                unseenMessage[user._id] = messages.length;
            }
        })

        await promises.all(promises);
        res.json({ success: true, users: filterUsers, unseenMessage })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: filterUsers, unseenMessage })
    }

}

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
        req.json({ success: true });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


// send message to selected user


export const sendMessage = async (req, res) => {

    try {

        const { text, image } = req.body;
        const receiverId = req.params;
        const senderId = req.user.id;

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        })

        res.json({success: true, newMessage});


    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}