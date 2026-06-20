from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base
from api import router


app = FastAPI()


# -------------------------
# DATABASE
# -------------------------
Base.metadata.create_all(
    bind=engine
)


# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "*"
    ],

    allow_credentials=True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ]
)


# -------------------------
# ROUTES
# -------------------------
app.include_router(
    router
)


# -------------------------
# RUN
# -------------------------
if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "app:app",

        host="0.0.0.0",

        port=8000,

        reload=True
    )