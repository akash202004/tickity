import { ConvexHttpClient } from "convex/browser";

export const getConvexClient = () => {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("Convex URL not found");
  }
  return new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
};
