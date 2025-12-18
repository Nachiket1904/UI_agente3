from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from pydantic import BaseModel

app = FastAPI(title="Beehvi setup")

# CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev, later limit to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    name: str
    value: int
    md_content : str

@app.get("/")
def home():
    return {"message": "RAG Bot API is running 🚀"}

@app.post("/process")
def process_data(data: InputData):
    # ---- Your logic here ----
    result = data.value * 2
    print(data.md_content)
    
    return {
        "status": "success",
        "message": f"Hello {data.name}, processed value is {result} and content is {data.md_content}",
        "result": result
    }


