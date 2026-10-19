@echo off
echo ============================================================
echo   Habilitando TCP/IP y Reiniciando SQL Server (MSSQLSERVER)
echo ============================================================
powershell -Command "Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp' -Name 'Enabled' -Value 1; Restart-Service -Name MSSQLSERVER -Force"
echo.
if %ERRORLEVEL% EQU 0 (
    echo [EXITO] TCP/IP habilitado y servicio SQL Server reiniciado correctamente.
) else (
    echo [ERROR] No se pudo completar. Asegurate de ejecutar este archivo como Administrador.
)
echo.
pause

