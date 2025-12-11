import { AccountForm } from "@/components/account-form"

export default function NewAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">เพิ่มบัญชีลูกค้าใหม่</h1>
        <p className="text-muted-foreground">กรอกข้อมูลบัญชีลูกค้า</p>
      </div>
      <AccountForm />
    </div>
  )
}
