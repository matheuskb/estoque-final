@echo off
chcp 65001 >nul
title EstoqueOS

echo.
echo  ========================================
echo   EstoqueOS — Iniciando...
echo  ========================================
echo.

:: ── Backend ──────────────────────────────────────────────────────────────────
echo  [1/2] Iniciando Backend...

start "EstoqueOS [Backend]" cmd /k "cd /d C:\Users\matheus\Desktop\EstoqueOS_v2_FINAL\estoque-final\backend && echo. && echo  Instalando dependencias Python... && pip install flask flask-cors -q && echo. && echo  ======================================== && echo   Backend rodando em http://127.0.0.1:5000 && echo   DEIXE ESTA JANELA ABERTA! && echo  ======================================== && echo. && python app.py"

echo  Aguardando backend subir...
timeout /t 5 /nobreak >nul

:: ── Frontend ─────────────────────────────────────────────────────────────────
echo  [2/2] Iniciando Frontend...

start "EstoqueOS [Frontend]" cmd /k "cd /d C:\Users\matheus\Desktop\EstoqueOS_v2_FINAL\estoque-final\frontend && echo. && echo  Instalando dependencias Node... && npm install --silent && echo. && echo  ======================================== && echo   Frontend rodando em http://localhost:5173 && echo   DEIXE ESTA JANELA ABERTA! && echo  ======================================== && echo. && npm run dev"

echo  Aguardando frontend subir...
timeout /t 6 /nobreak >nul

:: ── Navegador ─────────────────────────────────────────────────────────────────
echo  Abrindo navegador...
start "" "http://localhost:5173"

echo.
echo  ========================================
echo   Tudo pronto! Acesse:
echo   http://localhost:5173
echo.
echo   Para encerrar: feche as 2 janelas
echo   abertas (Backend e Frontend)
echo  ========================================
echo.
pause
