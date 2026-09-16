export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: number;
  status: "PENDING" | "SENT" | "DELIVERED";
}