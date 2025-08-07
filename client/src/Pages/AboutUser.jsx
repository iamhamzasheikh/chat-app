import React, { useContext, useState } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const AboutUser = () => {

    const { selectedUser, setSelectedUser } = useContext(ChatContext);
    const { authUser, setAuthUser, token } = useContext(AuthContext);

    const [showConfirm, setShowConfirm] = useState(false);


    // const handleBlockUser = async () => {
    //     try {
    //         await axios.put(`/api/user/block/${selectedUser._id}`, {}, {
    //             headers: {
    //                 Authorization: `Bearer ${authUser?.token || authUser?.userData?.token}`
    //             }
    //         });

    //         toast.success("User blocked successfully");
    //     } catch (error) {
    //         toast.error("Failed to block user");
    //         console.error(error);
    //     }
    // };


    // const handleUnblockUser = async () => {
    //     try {
    //         await axios.put(`/api/user/unblock/${selectedUser._id}`, {}, {
    //             headers: {
    //                 Authorization: `Bearer ${authUser?.token || authUser?.userData?.token}`
    //             }
    //         });

    //         toast.success("User unblocked successfully");
    //     } catch (error) {
    //         toast.error("Failed to unblock user");
    //         console.error(error);
    //     }
    // };

    const handleBlockUser = async () => {
        try {
            await axios.put(`/api/user/block/${selectedUser._id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // ✅ Update selectedUser locally
            setSelectedUser(prev => ({
                ...prev,
                isBlocked: true
            }));

            // ✅ Optionally update authUser.blockedUsers
            setAuthUser(prev => ({
                ...prev,
                blockedUsers: [...(prev.blockedUsers || []), selectedUser._id]
            }));

            toast.success("User blocked successfully");
            setShowConfirm(false);
        } catch (error) {
            toast.error("Failed to block user");
            console.error(error);
        }
    };

    const handleUnblockUser = async () => {
        try {
            await axios.put(`/api/user/unblock/${selectedUser._id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSelectedUser(prev => ({
                ...prev,
                isBlocked: false
            }));

            setAuthUser(prev => ({
                ...prev,
                blockedUsers: (prev.blockedUsers || []).filter(id => id !== selectedUser._id)
            }));

            toast.success("User unblocked successfully");
        } catch (error) {
            toast.error("Failed to unblock user");
            console.error(error);
        }
    };


    console.log('selectedUser:', selectedUser);
    console.log('authUser:', authUser);




    return (
        <>
            <div className='border border-red-600 min-h-screen bg-cover bg-no-repeat flex flex-col gap-5 items-center justify-center'>

                <h3 className='text-white text-2xl'>Friend Info</h3>

                <div className=' w-[700px] h-[500px] backdrop-blur-2xl text-gray-300 border-2 border-gray-600
                flex justify-center pt-10 gap-25 max-sm:flex-col-reverse rounded-lg'>

                    {/* Profile Picture on the left */}
                    <div className='w-36 h-36 rounded-full overflow-hidden shadow-lg border-2 border-gray-500'>
                        <img
                            className='w-full h-full object-cover'
                            src={selectedUser?.profilePic}
                            alt="Profile"
                        />
                    </div>

                    {/* Friend Info on the right */}
                    <div className='flex flex-col gap-5 text-lg'>
                        <p>
                            <span className='font-semibold'>Name:</span>
                            <span className='ml-4'>{selectedUser?.fullName || 'N/A'}</span>
                        </p>
                        <p>
                            <span className='font-semibold'>Email:</span>
                            <span className='ml-4'>{selectedUser?.email || 'No email found'}</span>
                        </p>
                        <p>
                            <span className='font-semibold'>Bio:</span>
                            <span className='ml-4'>{selectedUser?.bio || 'No Bio found'}</span>
                        </p>

                        <div className='flex gap-3'>
                            <button onClick={() => setShowConfirm(true)}
                                className='cursor-pointer border border-red-700 hover:bg-red-700 text-white py-1 px-4 rounded'>
                                Block
                            </button>

                            <button onClick={handleUnblockUser}
                                className='cursor-pointer border border-green-500 hover:bg-green-950 py-1 px-4 rounded'>
                                unblock
                            </button>

                            {/* Confirmation Modal */}
                            {showConfirm && (
                                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  
                                bg-white text-black shadow-lg border rounded p-4 w-72 z-50 animate-fadeInScale">
                                    <p className="mb-4 font-medium">
                                        Are you sure you want to block <span className='font-bold'>{selectedUser?.fullName}</span>?</p>
                                    <div className="flex justify-end gap-4">
                                        <button
                                            className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded"
                                            onClick={() => setShowConfirm(false)}
                                        >
                                            No
                                        </button>
                                        <button
                                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-4 rounded"
                                            onClick={handleBlockUser}
                                        >
                                            Yes
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>



                </div>







            </div>
        </>
    )
}

export default AboutUser
