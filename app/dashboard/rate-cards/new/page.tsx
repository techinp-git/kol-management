import { RateCardForm } from "@/components/rate-card-form"
import { createServerClient } from "@/lib/supabase/server"

export default async function NewRateCardPage() {
  const supabase = await createServerClient()

  const { data: kols } = await supabase.from("kols").select("id, name, email").order("name")

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">สร้าง Rate Card ใหม่</h1>
        <p className="text-muted-foreground">กำหนดอัตราค่าบริการสำหรับ KOL</p>
      </div>

      <RateCardForm kols={kols || []} />
    </div>
  )
}
