"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { CampaignForm } from "@/components/campaign-form"

export default function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Mock data for campaigns
  const campaignData: Record<string, any> = {
    "1": {
      id: "1",
      name: "แคมเปญเปิดตัวสินค้าใหม่",
      project_id: "1",
      start_date: "2024-03-01",
      end_date: "2024-03-31",
      budget: 500000,
      status: "active",
      objective: "เพิ่มการรับรู้แบรนด์และสร้าง Engagement กับกลุ่มเป้าหมาย",
      channels: ["Instagram", "TikTok", "Facebook"],
      notes: "เน้นการสร้างคอนเทนต์ที่มีความคิดสร้างสรรค์และเข้าถึงกลุ่มเป้าหมายวัยรุ่น",
      campaign_kols: [
        {
          kol_id: "1",
          kol_channel_id: "1",
          allocated_budget: 150000,
        },
        {
          kol_id: "2",
          kol_channel_id: "2",
          allocated_budget: 120000,
        },
        {
          kol_id: "3",
          kol_channel_id: "3",
          allocated_budget: 100000,
        },
      ],
    },
  }

  // Mock projects data
  const projects = [
    {
      id: "1",
      name: "โปรเจกต์ Q1 2024",
      accounts: {
        id: "1",
        name: "บริษัท เทคโนโลยี จำกัด",
      },
    },
    {
      id: "2",
      name: "โปรเจกต์ Q2 2024",
      accounts: {
        id: "2",
        name: "บริษัท การตลาด จำกัด",
      },
    },
  ]

  // Mock KOLs data
  const kols = [
    {
      id: "1",
      name: "สมชาย ใจดี",
      handle: "somchai_tech",
      category: ["Technology", "Gadgets"],
      kol_channels: [
        {
          id: "1",
          channel_type: "Instagram",
          handle: "somchai_tech",
          follower_count: 250000,
        },
        {
          id: "4",
          channel_type: "TikTok",
          handle: "somchai_tech",
          follower_count: 180000,
        },
      ],
    },
    {
      id: "2",
      name: "สมหญิง รักเทค",
      handle: "somying_review",
      category: ["Technology", "Reviews"],
      kol_channels: [
        {
          id: "2",
          channel_type: "TikTok",
          handle: "somying_review",
          follower_count: 180000,
        },
      ],
    },
    {
      id: "3",
      name: "ปิยะ เทคโนโลยี",
      handle: "piya_gadget",
      category: ["Gadgets", "Reviews"],
      kol_channels: [
        {
          id: "3",
          channel_type: "Instagram",
          handle: "piya_gadget",
          follower_count: 150000,
        },
      ],
    },
  ]

  const campaign = campaignData[id]

  if (!campaign) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">แก้ไขแคมเปญ</h1>
        <p className="text-muted-foreground">แก้ไขข้อมูลแคมเปญ {campaign.name}</p>
      </div>

      <CampaignForm projects={projects} kols={kols} initialData={campaign} />
    </div>
  )
}
