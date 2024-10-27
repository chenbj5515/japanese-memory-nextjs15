// src/types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    userId: string;
    profile: string;
  }
  interface JWT {
    profile: string;
  }
}
