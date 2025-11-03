import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminHeader from "@/components/admin/admin-header"
import AdminStats from "@/components/admin/admin-stats"
import DealersList from "@/components/admin/dealers-list"
import SystemHealth from "@/components/admin/system-health"

export default async function AdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("user_id", user.id).single()

  if (!adminUser) {
    redirect("/dashboard")
  }

  // Get system statistics
  const { data: dealers } = await supabase.from("dealers").select("*").order("created_at", { ascending: false })

  const { data: recentLeads } = await supabase
    .from("leads")
    .select("*, dealers(dealer_name)")
    .order("created_at", { ascending: false })
    .limit(50)

  const { data: systemStats } = await supabase
    .from("system_stats")
    .select("*")
    .order("date", { ascending: false })
    .limit(30)

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Revvdoctor Admin Panel</h1>
          <p className="text-muted-foreground">Monitor and manage the Revvdoctor platform</p>
        </div>

        <div className="grid gap-6 mb-8">
          <AdminStats dealers={dealers || []} recentLeads={recentLeads || []} systemStats={systemStats || []} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DealersList dealers={dealers || []} />
          </div>
          <div>
            <SystemHealth dealers={dealers || []} recentLeads={recentLeads || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
