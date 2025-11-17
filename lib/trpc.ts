import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import Constants from "expo-constants";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const extractHostFromDebugger = (debuggerHost?: string | null) => {
  if (!debuggerHost) {
    return null;
  }
  const segments = debuggerHost.split(":");
  if (segments.length === 0) {
    return null;
  }
  return segments[0];
};

const buildFallbackUrl = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  const debuggerHost = extractHostFromDebugger(Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri ?? null);
  if (debuggerHost) {
    return `http://${debuggerHost}:3000`;
  }
  return "http://localhost:3000";
};

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  const extraUrl = Constants.expoConfig?.extra && typeof Constants.expoConfig.extra === "object" ? (Constants.expoConfig.extra as Record<string, unknown>).apiBaseUrl : undefined;
  if (typeof extraUrl === "string" && extraUrl.length > 0) {
    return extraUrl;
  }
  const fallback = buildFallbackUrl();
  console.warn("[trpc] EXPO_PUBLIC_RORK_API_BASE_URL missing. Using fallback API base URL:", fallback);
  return fallback;
};

const baseUrl = getBaseUrl();

console.log("[trpc] Using API base URL:", baseUrl);

export const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpLink({
      url: `${baseUrl}/api/trpc`,
    }),
  ],
});
