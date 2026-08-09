import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from app.database import SessionLocal
from app.models.models import User

db = SessionLocal()
u = db.query(User).filter(User.email == "chinmay@retailmind.ai").first()
if u:
    print(f"Found: {u.email}")
    print(f"Hash prefix: {u.hashed_password[:30]}")
    # Test verify
    from app.routers.auth import verify_password
    result = verify_password("admin123", u.hashed_password)
    print(f"Password verify result: {result}")
else:
    print("User NOT FOUND")
db.close()
