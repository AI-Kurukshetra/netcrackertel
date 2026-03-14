from datetime import datetime
from fastapi import FastAPI
from pydantic import BaseModel, Field


class SignalRequest(BaseModel):
    tenant_id: str = Field(default="tenant_0001")
    entity_id: str | None = None
    horizon_hours: int = Field(default=24, ge=1, le=720)


class SignalResponse(BaseModel):
    model: str
    tenant_id: str
    generated_at: datetime
    score: float
    recommendation: str
    confidence: float


app = FastAPI(title="TelecoSync AI Service", version="0.1.0")


def build_signal(model: str, request: SignalRequest) -> SignalResponse:
    seed = sum(ord(char) for char in f"{model}:{request.tenant_id}:{request.entity_id or 'global'}")
    score = round(0.55 + (seed % 35) / 100, 2)
    confidence = round(0.7 + (seed % 20) / 100, 2)
    recommendation_map = {
        "predictive-failure": "Dispatch proactive maintenance to the highest-risk network element.",
        "churn": "Trigger loyalty offer and support outreach for at-risk accounts.",
        "fraud": "Review burst usage anomalies and lock suspicious routes.",
        "revenue": "Adjust pricing rules and roaming policies for margin recovery.",
        "capacity": "Increase capacity in hotspots before the forecast window.",
        "anomaly": "Correlate telemetry spikes with configuration change windows."
    }
    return SignalResponse(
        model=model,
        tenant_id=request.tenant_id,
        generated_at=datetime.utcnow(),
        score=score,
        confidence=confidence,
        recommendation=recommendation_map[model],
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": "telecosync-ai", "time": datetime.utcnow()}


@app.post("/predictive-failure", response_model=SignalResponse)
def predictive_failure(request: SignalRequest):
    return build_signal("predictive-failure", request)


@app.post("/churn", response_model=SignalResponse)
def churn_prediction(request: SignalRequest):
    return build_signal("churn", request)


@app.post("/fraud", response_model=SignalResponse)
def fraud_detection(request: SignalRequest):
    return build_signal("fraud", request)


@app.post("/revenue", response_model=SignalResponse)
def revenue_optimization(request: SignalRequest):
    return build_signal("revenue", request)


@app.post("/capacity", response_model=SignalResponse)
def capacity_forecasting(request: SignalRequest):
    return build_signal("capacity", request)


@app.post("/anomaly", response_model=SignalResponse)
def anomaly_detection(request: SignalRequest):
    return build_signal("anomaly", request)
