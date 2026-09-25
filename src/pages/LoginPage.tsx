import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import { getAllUsers } from "../api/users.api";
import { getUserIdFromToken } from "../utils/jwt";
import { useAuth } from "../context/AuthContext";
import AuthHeroArt from "../components/ui/AuthHeroArt";


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const location = useLocation();
    const [showRegistrationSuccess] = useState(
        () => Boolean(location.state?.registrationSuccess)
    );

    useEffect(() => {
        if (showRegistrationSuccess) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, []);
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { token } = await loginUser({ email, password });

            const userId = getUserIdFromToken(token);
            if (!userId) {
                throw new Error("Malformed token — could not extract userId");
            }

            const users = await getAllUsers();
            const currentUser = users.find((u) => u.id === userId);

            if (!currentUser) {
                throw new Error("Logged-in user not found in /users list");
            }
            login(token, userId, currentUser.username);
            navigate("/chats");

        } catch (err) {
            console.error(err);
            setError("Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-hero">
                <AuthHeroArt />
                <div className="auth-hero-content">
                    <h2 className="auth-hero-title">Message. Instantly.</h2>
                </div>
            </div>

            <div className="auth-form-panel">
                <div className="auth-card">
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Log in to continue your conversations.</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {showRegistrationSuccess && (
                            <p className="form-message success">
                                Registration successful. Login to continue.
                            </p>
                        )}

                        <input
                            className="text-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                        <input
                            className="text-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        {error && <p className="form-message error">{error}</p>}
                        <button className="primary-button" type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Don't have an account? <Link to="/register">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}