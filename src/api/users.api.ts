import apiClient from "./client";
import {type User} from "../types/user.types"


export async function getAllUsers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>("/users");
  return data;
}