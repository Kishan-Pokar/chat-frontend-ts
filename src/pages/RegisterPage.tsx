import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth.api";
import AuthHeroArt from "../components/ui/AuthHeroArt";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await registerUser({ username, email, password });
            navigate("/login", { state: { registrationSuccess: true } });;
        } catch (err) {
            console.error(err);
            setError("Registration failed. Try a different email/username.");
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
                    <h1 className="auth-title">Create your account</h1>
                    <p className="auth-subtitle">Start messaging in a minute.</p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <input
                            className="text-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
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
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </form>

                    <p className="auth-switch">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}