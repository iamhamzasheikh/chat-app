import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from 'axios'
import { io } from 'socket.io-client'



const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUser, setOnlineUser] = useState([]);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);

    // check if the user is Authenticated and if socket, set the user data and connect the socket

    // const checkAuth = async () => {
    //     try {
    //         const { data } = await axios.get("/api/auth/check");
    //         if (data.success) {
    //             setAuthUser(data.user);
    //             connectSocket(data.user);
    //         }


    //     } catch (error) {
    //         toast.error(error.message)
    
    //     }
    // }
    const checkAuth = async () => {
        
        if (!token) {
            setLoading(false);
            return; // ✅ Avoid making request if no token
        }

        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    //Login function to handle user is authenticated and socket connection

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message)
            }

            else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //logout function to handle user logout and socket disconnection

    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUser([]);
        axios.defaults.headers.common["token", null] = null;
        toast.success("User Logged out");
        socket.disconnect();
    }

    // update profile function to handle user profile updates

    // const updateProfile = async (body) => {

    //     try {
    //         const { data } = await axios.put("/api/auth/update-profile", body);
    //         if (data.success) {
    //             setAuthUser(data.user);
    //             toast.success("profile updated successfully");
    //         }

    //         else {
    //             toast.error(data.message)
    //         }

    //     } catch (error) {
    //         toast.error(error.message)
    //     }

    // }

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body, {
                headers: {
                    token: token
                }
            });

            if (data.success) {
                setAuthUser(data.user);
                toast.success("profile updated successfully");
            }

            else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    // connect socket function to handle socket connection and online user update 

    const connectSocket = (userData) => {
        if (!userData || socket?.connected)
            return;

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });

        newSocket.connect();
        setSocket(newSocket);

        newSocket.on('getOnlineUser', (userIds) => {
            setOnlineUser(userIds);
        })
    }

    // useEffect(() => {
    //     if (token) {
    //         axios.defaults.headers.common["token"] = token;
    //     }
    //     checkAuth();

    // }, [])

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        } else {
            delete axios.defaults.headers.common["token"];
        }
        checkAuth();
    }, [token])


    const value = {
        axios,
        authUser, setAuthUser,
        onlineUser, setOnlineUser,
        socket, setSocket,
        token, setToken,
        login, logout,
        updateProfile,
        loading,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

