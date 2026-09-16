import { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { getAllUsers } from "../api/users.api";
import { type User } from "../types/user.types";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function ChatListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId, username, logout } = useAuth();
  const { unreadCounts } = useSocket();
  const { chatId } = useParams(); 

  useEffect(() => {
    getAllUsers()
      .then((allUsers) => {
        // Don't show yourself in your own message-someone list
        setUsers(allUsers.filter((u) => u.id !== userId));
      })
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 260, borderRight: "1px solid #ccc" }}>
        <div
          style={{
            padding: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <strong>{username}</strong>
          <button onClick={logout}>Logout</button>
        </div>

        {loading ? (
          <p style={{ padding: "0 12px" }}>Loading users...</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {users.map((u) => {
              const unread = unreadCounts[u.id] || 0;
              return (
                <li key={u.id}>
                  <Link
                    to={`/chats/${u.id}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      textDecoration: "none",
                      color: "inherit",
                      background: chatId === u.id ? "#eee" : "transparent",
                    }}
                  >
                    <span>{u.username}</span>
                    {unread > 0 && (
                      <span
                        style={{
                          background: "#25D366",
                          color: "white",
                          borderRadius: "50%",
                          minWidth: 20,
                          height: 20,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          padding: "0 5px",
                        }}
                      >
                        {unread}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <main style={{ flex: 1, padding: 16 }}>
        {chatId ? <Outlet /> : <p>Select a user to start chatting.</p>}
      </main>
    </div>
  );
}