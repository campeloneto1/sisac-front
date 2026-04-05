import { api } from "@/lib/api";
import type {
  ApiMessageResponse,
  AuthLoginResponse,
  AuthMeResponse,
  ForgotPasswordDTO,
  LoginDTO,
  ResetPasswordDTO,
  UpdateProfileDTO,
} from "@/types/auth.type";

export const authService = {
  async login(payload: LoginDTO): Promise<AuthLoginResponse> {
    const { data } = await api.post<AuthLoginResponse>("/auth/login", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async me(): Promise<AuthMeResponse> {
    const { data } = await api.get<AuthMeResponse>("/auth/me", {
      skipSubunit: true,
    });

    return data;
  },
  async logout(): Promise<ApiMessageResponse> {
    const { data } = await api.post<ApiMessageResponse>(
      "/auth/logout",
      {},
      {
        skipSubunit: true,
      },
    );

    return data;
  },
  async forgotPassword(payload: ForgotPasswordDTO): Promise<ApiMessageResponse> {
    const { data } = await api.post<ApiMessageResponse>("/auth/forgot-password", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async resetPassword(payload: ResetPasswordDTO): Promise<ApiMessageResponse> {
    const { data } = await api.post<ApiMessageResponse>("/auth/reset-password", payload, {
      skipSubunit: true,
    });

    return data;
  },
  async updateProfile(userId: number, payload: UpdateProfileDTO): Promise<AuthMeResponse> {
    const { data } = await api.put<AuthMeResponse>(`/users/${userId}`, payload, {
      skipSubunit: true,
    });

    return data;
  },
};
