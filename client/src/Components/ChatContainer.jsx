import React, { useEffect, useRef, useState, useContext } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils.js";
import { ChatContext } from "../../context/ChatContext.jsx";
import { AuthContext } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessages, getMessages, users } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const scrollEnd = useRef();


  const navigate = useNavigate();



  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

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
      const toastId = toast.loading('uploading image...');

      try {
        await sendMessages({ image: reader.result });
        toast.success('Image sent!', { id: toastId })

      } catch (error) {
        toast.error(error.message, 'Failed to sent image', { id: toastId })
      }

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

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenuVisible) setContextMenuVisible(false);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenuVisible]);


  // function for showing chats bu date 

  const formatDateHeader = (dateString) => {

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // const youBlocked = authUser?.blockedUsers?.includes(selectedUser?._id);
  // const blockedYou = selectedUser?.blockedUsers?.includes(authUser?._id);
  // const isBlocked = youBlocked || blockedYou;

  // ✅ Correct way
  const youBlocked = authUser?.blockedUsers?.includes(selectedUser?._id);
  const blockedYou = authUser?.blockedBy?.includes(selectedUser?._id); // ✅ authUser ke blockedBy se check karo
  const isBlocked = youBlocked || blockedYou;





  return selectedUser ? (
    <>
      <div className="h-full overflow-scroll relative backdrop-blur-lg">

        {/* Header */}
        {/* <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500"> */}

        <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500 relative cursor-pointer">


          <img onClick={() => {
            setContextMenuVisible(false);
            navigate('/about');
          }}
            src={selectedUser.profilePic || assets.avatar_icon} alt="profile-img" className="w-8 rounded-full" />

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

          {/* user-info */}
          <img src={assets.help_icon} onClick={() => navigate('/about')}
            alt="help" className="max-md:hidden max-w-5 cursor-pointer" />

        </div>

        {/* Chat Area */}
        <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6"
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenuPosition({ x: e.clientX, y: e.clientY });
            setContextMenuVisible(true);
          }}>


          {/* {messages
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
            ))} */}

          {messages
            .filter((msg) => msg && msg.senderId && (msg.text || msg.image))
            .reduce((acc, msg, index, array) => {
              const msgDate = new Date(msg.createdAt).toDateString();
              const prevMsgDate = index > 0 ? new Date(array[index - 1].createdAt).toDateString() : null;

              if (msgDate !== prevMsgDate) {
                acc.push({ type: "date", date: msg.createdAt });
              }

              acc.push({ type: "message", msg });
              return acc;
            }, [])
            .map((item, index) => {
              if (item.type === "date") {
                return (
                  <div key={`date-${index}`} className="text-center text-sm text-gray-300 my-4">
                    <span className="bg-white/10 px-3 py-1 rounded-full">{formatDateHeader(item.date)}</span>
                  </div>
                );
              }

              const { msg } = item;

              return (
                <div
                  key={index}
                  className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id ? "flex-row-reverse" : ""}`}
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
                      src={
                        msg.senderId === authUser._id
                          ? authUser.profilePic
                          : users.find((user) => user._id === msg.senderId)?.profilePic || assets.avatar_icon
                      }
                      alt="avatar"
                    />
                    <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
                  </div>
                </div>
              );
            })}




          <div ref={scrollEnd}></div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">

          {isBlocked ? (
            <div className="w-full bg-red-600/20 text-red-500 text-sm p-3 rounded-lg text-center">
              {youBlocked ? `You have blocked ${selectedUser?.fullName || 'this user'}. You cant send messages` : `${selectedUser?.fullName || 'this user'} has blocked you. You can't send messages.`}
            </div>


          ) : (

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

              <img onClick={handleSendMessage} src={assets.send_button} className="w-7 cursor-pointer" alt="send" />
            </div>
          )

          }

        </div>

      </div>


      {/* logic for right click */}

      {contextMenuVisible && (

        <ul className="fixed bg-white text-black shadow-lg rounded-md text-sm z-50"
          // style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
          style={{
            top: `${contextMenuPosition.y}px`,
            left: `${contextMenuPosition.x}px`,
            zIndex: 9999,
            minWidth: '150px',
            boxshadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
          onClick={() => setContextMenuVisible(false)}>

          <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => {
              setSelectedUser(null);
              setContextMenuVisible(false);
              toast.success("Chat closed");

            }}> close chat </li>


          <li className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => {
              setContextMenuVisible(false);
              navigate('/profile')
            }}> Edit profile </li>

          <li className="px-4 py-2 hover:bg-red-500 cursor-pointer"
            onClick={() => {
              setContextMenuVisible(false);
              localStorage.clear();
              toast.success("Logged out");
              window.location.reload();
            }}> Logout </li>
        </ul>
      )}


    </>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="logo-icon" className="max-w-16" />
      <p className="text-lg font-medium text-white">chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
