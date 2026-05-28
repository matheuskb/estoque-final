@echo off
chcp 65001 >nul
title EstoqueOS — Roupas & Perfumes

echo.
echo  ========================================
echo   EstoqueOS — Roupas e Perfumes
echo  ========================================
echo.

cd /d "%~dp0"

echo  [1/2] Iniciando Backend...
start "EstoqueOS [Backend]" cmd /k "cd /d "%~dp0backend" && pip install flask flask-cors -q && echo. && echo  API: http://127.0.0.1:5000 && echo  DEIXE ESTA JANELA ABERTA! && echo. && python app.py"

timeout /t 5 /nobreak >nul

echo  [2/2] Iniciando Frontend...
start "EstoqueOS [Frontend]" cmd /k "cd /d "%~dp0frontend" && npm install --silent && echo. && echo  Site: http://localhost:5173 && echo  DEIXE ESTA JANELA ABERTA! && echo. && npm run dev"

timeout /t 6 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo  ========================================
echo   Acesse: http://localhost:5173
echo   Use os botoes ROUPAS e PERFUMES
echo   para alternar entre os modulos.
echo  ========================================
echo.
pause
