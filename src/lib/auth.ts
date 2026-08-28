import { authConfig } from '@/lib/auth-config';
import NextAuth from "next-auth";

const handler = NextAuth(authConfig);

export const { handlers } = handler;
export const { auth } = handler;
export const { GET, POST } = handlers;
