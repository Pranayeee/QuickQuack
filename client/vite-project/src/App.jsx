import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './App.css';
import Chat from '../src/components/Chat.jsx';

// Initialize socket outside the component
const socket = io("http://localhost:3001", {
  reconnection: true,
  autoConnect: true,
  timeout: 5000,
});

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleMessage = (data) => {
      // Add timestamp to help identify duplicates
      const messageWithId = {
        ...data,
        _id: Date.now() + Math.random().toString(36).substr(2, 9)
      };
      
      setMessages(prev => {
        // Filter out potential duplicates
        if (prev.some(msg => msg._id === messageWithId._id)) {
          return prev;
        }
        return [...prev, messageWithId];
      });
      console.log("📨 New message:", messageWithId);
    };

    const handleConnect = () => {
      setIsConnected(true);
      console.log("✅ Connected to server. ID:", socket.id);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("❌ Disconnected from server");
    };

    const handleConnectError = (err) => {
      console.error("Connection failed:", err.message);
    };

    // Register event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("receive_message", handleMessage);
    socket.on("connect_error", handleConnectError);

    return () => {
      // Clean up all listeners
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive_message", handleMessage);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  return ( 
    <>  
   
    <div className="App"> 
     
      {!showChat ? (
        <div className="joinChatContainer">
          <h1>QuickQuack</h1>
          <p>Status: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}</p>
          
          <h3>Join Chat</h3>
          <input
            type="text"
            placeholder="Username..."
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <Chat 
          socket={socket} 
          username={username} 
          room={room} 
          messages={messages}
        />
      )}
    </div>
    </>
  );
}

export default App;