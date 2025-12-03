import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">สมัครสมาชิกสำเร็จ!</CardTitle>
            <CardDescription>กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณแล้ว กรุณาคลิกลิงก์เพื่อเปิดใช้งานบัญชี
            </p>
            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-primary underline-offset-4 hover:underline">
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
