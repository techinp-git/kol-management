# ตั้งค่า MCP (Model Context Protocol) กับ Supabase

MCP ช่วยให้ Cursor IDE เชื่อมต่อกับ Supabase database โดยตรง เพื่อให้ AI สามารถ:
- อ่านข้อมูลจาก database
- รัน SQL queries
- ดู schema และ tables
- ดึงข้อมูล real-time

## วิธีติดตั้งและตั้งค่า

### วิธีที่ 1: ใช้ Supabase MCP Server (แนะนำ)

1. **ติดตั้ง Supabase MCP Server:**
   ```bash
   npm install -g @supabase/mcp-server-supabase
   ```

2. **ตั้งค่า Environment Variables:**
   
   เพิ่มใน `.env.local`:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   
   **หา Service Role Key ได้ที่:**
   - ไปที่: https://supabase.com/dashboard/project/_/settings/api
   - ค้นหา "service_role" key (secret)

3. **ตั้งค่า Cursor MCP Config:**
   
   ไฟล์ `.cursor/mcp.json` ถูกสร้างไว้แล้ว แต่ต้องเพิ่ม Service Role Key:
   
   - เปิด `.cursor/mcp.json`
   - แก้ไข `SUPABASE_SERVICE_ROLE_KEY` ให้ใช้ค่า real key (ไม่ใช่ placeholder)
   - หรือใช้ environment variable: `"SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"`

4. **Restart Cursor:**
   - ปิดและเปิด Cursor ใหม่
   - MCP server จะเริ่มทำงานอัตโนมัติ

5. **ตรวจสอบการเชื่อมต่อ:**
   - ไปที่ Cursor Settings → MCP
   - ควรเห็น "supabase" server เป็น "active" (สีเขียว)

### วิธีที่ 2: ใช้ Custom MCP Server

1. **สร้าง MCP Server Script:**
   ```bash
   # สร้างไฟล์ mcp-server.js
   ```

2. **ตั้งค่าใน Cursor:**
   - ใช้ `.cursor/mcp.json` ที่มีอยู่แล้ว

## ตรวจสอบการทำงาน

### วิธีทดสอบ:

1. **ใช้ Test Script:**
   ```bash
   pnpm test:supabase
   ```

2. **ถาม AI ใน Cursor:**
   - "Show me all tables in Supabase"
   - "What's the schema of profiles table?"
   - "Run a query to get all KOLs"

3. **ตรวจสอบ MCP Status:**
   - ไปที่ Cursor Settings → MCP
   - ดูว่า server "supabase" เป็น active หรือไม่

## Troubleshooting

### ปัญหา: MCP server ไม่ทำงาน

**แก้ไข:**
1. ตรวจสอบว่า Service Role Key ถูกต้อง
2. ตรวจสอบว่า Supabase URL ถูกต้อง
3. Restart Cursor
4. ตรวจสอบ logs ใน Cursor (Help → Toggle Developer Tools)

### ปัญหา: Cannot connect to Supabase

**แก้ไข:**
1. ตรวจสอบ internet connection
2. ตรวจสอบ Supabase project status
3. ตรวจสอบว่า Service Role Key ไม่ expired

### ปัญหา: Permission denied

**แก้ไข:**
1. ใช้ Service Role Key (ไม่ใช่ Anon Key)
2. ตรวจสอบว่า key มีสิทธิ์ที่ถูกต้อง

## หมายเหตุ

- **Service Role Key** มีสิทธิ์สูงมาก - อย่า expose ใน public repositories
- ใช้ `.env.local` หรือ environment variables สำหรับเก็บ secrets
- MCP server จะทำงานใน background เมื่อ Cursor เปิดอยู่

## ข้อมูลเพิ่มเติม

- [Supabase MCP Server](https://github.com/supabase/mcp-server)
- [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- [Cursor MCP Documentation](https://cursor.sh/docs/mcp)

