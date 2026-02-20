import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// We use a separate Auth instance for Middleware to avoid Prisma/Edge size issues
const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const role = (req.auth?.user as any)?.role;

    const isAdminRoute = nextUrl.pathname.startsWith("/admin");

    // If it's an admin route, enforce login and ADMIN role
    if (isAdminRoute) {
        if (!isLoggedIn || role !== "ADMIN") {
            // Redirect to the main login page for unauthorized access
            return NextResponse.redirect(new URL("/login?error=unauthorized_admin", nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/admin/:path*"],
};
