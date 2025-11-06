#!/bin/bash
# Debug Logs Helper
# Shows real-time logs when testing KOL module

echo "🔍 KOL Module - Debug Logs"
echo "=========================="
echo ""
echo "📝 Logs will appear below:"
echo ""

# Watch for Next.js logs (if .next/trace exists)
if [ -d ".next" ]; then
    echo "✅ Watching Next.js logs..."
    echo ""
    # You can watch server logs here
    tail -f .next/trace 2>/dev/null || echo "⚠️  No trace file yet"
else
    echo "⚠️  .next directory not found. Start server first: pnpm dev"
fi

echo ""
echo "💡 Tips:"
echo "   - Open Browser Console (F12) for client-side errors"
echo "   - Check Network tab for API errors"
echo "   - Server logs appear in terminal where you ran 'pnpm dev'"

