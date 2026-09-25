import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";

export default function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <AppRouter />
            </SocketProvider>
        </AuthProvider>
    );
}