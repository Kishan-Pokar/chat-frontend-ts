import apiClient from "./client";

export interface User {
  id: string;
  username: string;
  email: string;
}

export async function getAllUsers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>("/users");
  return data;
}