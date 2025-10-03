# Holographic Card Community - Start with ngrok tunnel
Write-Host "🎴 Starting Holographic Card Community with ngrok tunnel..." -ForegroundColor Cyan
Write-Host ""

# Start development server
Write-Host "🚀 Starting development server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev; Write-Host 'Dev server stopped' -ForegroundColor Red" -WindowStyle Normal

# Wait for dev server to start
Write-Host "⏳ Waiting for dev server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start ngrok tunnel
Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 5173 --log=stdout; Write-Host 'ngrok tunnel stopped' -ForegroundColor Red" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "  🎴 Holographic Card Community" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "📍 Local:   http://localhost:5173" -ForegroundColor White
Write-Host "🌐 Tunnel:  Check the ngrok terminal for public URL" -ForegroundColor White
Write-Host "🔍 Inspect: http://localhost:4040" -ForegroundColor White
Write-Host ""
Write-Host "✨ Features to test:" -ForegroundColor Yellow
Write-Host "   • Hover over cards for holographic effects" -ForegroundColor Gray
Write-Host "   • Click cards to see spin animation" -ForegroundColor Gray
Write-Host "   • Test on mobile devices via tunnel URL" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")