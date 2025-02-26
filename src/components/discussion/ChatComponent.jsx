import React, { useState, useEffect, useRef } from "react";
import { User, LogOut, Send, Users, X, Wifi, WifiOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import AllUsers from "./AllUsers";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import api from "../../store/axios";

const ChatComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [currentReceiver, setCurrentReceiver] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);
  const token = useSelector((state) => state.token);

  // Connect to socket on component mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Initialize socket connection
    const socketInstance = io(import.meta.env.VITE_API_URL, {
      auth: { token },
    });

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      alert("Failed to connect to chat server. Please try again later.");
    });

    // Listen for incoming messages
    socketInstance.on("message", (data) => {
      if (
        (data.senderId === currentReceiver?.id &&
          data.receiverId === getUserId()) ||
        (data.receiverId === currentReceiver?.id &&
          data.senderId === getUserId())
      ) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: data.text,
            sender: data.senderId === getUserId() ? "user" : "other",
            timestamp: new Date(data.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        // Clear typing indicator when message is received
        if (data.senderId === currentReceiver?.id) {
          setOtherUserTyping(false);
        }
      }
    });

    // Listen for typing status updates
    socketInstance.on("typingStatus", (data) => {
      if (currentReceiver?.id === data.userId) {
        setOtherUserTyping(data.isTyping);
      }
    });

    // Listen for user online/offline status updates
    socketInstance.on("userStatus", (data) => {
      if (currentReceiver?.id === data.userId) {
        setOtherUserOnline(data.status === "online");
      }
    });

    setSocket(socketInstance);

    // Cleanup socket connection on component unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [navigate, currentReceiver]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherUserTyping]);

  // Get user ID from token
  const getUserId = () => {
    if (!token) return null;
    try {
      // Basic JWT decoding (assumes token is in format header.payload.signature)
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      return decodedPayload.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Join chatroom when receiver is selected
  useEffect(() => {
    if (socket && currentReceiver) {
      // Clear previous messages
      setMessages([]);
      // Reset typing and online status
      setOtherUserTyping(false);
      setOtherUserOnline(false);

      const senderId = getUserId();
      const receiverId = currentReceiver.id;

      if (senderId && receiverId) {
        // Create chatroom ID by combining IDs (smaller ID first)
        const chatroomId =
          senderId < receiverId
            ? `${senderId}_${receiverId}`
            : `${receiverId}_${senderId}`;

        // Join the chatroom
        socket.emit("joinChatroom", chatroomId);

        // Fetch previous messages for this conversation
        fetchConversation(senderId, receiverId);
      }
    }
  }, [socket, currentReceiver]);

  // Handle typing events
  useEffect(() => {
    if (!socket || !currentReceiver) return;

    if (isTyping) {
      socket.emit("typing", { receiverId: currentReceiver.id, isTyping: true });
    } else {
      socket.emit("typing", {
        receiverId: currentReceiver.id,
        isTyping: false,
      });
    }
  }, [isTyping, socket, currentReceiver]);

  // Fetch conversation history between two users
  const fetchConversation = async (senderId, receiverId) => {
    try {
      const { data } = await api.get(
        `/api/chat/conversation?receiverId=${receiverId}`
      );

      // Transform API response to match local message format
      const formattedMessages = data.discussions.map((msg) => ({
        id: msg._id,
        text: msg.message,
        sender: msg.senderId === senderId ? "user" : "other",
        timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Handle typing status
    if (!isTyping && e.target.value.trim() !== "") {
      setIsTyping(true);
    }

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout - stop typing indicator after 2 seconds of inactivity
    const newTimeout = setTimeout(() => {
      if (e.target.value.trim() === "" || !e.target.value) {
        setIsTyping(false);
      }
    }, 2000);

    setTypingTimeout(newTimeout);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !currentReceiver || !socket) return;

    const senderId = getUserId();

    if (!senderId) {
      alert("You must be logged in to send messages");
      navigate("/login");
      return;
    }

    // Emit message to server
    socket.emit("sendMessage", {
      text: newMessage,
      receiverId: currentReceiver.id,
    });

    // Clear typing status
    setIsTyping(false);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    setNewMessage("");
  };

  const handleUserSelect = (user) => {
    setCurrentReceiver({ id: user._id, username: user.username });
    setShowUsersModal(false);
  };

  const handleLogout = () => {
    // Disconnect socket
    if (socket) {
      socket.disconnect();
    }
    dispatch({ type: "logout" });
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat Container */}
      <div className="w-full max-w-4xl mx-auto h-full flex flex-col shadow-xl bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-full mr-3">
              <User size={20} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {currentReceiver
                  ? `Chat with ${currentReceiver.username}`
                  : "Support Chat"}
              </h1>
              <p className="text-xs text-indigo-200 flex items-center">
                {currentReceiver ? (
                  <>
                    {otherUserOnline ? (
                      <>
                        {/* <Wifi
                          size={14}
                          className="inline mr-1 text-green-300"
                        /> */}
                        <span className="text-green-400">Online</span>
                      </>
                    ) : (
                      <>
                        {/* <WifiOff
                          size={14}
                          className="inline mr-1 text-red-300"
                        /> */}
                        <span className="text-red-300">Offline</span>
                      </>
                    )}
                  </>
                ) : (
                  "Select a user to start chatting"
                )}
              </p>
            </div>
          </div>
          <div className="flex space-x-4">
            {/* All Users Button */}
            <button
              onClick={() => setShowUsersModal(true)}
              className="p-2 bg-indigo-500 hover:bg-indigo-700 rounded-full transition-colors"
              aria-label="All Users"
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 hover:bg-indigo-700 rounded-full transition-colors"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {currentReceiver ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs md:max-w-md ${
                      message.sender === "user" ? "order-2" : "order-1"
                    }`}
                  >
                    <div
                      className={`p-4 rounded-xl shadow-sm ${
                        message.sender === "user"
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white border border-gray-200 rounded-bl-none"
                      }`}
                    >
                      {message.text}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        message.sender === "user"
                          ? "text-right text-gray-500"
                          : "text-gray-500"
                      }`}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="max-w-xs md:max-w-md">
                    <div className="bg-gray-100 text-gray-700 p-3 rounded-xl shadow-sm rounded-bl-none inline-block">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-xs mt-1 text-gray-500">
                      {currentReceiver.username} is typing...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-gray-200 p-4 bg-white"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              placeholder={
                currentReceiver
                  ? "Type your message..."
                  : "Select a user to start chatting"
              }
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              disabled={!currentReceiver}
            />
            <button
              type="submit"
              className={`text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                currentReceiver
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!currentReceiver}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Confirm Logout
              </h3>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <p className="mb-6 text-gray-600">
              Are you sure you want to log out? Any unsaved progress will be
              lost.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Modal */}
      {showUsersModal && (
        <AllUsers
          onClose={() => setShowUsersModal(false)}
          onUserSelect={handleUserSelect}
        />
      )}
    </div>
  );
};

export default ChatComponent;
