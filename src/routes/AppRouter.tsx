import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ChatListPage from "../pages/ChatListPage";
import ChatRoomPage from "../pages/ChatRoomPage";
import ProtectedRoute from "./ProtectedRoute";
import RegisterPage from "../pages/RegisterPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/chats" element={<ChatListPage />} />
          <Route path="/chats/:chatId" element={<ChatRoomPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}