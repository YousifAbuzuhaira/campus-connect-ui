@echo off
echo Starting Campus Connect API...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Start the server
echo Starting FastAPI server...
echo API will be available at: http://localhost:8000
echo Documentation available at: http://localhost:8000/docs
echo.
python run.py

pause