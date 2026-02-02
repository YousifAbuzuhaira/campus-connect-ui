@echo off
echo Starting Campus Connect API...
echo.

REM Check if virtual environment exists and create it if not.
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment. Please ensure Python is installed and accessible.
        pause
        exit /b %errorlevel%
    )
)

REM Activate virtual environment.
echo Activating virtual environment...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment.
    pause
    exit /b %errorlevel%
)

REM Install dependencies from requirements.txt.
REM For a production-ready setup, ensure 'gunicorn' and 'uvicorn' are listed in requirements.txt.
echo Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies. Check requirements.txt and network connection.
    pause
    exit /b %errorlevel%
)

REM Start the FastAPI server using Gunicorn with Uvicorn workers.
REM This setup is recommended for production environments to provide:
REM - Process management and automatic restarts on crashes.
REM - Load balancing across multiple worker processes to utilize CPU cores efficiently.
REM - Graceful handling of requests and improved overall performance and reliability.
echo Starting FastAPI server with Gunicorn...
echo API will be available at: http://localhost:8000
echo Documentation available at: http://localhost:8000/docs
echo.

REM Define the number of Gunicorn workers.
REM A common recommendation for worker count is (2 * CPU_CORES) + 1.
REM For this example, a default of 4 workers is used.
REM In a real production environment, this value should be tuned based on available CPU cores
REM and might be set dynamically via an environment variable (e.g., set NUM_WORKERS=%GUNICORN_WORKERS%).
set NUM_WORKERS=4

REM The application entry point is assumed to be 'app' in 'run.py'.
REM If your FastAPI application instance is named differently or located in another file,
REM adjust 'run:app' accordingly (e.g., 'main:app' if the app is in main.py).
gunicorn run:app ^
    --workers %NUM_WORKERS% ^
    --worker-class uvicorn.workers.UvicornWorker ^
    --bind 0.0.0.0:8000 ^
    --timeout 120 ^
    --log-level info
if %errorlevel% neq 0 (
    echo ERROR: Gunicorn server failed to start or crashed.
    echo Please check the application logs for details.
    pause
    exit /b %errorlevel%
)

REM The 'pause' command is typically used for local development to keep the console window open
REM after the application exits or crashes.
REM It should be removed for actual production deployments where the process is managed by
REM a dedicated service manager (e.g., systemd, Docker, Kubernetes) that handles process lifecycle.
pause