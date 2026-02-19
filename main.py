from fastapi import FastAPI, UploadFile, File
import pandas as pd
import time
try:
    from .detection import run_detection
except ImportError:
    from detection import run_detection
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Money Muling Detection Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "API Running"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    start = time.time()

    df = pd.read_csv(file.file)

    required_columns = [
        "transaction_id",
        "sender_id",
        "receiver_id",
        "amount",
        "timestamp",
    ]

    if not all(col in df.columns for col in required_columns):
        return {"error": "Invalid CSV format"}

    result, graph_data = run_detection(df)

    result["summary"]["processing_time_seconds"] = round(time.time() - start, 2)

    return {
        "analysis": result,
        "graph": graph_data
    }
