@echo off
title Servidor de Votacion VIP en Vivo
echo ========================================================
echo   INICIANDO APP DE VOTACION VIP (TIEMPO REAL)
echo ========================================================
echo.
echo Abriendo servidor local y generando enlace para celulares...
echo.
start http://localhost:3000
npm start
pause
