@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 24 LTS y vuelve a abrir este archivo.
  pause
  exit /b 1
)
echo Torres Garage 1.0.0
echo Cliente: http://127.0.0.1:5173/
echo Administrador: http://127.0.0.1:5173/admin
echo Cierra esta ventana para detener el sistema.
node server.mjs
pause
