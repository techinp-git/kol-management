#!/bin/bash
# Generate a single SQL file with all migrations in order

OUTPUT_FILE="all-migrations.sql"

echo "📝 Generating combined SQL file: $OUTPUT_FILE"
echo ""

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPTS_DIR"

# Ask if user wants to include DROP statements
INCLUDE_DROP=false
if [ "$1" == "--drop" ] || [ "$1" == "-d" ]; then
  INCLUDE_DROP=true
fi

# Create output file
cat > "$OUTPUT_FILE" << 'EOF'
-- ==========================================
-- KOL Management - All Migration Scripts
-- ==========================================
-- Run this file in Supabase Dashboard SQL Editor
-- https://supabase.com/dashboard/project/_/sql
-- ==========================================

EOF

# Add DROP script if requested
if [ "$INCLUDE_DROP" = true ]; then
  echo "" >> "$OUTPUT_FILE"
  echo "-- ==========================================" >> "$OUTPUT_FILE"
  echo "-- DROP ALL TABLES FIRST" >> "$OUTPUT_FILE"
  echo "-- WARNING: This will delete ALL data!" >> "$OUTPUT_FILE"
  echo "-- ==========================================" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
  cat "000_drop_all.sql" >> "$OUTPUT_FILE" 2>/dev/null || echo "-- DROP script not found" >> "$OUTPUT_FILE"
  echo "" >> "$OUTPUT_FILE"
fi

# Add all SQL files in order (excluding drop script and output files)
for file in *.sql; do
  # Skip drop script (it should be separate), output files, helper scripts, and test files
  if [[ "$file" != "000_drop_all.sql" && \
        "$file" != "all-migrations.sql" && \
        "$file" != "all-migrations-with-drop.sql" && \
        "$file" != "run"* && \
        "$file" != "test"* && \
        "$file" != "execute"* && \
        "$file" != "$OUTPUT_FILE" ]]; then
    echo "" >> "$OUTPUT_FILE"
    echo "-- ==========================================" >> "$OUTPUT_FILE"
    echo "-- File: $file" >> "$OUTPUT_FILE"
    echo "-- ==========================================" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    cat "$file" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
  fi
done

echo "✅ Generated: $OUTPUT_FILE"
echo ""
echo "📋 Next steps:"
echo "   1. Open: https://supabase.com/dashboard/project/_/sql"
echo "   2. Copy contents of $OUTPUT_FILE"
echo "   3. Paste and Run"
echo ""

