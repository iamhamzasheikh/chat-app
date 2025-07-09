// import React, { useEffect, useRef, useState } from 'react'
// import assets from '../assets/assets'
// import { formatMessageTime } from "../lib/utils.js";
// import { useContext } from 'react';
// import { ChatContext } from '../../context/ChatContext.jsx';
// import { AuthContext } from '../../context/AuthContext.jsx';
// import toast from 'react-hot-toast';

// const ChatContainer = () => {

//   const { messages, selectedUser, setSelectedUser, sendMessages, getMessages } = useContext(ChatContext)
//   const { authUser, onlineUsers } = useContext(AuthContext)

//   const scrollEnd = useRef();

//   const [input, setInput] = useState('');

//   // const handleSendMessage = async (e) => {
//   //   e.preventDefault();
//   //   if (input.trim() === '')
//   //     return null;

//   //   await sendMessages({ text: input.trim() });
//   //   setInput('');

//   // }

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (input.trim() === '') return;

//     try {
//       await sendMessages({ text: input.trim() });
//       setInput('');
//     } catch (error) {
//       console.error("Send message error:", error);
//       toast.error("Failed to send message");
//     }
//   };


//   // handle sending an image

//   // const handleSendImage = async (e) => {

//   //   const file = e.target.files[0];
//   //   if (!file || !file.type.startsWith('image/')) {
//   //     toast.error("Select an image file");
//   //     return;
//   //   }
//   //   const reader = new FileReader();

//   //   reader.onloadend = async () => {

//   //     await sendMessages({ image: reader.result });
//   //     e.target.value = '';
//   //   }
//   //   reader.readAsDataURL(file);
//   // }

//   const handleSendImage = async (e) => {
//     const file = e.target.files[0]; // <-- fixed here
//     if (!file || !file.type.startsWith('image/')) {
//       toast.error("Select an image file");
//       return;
//     }

//     const reader = new FileReader();

//     reader.onloadend = async () => {
//       await sendMessages({ image: reader.result });
//       e.target.value = ''; // clear the file input
//     };

//     reader.readAsDataURL(file);
//   };


//   useEffect(() => {
//     if (selectedUser) {
//       getMessages(selectedUser.id)
//     }

//   }, [selectedUser])


//   useEffect(() => {
//     if (scrollEnd.current && messages) {
//       scrollEnd.current.scrollIntoView({ behavior: 'smooth' })
//     }

//   }, [messages])

//   return selectedUser ? (
//     <div className='h-full overflow-scroll relative backdrop-blur-lg'>

//       {/* Header */}

//       <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
//         <img src={selectedUser.profilePic || assets.avatar_icon} alt="profile-img" className='w-8 rounded-full' />

//         <p className='flex-1 text-lg text-white flex items-center gap-2'> {selectedUser.fullName}

//           {onlineUsers?.includes(selectedUser._id)}

//           <span className='w-2 h-2 rounded-full bg-green-500'></span>
//         </p>

//         <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="arrow-icon" className='md:hidden max-w-7' />
//         <img src={assets.help_icon} alt="help" className='max-md:hidden max-w-5' />

//       </div>

//       {/* chat Area */}

//       <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>

//         {messages.map((msg, index) => (
//           <div key={index} className={`flex items-end gap-2 justify-end
//            ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}>

//             {msg.image ?
//               (<img className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8'
//                 src={msg.image} />) :
//               (<p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white
//               ${msg.senderId === authUser._id ? 'rounded-br-none' : 'rounded-bl-none'}`}>{msg.text}</p>)}

//             <div className='text-center text-sm'>
//               <img className='w-7 rounded-full'
//                 src={msg.senderId === authUser._id ? authUser.profilePic : assets.avatar_icon} alt="" />
//               <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
//             </div>
//           </div>
//         ))}

//         <div ref={scrollEnd} className=''></div>
//       </div>

//       {/* bottom-area */}

//       <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
//         <div className='flex flex-1 items-center bg-gray-100/12 px-3 rounded-full'>

//           <input onChange={(e) => setInput(e.target.value)} value={input} onKeyDown={(e) => e.key === 'Enter' ? handleSendMessage(e) : null} type="text" className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'
//             placeholder='Send a message' />

//           <input onChange={handleSendImage} type="file" id='image' accept='image.png, image/ jpeg' hidden />

//           <label htmlFor="image">
//             <img src={assets.gallery_icon} alt="gallery" className='w-5 mr-2 cursor-pointer' />
//           </label>

//         </div>
//         <img onClick={handleSendMessage} src={assets.send_button} className='w-7 cursor-pointer' />
//       </div>



//     </div>

//   ) : (
//     <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
//       <img src={assets.logo_icon} alt="logo-icon" className='max-w-16' />
//       <p className='text-lg font-medium text-white'>chat anytime, anywhere</p>
//     </div>
//   )
// }

// export default ChatContainer


import React, { useEffect, useRef, useState, useContext } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils.js";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessages, getMessages, users } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const scrollEnd = useRef();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    try {
      await sendMessages({ text: input.trim() });
      setInput("");
      // Optional fallback in case socket is slow
      // await getMessages(selectedUser._id);
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
    }
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessages({ image: reader.result });
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">

        <img src={selectedUser.profilePic || assets.avatar_icon} alt="profile-img" className="w-8 rounded-full" />

        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {/* <span className={`w-2 h-2 rounded-full ${onlineUsers?.includes(selectedUser._id) ? "bg-green-500" : "bg-gray-400"}`}></span> */}

          <span
            className={`w-2 h-2 rounded-full ${onlineUsers?.some((id) =>
              id?.toString().trim() === selectedUser?._id?.toString().trim()
            )
                ? "bg-green-500"
                : "bg-gray-400"
              }`}
          ></span>


        </p>
        <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="back" className="md:hidden max-w-7" />
        <img src={assets.help_icon} alt="help" className="max-md:hidden max-w-5" />
      </div>

      {/* Chat Area */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages
          .filter((msg) => msg && msg.senderId && (msg.text || msg.image))
          .map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id ? "flex-row-reverse" : ""
                }`}
            >
              {msg.image ? (
                <img
                  className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                  src={msg.image}
                  alt="sent image"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId === authUser._id ? "rounded-br-none" : "rounded-bl-none"
                    }`}
                >
                  {msg.text}
                </p>
              )}

              <div className="text-center text-sm">
                <img
                  className="w-7 rounded-full"
                  src={msg.senderId === authUser._id ? authUser.profilePic : users.find((user) => user._id === msg.senderId)?.profilePic || assets.avatar_icon}
                  alt="avatar"
                />
                <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
        <div ref={scrollEnd}></div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex flex-1 items-center bg-gray-100/12 px-3 rounded-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(e)}
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
            placeholder="Send a message"
          />
          <input onChange={handleSendImage} type="file" id="image" accept="image/*" hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="gallery" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <img onClick={handleSendMessage} src={assets.send_button} className="w-7 cursor-pointer" alt="send" />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="logo-icon" className="max-w-16" />
      <p className="text-lg font-medium text-white">chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
