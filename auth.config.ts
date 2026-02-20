import type { NextAuthConfig } from "next-auth";

// This configuration is used in the middleware (Edge Runtime)
// We keep it slim to stay under the 1MB limit.
export const authConfig = {
    providers: [], // Providers are added in auth.ts
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                (session.user as any).role = token.role;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        }
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    }
} satisfies NextAuthConfig;
