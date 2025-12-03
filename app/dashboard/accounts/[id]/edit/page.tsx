import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { AccountEditForm } from "@/components/account-edit-form"

export default async function EditAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Try to fetch with social channels, fallback to without them if table doesn't exist
  let { data: account, error } = await supabase
    .from("accounts")
    .select(`
      *,
      account_channels (
        id,
        channel_type,
        handle,
        profile_url,
        follower_count,
        verified,
        status,
        follower_history
      )
    `)
    .eq("id", id)
    .single()

  // If error is due to missing table, try again without social channels
  if (error && (error.code === "42P01" || error.message?.includes("does not exist") || error.message?.includes("account_channels"))) {
    console.warn("[v0] account_channels table not found, fetching without social channels:", error.message)
    const result = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single()
    
    account = result.data
    error = result.error
    
    // Set account_channels to empty array if table doesn't exist
    if (account) {
      account.account_channels = []
    }
  }

  if (error || !account) {
    console.error("[v0] Error fetching account:", error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แก้ไขบัญชีลูกค้า</h1>
        <p className="text-muted-foreground">แก้ไขข้อมูล {account.name}</p>
      </div>
      <AccountEditForm account={account} />
    </div>
  )
}

