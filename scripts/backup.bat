@echo off
REM Campus Connect Database Backup Script for Windows
REM This batch file provides easy access to the Python backup tools

setlocal enabledelayedexpansion

cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher
    pause
    exit /b 1
)

REM Install required packages if needed
echo Checking Python dependencies...
python -c "import motor, dotenv" 2>nul
if %errorlevel% neq 0 (
    echo Installing required Python packages...
    python -m pip install motor python-dotenv
)

echo.
echo ========================================
echo   Campus Connect Backup Tool
echo ========================================
echo.
echo Select backup type:
echo 1. Database only (quick)
echo 2. Full project (database + source code)
echo 3. List existing backups
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Starting database backup...
    python backup_database.py
) else if "%choice%"=="2" (
    echo.
    echo Starting full project backup...
    python backup_project.py
) else if "%choice%"=="3" (
    echo.
    echo Listing available backups...
    python backup_database.py --list
    echo.
    python restore_project.py --list
) else if "%choice%"=="4" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo Backup completed! Check the backups folder for your files.
pause