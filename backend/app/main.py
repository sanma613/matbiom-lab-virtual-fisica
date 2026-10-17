from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.tutor import router as tutor_router
from .ws import ws_endpoint

app = FastAPI(title="Physics Lab API")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)
app.include_router(tutor_router)


app.websocket("/ws")(ws_endpoint)
