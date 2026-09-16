import apiClient from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>("/users/register", payload);
  return data;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/users/login", payload);
  return data;
}