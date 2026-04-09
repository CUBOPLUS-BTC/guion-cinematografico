import NextAuth from "next-auth"
import { authConfig } from "./config"

/** Sin Prisma — solo verificación JWT; usar en middleware (Edge). */
export const { auth } = NextAuth(authConfig)
