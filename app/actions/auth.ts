"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";
const COOKIE_NAME = "admin_session";

export async function login(formData: FormData) {
    const password = formData.get("password") as string;

    if (password === ADMIN_PASSWORD) {
        (await cookies()).set(COOKIE_NAME, "authenticated", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: "/",
        });
        redirect("/admin/dashboard");
    } else {
        return { error: "รหัสผ่านไม่ถูกต้อง" };
    }
}

export async function logout() {
    (await cookies()).delete(COOKIE_NAME);
    redirect("/admin/login");
}

export async function isAuthenticated() {
    return (await cookies()).has(COOKIE_NAME);
}
