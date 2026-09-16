import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";
import { getAllUsers } from "../api/users.api";
import { type User } from "../types/user.types";
import Avatar from "../components/ui/Avatar";

export default function ChatRoomPage() {
  const { chatId } = useParams();
  const { messages, sendMessage, setActiveChatId } = useSocket();
  const { userId } = useAuth();
  const [content, setContent] = useState("");
  const [otherUser, setOtherUser] = useState<User | null>(null);
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

  const conversation = messages.filter(
    (m) => m.from === chatId || m.to === chatId
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.length]);

  function handleSend() {
    if (!content.trim() || !chatId) return;
    sendMessage(chatId, content);
    setContent("");
  }

  return (
    <div className="chat-room">
      <div className="chat-header">
        <Avatar name={otherUser?.username || "?"} size="sm" />
        <span className="chat-header-name">{otherUser?.username}</span>
      </div>

      <div className="message-list">
        {conversation.map((m) => (
          <div
            key={m.id}
            className={`message-row ${m.from === userId ? "own" : ""}`}
          >
            <div className="message-bubble">{m.content}</div>
          </div>
        ))}
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