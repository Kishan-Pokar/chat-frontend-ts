import {
  createContext,
  useContext,
  useEffect,
  useRef,
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
  unreadCounts: Record<string, number>;
  sendMessage: (to: string, content: string) => void;
  setActiveChatId: (chatId: string | null) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  messages: [],
  unreadCounts: {},
  sendMessage: () => {},
  setActiveChatId: () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated, userId } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // A ref, not state, because handleReceiveMessage (defined inside a
  // useEffect keyed on [socket]) needs the CURRENT active chat at the
  // moment a message arrives — without re-registering listeners every
  // time the user switches chats.
  const activeChatIdRef = useRef<string | null>(null);

  function setActiveChatId(chatId: string | null) {
    activeChatIdRef.current = chatId;
    if (chatId) {
      // Opening a chat marks it read immediately.
      setUnreadCounts((prev) => {
        if (!prev[chatId]) return prev;
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });
    }
  }

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL, { auth: { token } });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!socket) return;

    function handleConnect() {
      setIsConnected(true);
      socket?.emit("fetch_offline_messages");
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    function handleReceiveMessage(message: Message) {
      setMessages((prev) => [...prev, message]);
      socket?.emit("message_ack", { messageId: message.id });

      if (message.from !== activeChatIdRef.current) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.from]: (prev[message.from] || 0) + 1,
        }));
      }
    }

    function handleOfflineMessages(offlineMessages: Message[]) {
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newOnes = offlineMessages.filter((m) => !existingIds.has(m.id));
        return [...prev, ...newOnes];
      });

      offlineMessages.forEach((m) => {
        socket?.emit("message_ack", { messageId: m.id });
      });

      setUnreadCounts((prev) => {
        const updated = { ...prev };
        offlineMessages.forEach((m) => {
          if (m.from === activeChatIdRef.current) return;
          updated[m.from] = (updated[m.from] || 0) + 1;
        });
        return updated;
      });
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("receive_message", handleReceiveMessage);
    socket.on("offline_messages", handleOfflineMessages);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("receive_message", handleReceiveMessage);
      socket.off("offline_messages", handleOfflineMessages);
    };
  }, [socket]);

  function sendMessage(to: string, content: string) {
    if (!socket || !userId) return;
    socket.emit("send_message", { to, content });

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      from: userId,
      to,
      content,
      timestamp: Date.now(),
      status: "SENT",
    };
    setMessages((prev) => [...prev, optimisticMessage]);
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        messages,
        unreadCounts,
        sendMessage,
        setActiveChatId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  return useContext(SocketContext);
}