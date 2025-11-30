@echo off
REM Campus Connect Database Restore Script for Windows
REM This batch file provides easy access to the Python restore tools

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
python -c "import motor, dotenv, bson" 2>nul
if %errorlevel% neq 0 (
    echo Installing required Python packages...
    python -m pip install motor python-dotenv pymongo
)

echo.
echo ========================================
echo   Campus Connect Restore Tool
echo ========================================
echo.
echo ⚠️  WARNING: Restore operations can overwrite existing data!
echo    Make sure you have a current backup before proceeding.
echo.
echo Select restore type:
echo 1. List available backups
echo 2. Database only
echo 3. Full project restore
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo === Database Backups ===
    python restore_database.py --list
    echo.
    echo === Full Project Backups ===
    python restore_project.py --list
    echo.
    pause
) else if "%choice%"=="2" (
    echo.
    echo Starting database restore...
    echo.
    echo Available database backups:
    python restore_database.py --list
    echo.
    set /p backup_file="Enter backup file or directory name: "
    
    echo.
    echo ⚠️  This will restore the database. Continue? (yes/no)
    set /p confirm="Confirm: "
    if /i "!confirm!"=="yes" (
        python restore_database.py --backup-dir "!backup_file!" --confirm
    ) else (
        echo Restore cancelled.
    )
) else if "%choice%"=="3" (
    echo.
    echo Starting full project restore...
    echo.
    echo Available project backups:
    python restore_project.py --list
    echo.
    set /p backup_dir="Enter backup directory name: "
    
    echo.
    echo ⚠️  This will restore the entire project. Continue? (yes/no)
    set /p confirm="Confirm: "
    if /i "!confirm!"=="yes" (
        python restore_project.py "!backup_dir!" --confirm
    ) else (
        echo Restore cancelled.
    )
) else if "%choice%"=="4" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice. Please run the script again.
    pause
    exit /b 1
)

echo.
echo Operation completed!
pause