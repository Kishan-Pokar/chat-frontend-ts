import { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { getAllUsers } from "../api/users.api";
import { type User } from "../types/user.types"
import { useAuth } from "../context/AuthContext";

export default function ChatListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId, username, logout } = useAuth();
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
        <div style={{ padding: 12 }}>
          <strong>{username}</strong>
          <button onClick={logout} style={{ marginLeft: 8 }}>
            Logout
          </button>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {users.map((u) => (
              <li key={u.id}>
                <Link
                  to={`/chats/${u.id}`}
                  style={{
                    display: "block",
                    padding: "8px 12px",
                    background: chatId === u.id ? "#eee" : "transparent",
                  }}
                >
                  {u.username}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <main style={{ flex: 1, padding: 16 }}>
        {chatId ? <Outlet /> : <p>Select a user to start chatting.</p>}
      </main>
    </div>
  );
}