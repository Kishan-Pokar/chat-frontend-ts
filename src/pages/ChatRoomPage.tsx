import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

export default function ChatRoomPage() {
  const { chatId } = useParams();
  const { messages, sendMessage } = useSocket();
  const { userId } = useAuth();
  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = messages.filter(
    (m) => m.sender_id === chatId || m.receiver_id === chatId
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {conversation.map((m) => (
          <div
            key={m.id}
            style={{
              textAlign: m.sender_id === userId ? "right" : "left",
              margin: "4px 0",
            }}
          >
            <span
              style={{
                background: m.sender_id === userId ? "#daf1da" : "#eee",
                padding: "6px 10px",
                borderRadius: 8,
                display: "inline-block",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}