@echo off
REM Build the app and serve EVERYTHING (app + API + community) on one port (4000).
REM People on the SAME WiFi can then open it on their phones/laptops.
cd /d "C:\Users\Hp\behavioral-finance-app"
echo.
echo ==================================================================
echo  Building the app (takes ~10-20 seconds the first time)...
echo ==================================================================
call npm run build
echo.
echo ==================================================================
echo  Your app is starting on port 4000.
echo.
echo  1) On THIS PC open:            http://localhost:4000
echo  2) For OTHERS on your WiFi:    http://YOUR-PC-IP:4000
echo.
echo     To find YOUR-PC-IP: open a new PowerShell and type  ipconfig
echo     Use the "IPv4 Address" (looks like 192.168.x.x).
echo.
echo  Keep this window open while sharing. Close it to stop.
echo ==================================================================
echo.
call npm start
pause
