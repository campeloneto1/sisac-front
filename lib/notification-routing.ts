export function resolveNotificationHref(actionUrl?: string | null) {
  if (!actionUrl) {
    return null;
  }

  if (actionUrl.startsWith("/api/")) {
    return actionUrl.replace(/^\/api/, "");
  }

  if (actionUrl.startsWith("/")) {
    return actionUrl;
  }

  return null;
}
