@echo off
echo Starting AI Recommendation Agent...
echo Backend: FastAPI (http://127.0.0.1:8000)
echo Frontend: Served at http://127.0.0.1:8000/
echo.
uvicorn src.backend.main:app --reload --host 127.0.0.1 --port 8000
pause
