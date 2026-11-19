"""Mock-only public endpoints. Never put personal data into demo fixtures."""
from datetime import datetime, timezone
import os
import psycopg
from fastapi import FastAPI

app = FastAPI(title="ICPC demo API", version="0.1.0", description="Prototipo de leitura; NÃO é a API segura de produção.")

@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "demo", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.get("/api/readiness")
def readiness():
    try:
        with psycopg.connect(os.environ["DATABASE_URL"], connect_timeout=2) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
        return {"status": "ready", "postgres": "connected"}
    except (psycopg.Error, KeyError):
        return {"status": "not_ready", "postgres": "unavailable"}

@app.get("/api/v1/public/config")
def public_config():
    return {"name":"Igreja Cristã Presbiteriana da Covilhã", "demo":True,
      "source":"https://www.presbiterianos-covilha.pt/index.htm",
      "published_schedule":{"sunday_study":"10:00", "sunday_service":"11:00", "wednesday_prayer":"20:00 online"}}
