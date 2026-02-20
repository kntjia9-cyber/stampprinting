
export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function DashboardPage() {
    // Redirect to templates for now as it's the main feature
    redirect("/admin/templates");
}
