import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import axios from "axios";


export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});


    const { socket, authUser, setAuthUser } = useContext(AuthContext);
    // function to get all user from sidebar


    // ✅ Socket listeners for real-time blocking
    useEffect(() => {
        if (socket) {

            // when someone block you
            socket.on('user-blocked-you', (data) => {
                console.log('User blocked you:', data);

                // AuthUser update karo
                setAuthUser(prev => ({
                    ...prev,
                    blockedBy: [...(prev.blockedBy || []), data.blockerUserId]
                }));

                // toast.error('You have been blocked by a user');
            });

            // when someone unblock you
            socket.on('user-unblocked-you', (data) => {
                console.log('User unblocked you:', data);

                setAuthUser(prev => ({
                    ...prev,
                    blockedBy: (prev.blockedBy || []).filter(id => id !== data.unblockerUserId)
                }));

                // toast.success('You have been unblocked');
            });

            return () => {
                socket.off('user-blocked-you');
                socket.off('user-unblocked-you');
            };
        }
    }, [socket, setAuthUser]);

    const getUsers = async () => {
        try {

            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }

    // function to get selected users

    const getMessages = async (userId) => {

        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);

            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // send message to selected users

    const sendMessages = async (messageData) => {
        try {

            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);

            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessages]);
            }
            else {
                toast.error(data.message);
            }

        } catch (error) {
            toast.error(error.message);
        }
    }


        // ✅ Block user function with socket emit
    const blockUser = async (userId) => {
        try {
            const response = await axios.put(`/api/user/block/${userId}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                // Update authUser locally
                setAuthUser(prev => ({
                    ...prev,
                    blockedUsers: [...(prev.blockedUsers || []), userId]
                }));

                // ✅ Socket se notification send karo
                if (socket) {
                    socket.emit('block-user', {
                        blockerUserId: authUser._id,
                        blockedUserId: userId
                    });
                }

                toast.success("User blocked successfully");
            }
        } catch (error) {
            toast.error("Failed to block user");
            console.error(error);
        }
    };

    // ✅ Unblock user function with socket emit
    const unblockUser = async (userId) => {
        try {
            const response = await axios.put(`/api/user/unblock/${userId}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                // Update authUser locally
                setAuthUser(prev => ({
                    ...prev,
                    blockedUsers: (prev.blockedUsers || []).filter(id => id !== userId)
                }));

                // ✅ Socket se notification send karo
                if (socket) {
                    socket.emit('unblock-user', {
                        unblockerUserId: authUser._id,
                        unblockedUserId: userId
                    });
                }

                toast.success("User unblocked successfully");
            }
        } catch (error) {
            toast.error("Failed to unblock user");
            console.error(error);
        }
    };

    

    //function to subscribe to message for selected user

    const subscribeToMessages = async () => {
        if (!socket) return;

        socket.on('newMessage', (newMessage) => {
            if (selectedUser && (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                if (newMessage.senderId !== authUser._id) {
                    axios.put(`/api/message/mark/${newMessage._id}`);
                }
            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: prevUnseenMessages[newMessage.senderId]
                        ? prevUnseenMessages[newMessage.senderId] + 1
                        : 1
                }));
            }
        });

    }

    //function to unsubscribe from messages

    const unSubscribeFromMessages = () => {

        if (socket) socket.off("newMessage");

    }

    useEffect(() => {

        subscribeToMessages();
        return () => unSubscribeFromMessages();

    }, [socket, selectedUser])

    const value = {

        messages, setMessages,
        users, setUsers,
        selectedUser, setSelectedUser,
        unseenMessages, setUnseenMessages,
        sendMessages,
        getUsers,
        getMessages,
        blockUser,
        unblockUser,

    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )


}