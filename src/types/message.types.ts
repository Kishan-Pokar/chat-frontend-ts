export interface Message {
    id: string;
    from: string;
    to: string;
    content: string;
    timestamp: number;
    status: "PENDING" | "SENT" | "DELIVERED" | "READ";
}