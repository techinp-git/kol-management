"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Plus, Trash2, Search, User } from "lucide-react"

const rateItemSchema = z.object({
  post_type: z.string().min(1, "กรุณาระบุประเภทโพสต์"),
  price: z.string().min(1, "กรุณาระบุราคา"),
  currency: z.string().default("THB"),
  description: z.string().optional(),
})

const formSchema = z.object({
  kol_id: z.string().min(1, "กรุณาเลือก KOL"),
  name: z.string().min(1, "กรุณาระบุชื่อ Rate Card"),
  description: z.string().optional(),
  effective_from: z.string().min(1, "กรุณาระบุวันที่เริ่มใช้งาน"),
  effective_to: z.string().optional(),
  status: z.enum(["draft", "active", "expired"]),
  rate_items: z.array(rateItemSchema).min(1, "กรุณาเพิ่มอย่างน้อย 1 รายการ"),
})

type FormValues = z.infer<typeof formSchema>

interface RateCardFormProps {
  kols: Array<{ id: string; name: string; contact_email?: string; email?: string }>
  initialData?: any
  rateCardId?: string
}

export function RateCardForm({ kols, initialData, rateCardId }: RateCardFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isKolDialogOpen, setIsKolDialogOpen] = useState(false)
  const [kolSearchTerm, setKolSearchTerm] = useState("")
  const supabase = createBrowserClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      kol_id: "",
      name: "",
      description: "",
      effective_from: new Date().toISOString().split("T")[0],
      effective_to: "",
      status: "draft",
      rate_items: [{ post_type: "", price: "", currency: "THB", description: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "rate_items",
  })

  // Filter KOLs based on search term
  const filteredKols = useMemo(() => {
    if (!kolSearchTerm) return kols
    const searchLower = kolSearchTerm.toLowerCase()
    return kols.filter(
      (kol) =>
        kol.name.toLowerCase().includes(searchLower) ||
        (kol.contact_email || kol.email || "").toLowerCase().includes(searchLower)
    )
  }, [kols, kolSearchTerm])

  // Get selected KOL name for display
  const selectedKol = useMemo(() => {
    const kolId = form.watch("kol_id")
    return kols.find((k) => k.id === kolId)
  }, [kols, form.watch("kol_id")])

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้")

      const rateCardData = {
        kol_id: values.kol_id,
        name: values.name,
        description: values.description,
        effective_from: values.effective_from,
        effective_to: values.effective_to || null,
        status: values.status,
        created_by: user.id,
      }

      let rateCardResult
      if (rateCardId) {
        const { data, error } = await supabase
          .from("rate_cards")
          .update(rateCardData)
          .eq("id", rateCardId)
          .select()
          .single()

        if (error) throw error
        rateCardResult = data

        // Delete existing rate items
        await supabase.from("rate_items").delete().eq("rate_card_id", rateCardId)
      } else {
        const { data, error } = await supabase.from("rate_cards").insert(rateCardData).select().single()

        if (error) throw error
        rateCardResult = data
      }

      // Insert rate items
      const rateItems = values.rate_items.map((item) => ({
        rate_card_id: rateCardResult.id,
        post_type: item.post_type,
        price: Number.parseFloat(item.price),
        currency: item.currency,
        description: item.description,
      }))

      const { error: itemsError } = await supabase.from("rate_items").insert(rateItems)

      if (itemsError) throw itemsError

      toast.success(rateCardId ? "อัปเดต Rate Card สำเร็จ" : "สร้าง Rate Card สำเร็จ")
      router.push(`/dashboard/rate-cards/${rateCardResult.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error saving rate card:", error)
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลพื้นฐาน</CardTitle>
            <CardDescription>กรอกข้อมูลพื้นฐานของ Rate Card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="kol_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KOL</FormLabel>
                  <FormControl>
                    <Dialog open={isKolDialogOpen} onOpenChange={setIsKolDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <User className="mr-2 h-4 w-4" />
                          {selectedKol ? (
                            <span>
                              {selectedKol.name} ({selectedKol.contact_email || selectedKol.email || "ไม่มีอีเมล"})
                            </span>
                          ) : (
                            <span className="text-muted-foreground">เลือก KOL</span>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                        <DialogHeader>
                          <DialogTitle>เลือก KOL</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="ค้นหา KOL..."
                              value={kolSearchTerm}
                              onChange={(e) => setKolSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                          <div className="flex-1 overflow-y-auto border rounded-md">
                            {filteredKols.length > 0 ? (
                              <div className="divide-y">
                                {filteredKols.map((kol) => (
                                  <button
                                    key={kol.id}
                                    type="button"
                                    onClick={() => {
                                      field.onChange(kol.id)
                                      setIsKolDialogOpen(false)
                                      setKolSearchTerm("")
                                    }}
                                    className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                                  >
                                    <div className="font-medium">{kol.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {kol.contact_email || kol.email || "ไม่มีอีเมล"}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center text-muted-foreground">
                                ไม่พบ KOL ที่ค้นหา
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            พบ {filteredKols.length} รายการ
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อ Rate Card</FormLabel>
                  <FormControl>
                    <Input placeholder="เช่น Standard Rate 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คำอธิบาย</FormLabel>
                  <FormControl>
                    <Textarea placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับ Rate Card นี้" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="effective_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันที่เริ่มใช้งาน</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effective_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันที่สิ้นสุด (ถ้ามี)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>เว้นว่างไว้หากไม่มีวันสิ้นสุด</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สถานะ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">แบบร่าง</SelectItem>
                      <SelectItem value="active">ใช้งาน</SelectItem>
                      <SelectItem value="expired">หมดอายุ</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>รายการอัตราค่าบริการ</CardTitle>
                <CardDescription>กำหนดราคาสำหรับแต่ละประเภทโพสต์</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ post_type: "", price: "", currency: "THB", description: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มรายการ
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <FormField
                          control={form.control}
                          name={`rate_items.${index}.post_type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ประเภทโพสต์</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="เลือกประเภท" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="feed">Feed Post</SelectItem>
                                  <SelectItem value="story">Story</SelectItem>
                                  <SelectItem value="reel">Reel/Short</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                  <SelectItem value="live">Live Stream</SelectItem>
                                  <SelectItem value="carousel">Carousel</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name={`rate_items.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ราคา</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`rate_items.${index}.currency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>สกุลเงิน</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="THB">THB (บาท)</SelectItem>
                                    <SelectItem value="USD">USD (ดอลลาร์)</SelectItem>
                                    <SelectItem value="EUR">EUR (ยูโร)</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`rate_items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>คำอธิบาย (ถ้ามี)</FormLabel>
                              <FormControl>
                                <Input placeholder="รายละเอียดเพิ่มเติม" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {fields.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "กำลังบันทึก..." : rateCardId ? "อัปเดต" : "สร้าง Rate Card"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
