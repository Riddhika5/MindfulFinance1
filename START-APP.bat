@echo off
REM Double-click this file to start MindfulFinance.
cd /d "C:\Users\Hp\behavioral-finance-app"
echo.
echo Starting MindfulFinance... please wait.
echo When you see "Local: http://localhost:5173/", open that link in your browser.
echo Keep THIS window open while using the app. Close it (or press Ctrl+C) to stop.
echo.
call npm run dev
echo.
echo The app has stopped. You can close this window.
pause
