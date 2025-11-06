-- ลบ policies เดิมที่มีปัญหา infinite recursion และสร้างใหม่แบบง่ายๆ
-- อนุญาตให้ทุกคนที่ login แล้วทำงานได้เลย ไม่ต้องเช็ค role

-- ==========================================
-- PROFILES TABLE
-- ==========================================

-- ลบ policies เดิมทั้งหมดของ profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- สร้าง policies ใหม่แบบง่ายๆ
CREATE POLICY "Anyone authenticated can view profiles"
ON profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ==========================================
-- KOLS TABLE
-- ==========================================

-- ลบ policies เดิม
DROP POLICY IF EXISTS "Admins can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Analysts can view all KOLs" ON kols;
DROP POLICY IF EXISTS "Brand users can view KOLs" ON kols;
DROP POLICY IF EXISTS "KOL users can view their own profile" ON kols;
DROP POLICY IF EXISTS "Admins can insert KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can update KOLs" ON kols;
DROP POLICY IF EXISTS "Admins can delete KOLs" ON kols;

-- สร้าง policies ใหม่ - ให้ทุกคนที่ login แล้วทำได้หมด
CREATE POLICY "Authenticated users can view KOLs"
ON kols FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert KOLs"
ON kols FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update KOLs"
ON kols FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete KOLs"
ON kols FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- ACCOUNTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Analysts can view all accounts" ON accounts;
DROP POLICY IF EXISTS "Brand users can view their own accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can insert accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can update accounts" ON accounts;
DROP POLICY IF EXISTS "Admins can delete accounts" ON accounts;

CREATE POLICY "Authenticated users can view accounts"
ON accounts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert accounts"
ON accounts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts"
ON accounts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete accounts"
ON accounts FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- CAMPAIGNS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Analysts can view all campaigns" ON campaigns;
DROP POLICY IF EXISTS "Brand users can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can insert campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON campaigns;

CREATE POLICY "Authenticated users can view campaigns"
ON campaigns FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert campaigns"
ON campaigns FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update campaigns"
ON campaigns FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete campaigns"
ON campaigns FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- POSTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all posts" ON posts;
DROP POLICY IF EXISTS "Analysts can view all posts" ON posts;
DROP POLICY IF EXISTS "Brand users can view posts" ON posts;
DROP POLICY IF EXISTS "Admins can insert posts" ON posts;
DROP POLICY IF EXISTS "Admins can update posts" ON posts;
DROP POLICY IF EXISTS "Admins can delete posts" ON posts;

CREATE POLICY "Authenticated users can view posts"
ON posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert posts"
ON posts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
ON posts FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete posts"
ON posts FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- PROJECTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
DROP POLICY IF EXISTS "Analysts can view all projects" ON projects;
DROP POLICY IF EXISTS "Brand users can view their projects" ON projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

CREATE POLICY "Authenticated users can view projects"
ON projects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert projects"
ON projects FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
ON projects FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete projects"
ON projects FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- COMMENTS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update comments" ON comments;
DROP POLICY IF EXISTS "Users can delete comments" ON comments;

CREATE POLICY "Authenticated users can view comments"
ON comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert comments"
ON comments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update comments"
ON comments FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete comments"
ON comments FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- MEMO_LOGS TABLE (ถ้ามี)
-- ==========================================

DROP POLICY IF EXISTS "Users can view memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can insert memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can update memo logs" ON memo_logs;
DROP POLICY IF EXISTS "Users can delete memo logs" ON memo_logs;

CREATE POLICY "Authenticated users can view memo logs"
ON memo_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert memo logs"
ON memo_logs FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update memo logs"
ON memo_logs FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete memo logs"
ON memo_logs FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- STATUS_CHANGES TABLE (ถ้ามี)
-- ==========================================

DROP POLICY IF EXISTS "Users can view status changes" ON status_changes;
DROP POLICY IF EXISTS "Users can insert status changes" ON status_changes;

CREATE POLICY "Authenticated users can view status changes"
ON status_changes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert status changes"
ON status_changes FOR INSERT
TO authenticated
WITH CHECK (true);

-- ==========================================
-- KOL_CHANNELS TABLE
-- ==========================================

DROP POLICY IF EXISTS "Admins can view all channels" ON kol_channels;
DROP POLICY IF EXISTS "KOL users can view their own channels" ON kol_channels;
DROP POLICY IF EXISTS "Brand users can view active channels" ON kol_channels;
DROP POLICY IF EXISTS "Admins can insert channels" ON kol_channels;
DROP POLICY IF EXISTS "Admins can update channels" ON kol_channels;
DROP POLICY IF EXISTS "KOL users can update their own channels" ON kol_channels;

CREATE POLICY "Authenticated users can view kol channels"
ON kol_channels FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert kol channels"
ON kol_channels FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update kol channels"
ON kol_channels FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete kol channels"
ON kol_channels FOR DELETE
TO authenticated
USING (true);
