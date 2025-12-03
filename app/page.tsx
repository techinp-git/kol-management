import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }


  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-2xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">KOL Management System</h1>
          <p className="text-xl text-muted-foreground">ระบบจัดการ KOL และแคมเปญอย่างมืออาชีพ</p>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/auth/login">
            <Button size="lg">เข้าสู่ระบบ</Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline">
              สมัครสมาชิก
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
