import NextAuth from "next-auth";
import { baseAuthConfig } from "./auth-base-config";

export const { auth: authEdge } = NextAuth(baseAuthConfig);

