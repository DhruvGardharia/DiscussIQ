# ML Models (Development)

This folder contains a lightweight Flask scaffold for the local ML scoring engine used during development.

How to run locally (Windows PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The service will listen on port 5001 by default. Endpoint:

- POST /evaluate — accepts JSON payload with `topic`, `messages` and `session_id`.

The current implementation is a deterministic stub. Replace `scoring.py` with the real pipeline later.
