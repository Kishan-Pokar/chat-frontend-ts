import { useState,useEffect, type FormEvent } from "react";
import { useNavigate,Link,useLocation } from "react-router-dom";
import { loginUser } from "../api/auth.api";
import { getAllUsers } from "../api/users.api";
import { getUserIdFromToken } from "../utils/jwt";
import { useAuth } from "../context/AuthContext";


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
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input
        type="email"
          value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
      {showRegistrationSuccess && (
        <p style={{ color: "green" }}>
          Registration successful. Login to continue.
        </p>
      )}
    </form>
  );
}