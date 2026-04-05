import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("sisac_session")?.value === "authenticated";

  redirect(isAuthenticated ? "/dashboard" : "/login");
}

