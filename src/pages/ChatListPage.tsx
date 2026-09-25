import { useEffect, useState } from "react";
import { Link, Outlet, useParams } from "react-router-dom";
import { getAllUsers } from "../api/users.api";
import { type User } from "../types/user.types";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Avatar from "../components/ui/Avatar";

export default function ChatListPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { userId, username, logout } = useAuth();
    const { unreadCounts, onlineUserIds } = useSocket();
    const { chatId } = useParams();

    useEffect(() => {
        getAllUsers()
            .then((allUsers) => setUsers(allUsers.filter((u) => u.id !== userId)))
            .finally(() => setLoading(false));
    }, [userId]);

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-user">
                        <Avatar name={username || "?"} size="sm" />
                        <span className="sidebar-username">{username}</span>
                    </div>
                    <button className="icon-button" onClick={logout}>
                        Logout
                    </button>
                </div>

                {loading ? (
                    <p style={{ padding: 16, color: "var(--text-muted)", fontSize: 14 }}>
                        Loading users...
                    </p>
                ) : (
                    <ul className="user-list">
                        {users.map((u) => {
                            const unread = unreadCounts[u.id] || 0;
                            const isOnline = onlineUserIds.has(u.id);
                            return (
                                <li className="user-list-item" key={u.id}>
                                    <Link
                                        to={`/chats/${u.id}`}
                                        className={chatId === u.id ? "active" : ""}
                                    >
                                        <Avatar name={u.username} size="sm" online={isOnline} />
                                        <span className="user-list-name">{u.username}</span>
                                        {unread > 0 && (
                                            <span className="unread-badge">{unread}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </aside>

            <main className="main-pane">
                {chatId ? (
                    <Outlet />
                ) : (
                    <div className="empty-state">Select a user to start chatting.</div>
                )}
            </main>
        </div>
    );
}