import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaUserRepository } from "@/infrastructure/database/repositories/PrismaUserRepository";
import { AuthenticateUserUseCase } from "@/core/use-cases/auth/AuthenticateUserUseCase";
import { UserRepository } from "@/core/domain/repositories/UserRepository";
import { PasswordHasher } from "@/infrastructure/security/BcryptPasswordHasher";

export function createAuthOptions(customRepo?: UserRepository, customHasher?: PasswordHasher): NextAuthOptions {
  return {
    session: {
      strategy: "jwt",
      maxAge: 6 * 60 * 60, // 6 hours maximum inactivity session lifetime
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    providers: [
      CredentialsProvider({
        id: "credentials",
        name: "Credentials",
        credentials: {
          username: { label: "Username", type: "text", placeholder: "admin" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          const repo = customRepo ?? new PrismaUserRepository();
          const useCase = new AuthenticateUserUseCase(repo, customHasher);

          const user = await useCase.execute({
            username: credentials.username,
            password: credentials.password,
          });

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.username = (user as any).username;
          token.role = (user as any).role;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user && token) {
          session.user.id = token.id as string;
          session.user.username = token.username as string;
          session.user.role = token.role as string;
        }
        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET || "aaw-garageflow-super-secret-jwt-key-change-in-prod-2026",
  };
}

export const authOptions: NextAuthOptions = createAuthOptions();
