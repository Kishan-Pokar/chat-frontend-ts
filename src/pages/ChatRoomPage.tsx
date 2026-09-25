import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { getAllUsers } from "../api/users.api";
import { type User } from "../types/user.types";
import { getChatHistory } from "../api/messages.api";
import Avatar from "../components/ui/Avatar";
import { type Message } from "../types/message.types";

function renderTicks(status: Message["status"]) {
    const tickStyle = { fontSize: 15, fontWeight: 700 };

    if (status === "READ") {
        return <span style={{ ...tickStyle, color: "#f97a1f" }}> ✓✓</span>; 
    }
    if (status === "DELIVERED") {
        return <span style={{ ...tickStyle, color: "#FFFFFF" }}> ✓✓</span>; 
    }
    return <span style={{ ...tickStyle, color: "rgba(255,255,255,0.55)" }}> ✓</span>; 
}

export default function ChatRoomPage() {
    const { chatId } = useParams();
    const { messages, sendMessage, setActiveChatId, onlineUserIds, mergeMessages } =
        useSocket();
    const { userId } = useAuth();
    const [content, setContent] = useState("");
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [historyLoading, setHistoryLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chatId) return;
        setActiveChatId(chatId);
        return () => setActiveChatId(null);
    }, [chatId]);

    useEffect(() => {
        if (!chatId) return;
        getAllUsers().then((users) => {
            setOtherUser(users.find((u) => u.id === chatId) || null);
        });
    }, [chatId]);

    useEffect(() => {
        if (!chatId) return;
        setHistoryLoading(true);
        getChatHistory(chatId)
            .then((history) => mergeMessages(history))
            .finally(() => setHistoryLoading(false));
    }, [chatId]);

    const conversation = messages
        .filter((m) => m.from === chatId || m.to === chatId)
        .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation.length]);

    function handleSend() {
        if (!content.trim() || !chatId) return;
        sendMessage(chatId, content);
        setContent("");
    }

    const isOnline = chatId ? onlineUserIds.has(chatId) : false;

    return (
        <div className="chat-room">
            <div className="chat-header">
                <Avatar name={otherUser?.username || "?"} size="sm" online={isOnline} />
                <div>
                    <div className="chat-header-name">{otherUser?.username}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {isOnline ? "Online" : "Offline"}
                    </div>
                </div>
            </div>

            <div className="message-list">
                {historyLoading ? (
                    <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                        Loading messages...
                    </p>
                ) : (
                    conversation.map((m) => (
                        <div
                            key={m.id}
                            className={`message-row ${m.from === userId ? "own" : ""}`}
                        >
                            <div className="message-bubble">
                                {m.content}
                                {m.from === userId && renderTicks(m.status)}
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            <div className="composer">
                <input
                    className="text-input"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                />
                <button className="send-button" onClick={handleSend}>
                    Send
                </button>
            </div>
        </div>
    );
}