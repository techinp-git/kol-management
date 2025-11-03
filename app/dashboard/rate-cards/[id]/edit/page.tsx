import { RateCardForm } from "@/components/rate-card-form"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export default async function EditRateCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const [{ data: rateCard }, { data: kols }] = await Promise.all([
    supabase
      .from("rate_cards")
      .select(`
        *,
        rate_items(*)
      `)
      .eq("id", id)
      .single(),
    supabase.from("kols").select("id, name, email").order("name"),
  ])

  if (!rateCard) {
    notFound()
  }

  const initialData = {
    kol_id: rateCard.kol_id,
    name: rateCard.name,
    description: rateCard.description || "",
    effective_from: rateCard.effective_from,
    effective_to: rateCard.effective_to || "",
    status: rateCard.status,
    rate_items:
      rateCard.rate_items?.map((item: any) => ({
        post_type: item.post_type,
        price: item.price.toString(),
        currency: item.currency,
        description: item.description || "",
      })) || [],
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แก้ไข Rate Card</h1>
        <p className="text-muted-foreground">อัปเดตข้อมูลอัตราค่าบริการ</p>
      </div>

      <RateCardForm kols={kols || []} initialData={initialData} rateCardId={id} />
    </div>
  )
}
