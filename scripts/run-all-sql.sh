#!/bin/bash
# Script to run all SQL files in order
# 
# This script will help you run all SQL migrations
# 
# Option 1: Use Supabase Dashboard (recommended)
# Option 2: Use psql with connection string

echo "🚀 KOL Management - SQL Migration Scripts"
echo "=========================================="
echo ""

# Check if connection string is provided
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "📋 Method 1: Use Supabase Dashboard (Recommended)"
  echo "=========================================="
  echo ""
  echo "1. Go to: https://supabase.com/dashboard/project/_/sql"
  echo "2. Copy and paste each SQL file in order"
  echo "3. Click Run"
  echo ""
  echo "Files to run (in order):"
  echo ""
  
  SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
  cd "$SCRIPTS_DIR"
  
  # List all SQL files in order
  count=1
  for file in *.sql; do
    if [[ "$file" != "run"* && "$file" != "test"* ]]; then
      echo "$count. $file"
      count=$((count + 1))
    fi
  done
  
  echo ""
  echo "=========================================="
  echo ""
  echo "📋 Method 2: Use psql (Command Line)"
  echo "=========================================="
  echo ""
  echo "1. Get connection string from Supabase Dashboard:"
  echo "   Settings > Database > Connection string > URI"
  echo ""
  echo "2. Set environment variable:"
  echo "   export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres'"
  echo ""
  echo "3. Run this script again:"
  echo "   ./scripts/run-all-sql.sh"
  echo ""
  
  exit 0
fi

# If connection string is provided, run with psql
echo "📋 Running SQL scripts with psql..."
echo ""

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPTS_DIR"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
  echo "❌ Error: psql is not installed"
  echo "   Install: brew install postgresql (macOS)"
  exit 1
fi

# Run all SQL files in order
for file in *.sql; do
  if [[ "$file" != "run"* && "$file" != "test"* ]]; then
    echo "📄 Running: $file"
    psql "$SUPABASE_DB_URL" -f "$file"
    
    if [ $? -eq 0 ]; then
      echo "✅ Completed: $file"
    else
      echo "❌ Failed: $file"
      echo "   Continue with next file? (y/n)"
      read -r response
      if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
      fi
    fi
    echo ""
  fi
done

echo "✅ All SQL scripts completed!"
