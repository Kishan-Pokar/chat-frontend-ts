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
    onlineUserIds: Set<string>;
    sendMessage: (to: string, content: string) => void;
    setActiveChatId: (chatId: string | null) => void;
    mergeMessages: (newMessages: Message[]) => void;
}

const SocketContext = createContext<SocketContextValue>({
    socket: null,
    isConnected: false,
    messages: [],
    unreadCounts: {},
    onlineUserIds: new Set(),
    sendMessage: () => { },
    setActiveChatId: () => { },
    mergeMessages: () => { },
});

export function SocketProvider({ children }: { children: ReactNode }) {
    const { token, isAuthenticated, userId } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    const activeChatIdRef = useRef<string | null>(null);

    function mergeMessages(newMessages: Message[]) {
        setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = newMessages.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newOnes];
        });
    }

    function setActiveChatId(chatId: string | null) {
        activeChatIdRef.current = chatId;
        if (chatId) {
            setUnreadCounts((prev) => {
                if (!prev[chatId]) return prev;
                const updated = { ...prev };
                delete updated[chatId];
                return updated;
            });
            socket?.emit("chat-opened", { fromUserId: chatId });
        }
    }

    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
            auth: { token },
            autoConnect: false,
        });

        newSocket.on("connect", () => {
            console.log("[SOCKET] connect fired, id:", newSocket.id);
            setIsConnected(true);
            newSocket.emit("fetch_offline_messages");
            console.log("[SOCKET] fetch_offline_messages emitted");
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
        });

        setSocket(newSocket);
        newSocket.connect();

        return () => {
            newSocket.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [isAuthenticated, token]);

    // Everything else: safe to attach on a later render, since these events
    // only ever fire well after connection is already established.
    useEffect(() => {
        if (!socket) return;

        function handleReceiveMessage(message: Message) {
            setMessages((prev) => [...prev, message]);
            socket?.emit("message_ack", { messageId: message.id });

            if (message.from !== activeChatIdRef.current) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [message.from]: (prev[message.from] || 0) + 1,
                }));
            } else {
                socket?.emit("chat-opened", { fromUserId: message.from });
            }
        }

        function handleOfflineMessages(offlineMessages: Message[]) {
            mergeMessages(offlineMessages);

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

        function handleMessageDelivered({ messageId }: { messageId: string }) {
            setMessages((prev) =>
                prev.map((m) => (m.id === messageId ? { ...m, status: "DELIVERED" } : m))
            );
        }

        function handleMessagesRead({ messageIds }: { readBy: string; messageIds: string[] }) {
            const idSet = new Set(messageIds);
            setMessages((prev) =>
                prev.map((m) => (idSet.has(m.id) ? { ...m, status: "READ" } : m))
            );
        }

        function handleUserOnline({ userId }: { userId: string }) {
            setOnlineUserIds((prev) => new Set(prev).add(userId));
        }

        function handleUserOffline({ userId }: { userId: string }) {
            setOnlineUserIds((prev) => {
                const updated = new Set(prev);
                updated.delete(userId);
                return updated;
            });
        }

        function handleOnlineUsers(userIds: string[]) {
            setOnlineUserIds(new Set(userIds));
        }

        function handleMessageSent({
            clientTempId,
            message,
        }: {
            clientTempId?: string;
            message: Message;
        }) {
            if (!clientTempId) return;
            setMessages((prev) =>
                prev.map((m) => (m.id === clientTempId ? message : m))
            );
        }

        socket.on("receive_message", handleReceiveMessage);
        socket.on("offline_messages", handleOfflineMessages);
        socket.on("message_delivered", handleMessageDelivered);
        socket.on("messages_read", handleMessagesRead);
        socket.on("user_online", handleUserOnline);
        socket.on("user_offline", handleUserOffline);
        socket.on("online_users", handleOnlineUsers);
        socket.on("message_sent", handleMessageSent);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("offline_messages", handleOfflineMessages);
            socket.off("message_delivered", handleMessageDelivered);
            socket.off("messages_read", handleMessagesRead);
            socket.off("user_online", handleUserOnline);
            socket.off("user_offline", handleUserOffline);
            socket.off("online_users", handleOnlineUsers);
            socket.off("message_sent", handleMessageSent);
        };
    }, [socket]);

    function sendMessage(to: string, content: string) {
        if (!socket || !userId) return;

        const clientTempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        socket.emit("send_message", { to, content, clientTempId });

        const optimisticMessage: Message = {
            id: clientTempId,
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
                onlineUserIds,
                sendMessage,
                setActiveChatId,
                mergeMessages,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket(): SocketContextValue {
    return useContext(SocketContext);
}