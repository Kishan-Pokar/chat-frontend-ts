import apiClient from "./client";
import { type LoginResponse, type RegisterPayload, type LoginPayload, type RegisterResponse} from "../types/auth.types"


export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>("/users/register", payload);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/users/login", payload);
  return data;
}