from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import jwt
from datetime import datetime, timedelta
import os
import shutil
from models import Filament, Print
from config import ADMIN_PASSWORD, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, UPLOAD_FOLDER





app = FastAPI()
security = HTTPBearer()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="/app/static"), name="static")
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/")
def read_root():
    return FileResponse("/app/static/index.html")

@app.get("/admin.html")
def admin_page():
    return FileResponse("/app/static/admin.html")

@app.get("/login.html")
def login_page():
    return FileResponse("/app/static/login.html")

# Auth endpoints
@app.post("/api/login")
async def login(username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == ADMIN_PASSWORD:
        token = create_access_token({"sub": username})
        return {"access_token": token, "token_type": "bearer"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/verify")
async def verify(payload: dict = Depends(verify_token)):
    return {"status": "valid", "user": payload.get("sub")}

# Filament endpoints
@app.get("/api/filaments")
async def get_filaments():
    return Filament.get_all()

@app.post("/api/filaments")
async def create_filament(
    name: str = Form(...),
    price_per_kg: float = Form(...),
    payload: dict = Depends(verify_token)
):
    try:
        filament_id = Filament.create(name, price_per_kg)
        return {"id": filament_id, "message": "Filament created"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/filaments/{filament_id}")
async def update_filament(
    filament_id: int,
    name: str = Form(...),
    price_per_kg: float = Form(...),
    payload: dict = Depends(verify_token)
):
    Filament.update(filament_id, name, price_per_kg)
    return {"message": "Filament updated"}

@app.delete("/api/filaments/{filament_id}")
async def delete_filament(filament_id: int, payload: dict = Depends(verify_token)):
    Filament.delete(filament_id)
    return {"message": "Filament deleted"}

# Print endpoints
@app.get("/api/prints")
async def get_prints(uploader: Optional[str] = None, status: Optional[str] = None):
    return Print.get_all(uploader, status)

@app.get("/api/prints/{print_id}")
async def get_print(print_id: int):
    print_item = Print.get_by_id(print_id)
    if not print_item:
        raise HTTPException(status_code=404, detail="Print not found")
    return print_item

@app.post("/api/prints")
async def create_print(
    name: str = Form(...),
    uploader: str = Form(...),
    filament_grams: float = Form(...),
    filament_type_id: int = Form(...),
    link: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    image_path = None
    
    if image:
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{image.filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        image_path = f"/uploads/{filename}"
    
    print_id = Print.create(name, uploader, image_path, link, filament_grams, filament_type_id)
    return {"id": print_id, "message": "Print created"}

@app.put("/api/prints/{print_id}")
async def update_print(
    print_id: int,
    name: str = Form(...),
    uploader: str = Form(...),
    filament_grams: float = Form(...),
    filament_type_id: int = Form(...),
    payment_status: str = Form(...),
    link: Optional[str] = Form(None),
    payload: dict = Depends(verify_token)
):
    Print.update(print_id, name, uploader, link, filament_grams, filament_type_id, payment_status)
    return {"message": "Print updated"}

@app.patch("/api/prints/{print_id}/status")
async def update_payment_status(
    print_id: int,
    payment_status: str = Form(...),
    payload: dict = Depends(verify_token)
):
    Print.update_payment_status(print_id, payment_status)
    return {"message": "Payment status updated"}

@app.delete("/api/prints/{print_id}")
async def delete_print(print_id: int, payload: dict = Depends(verify_token)):
    # Get print to delete image
    print_item = Print.get_by_id(print_id)
    if print_item and print_item.get('image_path'):
        try:
            image_file = print_item['image_path'].replace('/uploads/', '')
            os.remove(os.path.join(UPLOAD_FOLDER, image_file))
        except:
            pass
    
    Print.delete(print_id)
    return {"message": "Print deleted"}

@app.get("/api/summary")
async def get_summary(payload: dict = Depends(verify_token)):
    return Print.get_summary_by_uploader()

@app.get("/api/uploaders")
async def get_uploaders():
    prints = Print.get_all()
    uploaders = list(set(p['uploader'] for p in prints))
    return sorted(uploaders)

# Statistics endpoint (public, no auth required)
@app.get("/api/statistics")
async def get_statistics(start_date: Optional[str] = None, end_date: Optional[str] = None):
    return Print.get_statistics(start_date, end_date)