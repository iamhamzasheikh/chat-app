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


    const { socket, authUser } = useContext(AuthContext);
    // function to get all user from sidebar

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

    //function to subscribe to message for selected user

    const subscribeToMessages = async () => {
        if (!socket) return;

        // socket.on('newMessage', (newMessage) => {
        //     if (selectedUser && newMessage.senderId === selectedUser._id) {
        //         newMessage.seen = true;
        //         setMessages((prevMessages) => [...prevMessages, newMessage])
        //         axios.put(`/api/message/mark/${newMessage._id}`);
        //     }

        //     else {
        //         setUnseenMessages((prevUnseenMessages) => ({
        //             ...prevUnseenMessages, [newMessage.senderId]:
        //                 prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
        //         }))
        //     }
        // })

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

    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )


}