import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  userId: string;
  text: string;

  id: string;
  message: string;
  from: string;
  time: string;
  isSend: boolean;
}

interface UserMessages {
  [userId: string]: Message[];
}

export default function ChatRoom(): JSX.Element {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<UserMessages>({});

  useEffect(() => {
    // Create a new socket connection for the current user
    const newSocket = io("/user");
    setSocket(newSocket);

    // Listen for new messages from the server
    newSocket.on("received-message", (message: Message, callback) => {
      // Add the message to the user's message list
      setMessages((prevMessages) => {
        const userId = message.id;
        const userMessages = prevMessages[userId] || [];
        return {
          ...prevMessages,
          [userId]: [...userMessages, message],
        };
      });
      callback({ received: true });
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <div>
      {/* Render the messages for each user */}
      {Object.keys(messages).map((userId) => (
        <div key={userId}>
          {/* Render the user's messages in the UI */}
          {messages[userId].map((message) => (
            <div key={message.id}>{message.message}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
