import { useAuth } from "../context/AuthContext";

export default function ChatListPage() {
  return <h1>hello {useAuth().username}</h1>;
}