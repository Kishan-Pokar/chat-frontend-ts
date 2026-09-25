import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthState {
    token: string | null;
    userId: string | null;
    username: string | null;
}

interface AuthContextValue extends AuthState {
    login: (token: string, userId: string, username: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        token: localStorage.getItem("token"),
        userId: localStorage.getItem("userId"),
        username: localStorage.getItem("username"),
    });

    function login(token: string, userId: string, username: string) {
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);
        localStorage.setItem("username", username);
        setAuthState({ token, userId, username });
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        setAuthState({ token: null, userId: null, username: null });
    }

    return (
        <AuthContext.Provider
            value={{ ...authState, login, logout, isAuthenticated: !!authState.token }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}