import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { type Message } from "../types/message.types";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  messages: Message[];
  sendMessage: (to: string, content: string) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  messages: [],
  sendMessage: () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, userId } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  // Connection lifecycle — unchanged from before
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL, { auth: { token } });
    newSocket.on("connect", () => setIsConnected(true));
    newSocket.on("disconnect", () => setIsConnected(false));
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  // Message receiving — now global, not tied to any page.
  // This is the actual fix: it's alive for the whole session.
  useEffect(() => {
    if (!socket) return;

    function handleReceiveMessage(message: Message) {
      setMessages((prev) => [...prev, message]);
      socket?.emit("message_ack", { messageId: message.id });
    }

    socket.onAny((event, ...args) => {
      console.log("[SOCKET EVENT]", event, args); // debug — remove once confirmed working
    });
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.offAny();
    };
  }, [socket]);

  function sendMessage(to: string, content: string) {
    if (!socket || !userId) return;
    socket.emit("send_message", { to, content });

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: userId,
      receiver_id: to,
      content,
      timestamp: Date.now(),
      status: "SENT",
    };
    setMessages((prev) => [...prev, optimisticMessage]);
  }

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, messages, sendMessage }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}