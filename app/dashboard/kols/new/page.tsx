import { KOLForm } from "@/components/kol-form"

export default function NewKOLPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">เพิ่ม KOL ใหม่</h1>
        <p className="text-muted-foreground">กรอกข้อมูล KOL และช่องทางโซเชียลมีเดีย</p>
      </div>
      <KOLForm />
    </div>
  )
}
