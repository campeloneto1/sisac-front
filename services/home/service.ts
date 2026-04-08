import { api } from "@/lib/api";
import type { HomeResponse } from "@/types/home.type";

export const homeService = {
  async index(): Promise<HomeResponse> {
    const { data } = await api.get<HomeResponse>("/home");
    return data;
  },
};
