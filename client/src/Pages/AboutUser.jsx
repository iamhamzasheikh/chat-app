// import React, { useContext, useState } from 'react'
// import { AuthContext } from '../../context/AuthContext';
// import { ChatContext } from '../../context/ChatContext';
// import toast from 'react-hot-toast';
// import axios from 'axios';


import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';

const AboutUser = () => {
    const { selectedUser, setSelectedUser, blockUser, unblockUser, socket } = useContext(ChatContext);
    const { authUser, setAuthUser } = useContext(AuthContext);

    const [showConfirm, setShowConfirm] = useState(false);

    // ✅ Socket listeners for real-time updates in AboutUser
    useEffect(() => {
        if (socket) {
            // when someone blocked you
            socket.on('user-blocked-you', (data) => {
                console.log('AboutUser: User blocked you:', data);

                // AuthUser update karo
                setAuthUser(prev => ({
                    ...prev,
                    blockedBy: [...(prev.blockedBy || []), data.blockerUserId]
                }));

                // toast.error('You have been blocked by a user');
            });

            // when someone unblocked you
            socket.on('user-unblocked-you', (data) => {
                console.log('AboutUser: User unblocked you:', data);

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

    // ✅ Use ChatContext blockUser function
    const handleBlockUser = async () => {
        try {
            await blockUser(selectedUser._id);

            // Update selectedUser locally for UI
            setSelectedUser(prev => ({
                ...prev,
                isBlocked: true,
            }));

            setShowConfirm(false);
        } catch (error) {
            console.error('Block user error:', error);
        }
    };

    // ✅ Use ChatContext unblockUser function
    const handleUnblockUser = async () => {
        try {
            await unblockUser(selectedUser._id);

            // Update selectedUser locally for UI
            setSelectedUser(prev => ({
                ...prev,
                isBlocked: false
            }));
        } catch (error) {
            console.error('Unblock user error:', error);
        }
    };

    // ✅ Check if user is blocked (real-time updates se automatically change)
    const isUserBlocked = authUser?.blockedUsers?.includes(selectedUser?._id);

    // ✅ Check if current user is blocked by selected user  
    const isBlockedBySelectedUser = authUser?.blockedBy?.includes(selectedUser?._id);

    // ✅ Real-time effect to watch authUser changes
    useEffect(() => {
        console.log('AboutUser: authUser updated:', authUser);
        console.log('AboutUser: isUserBlocked:', isUserBlocked);
        console.log('AboutUser: isBlockedBySelectedUser:', isBlockedBySelectedUser);
    }, [authUser, isUserBlocked, isBlockedBySelectedUser]);

    console.log('selectedUser:', selectedUser);
    console.log('authUser:', authUser);
    console.log('isUserBlocked:', isUserBlocked);

    return (
        <>
            <div className='border border-red-600 min-h-screen bg-cover bg-no-repeat flex flex-col gap-5 items-center justify-center'>
                <h3 className='text-white text-2xl'>Friend Info</h3>

                <div className='w-[700px] h-[500px] backdrop-blur-2xl text-gray-300 border-2 border-gray-600
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
                            <span className='ml-4'>{selectedUser?.fullName || 'No Name'}</span>
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
                            {/* ✅ Show different UI based on blocking status */}
                            {isBlockedBySelectedUser ? (
                                <div className='text-red-400 py-2 px-4 border border-red-400 rounded'>
                                    🚫 This user has blocked you
                                </div>
                            ) : !isUserBlocked ? (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className='cursor-pointer border border-red-700 hover:bg-red-700 text-white py-1 px-4 rounded'
                                >
                                    Block
                                </button>
                            ) : (
                                <button
                                    onClick={handleUnblockUser}
                                    className='cursor-pointer border border-green-500 hover:bg-green-950 text-white py-1 px-4 rounded'
                                >
                                    Unblock
                                </button>
                            )}

                            {/* ✅ Status indicator */}
                            <div className='flex items-center'>
                                {isUserBlocked && (
                                    <span className='text-red-400 text-sm'>
                                        🚫 Blocked by you
                                    </span>
                                )}
                            </div>

                            {/* Confirmation Modal */}
                            {showConfirm && (
                                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2  
                                bg-white text-black shadow-lg border rounded p-4 w-72 z-50 animate-fadeInScale">
                                    <p className="mb-4 font-medium">
                                        Are you sure you want to block <span className='font-bold'>{selectedUser?.fullName}</span>?
                                    </p>
                                    <div className="flex justify-end gap-4">
                                        <button
                                            className="bg-gray-300 cursor-pointer hover:bg-gray-400 text-black py-1 px-4 rounded"
                                            onClick={() => setShowConfirm(false)}
                                        >
                                            No
                                        </button>
                                        <button
                                            className="bg-red-600 cursor-pointer hover:bg-red-700 text-white py-1 px-4 rounded"
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