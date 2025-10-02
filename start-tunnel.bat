@echo off
echo Starting Holographic Card Community with ngrok tunnel...
echo.

echo Starting development server...
start "Dev Server" cmd /k "npm run dev"

echo Waiting for dev server to start...
timeout /t 5 /nobreak > nul

echo Starting ngrok tunnel...
start "ngrok Tunnel" cmd /k "ngrok http 5173 --log=stdout"

echo.
echo ========================================
echo  Holographic Card Community is starting!
echo ========================================
echo.
echo Local:  http://localhost:5173
echo Tunnel: Check the ngrok terminal for public URL
echo Inspect: http://localhost:4040
echo.
echo Press any key to exit...
pause > nul