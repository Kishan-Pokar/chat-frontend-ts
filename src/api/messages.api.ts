import apiClient from "./client";
import { type Message } from "../types/message.types";

export async function getChatHistory(otherUserId: string): Promise<Message[]> {
  const { data } = await apiClient.get<Message[]>(`/messages/${otherUserId}`);
  return data;
}