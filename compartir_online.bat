@echo off
title Compartir Votacion por Internet (Tunel Seguro)
echo ========================================================
echo   COMPARTIR VOTACION POR INTERNET PARA CELULARES
echo ========================================================
echo.
echo Creando enlace publico HTTPS gratuito con LocalTunnel...
echo Asegurate de que 'iniciar.bat' este ejecutandose primero.
echo.
echo Tu IP publica (por si la pagina te la pide como contrasena):
curl -s https://loca.lt/mytunnelpassword
echo.
echo ========================================================
echo Copia el enlace que aparecera abajo y envialo por WhatsApp:
echo ========================================================
echo.
npx --yes localtunnel --port 3000
pause
