
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get(
        "SECRET_KEY", "san-guardian-development-key"
    )

    SQLALCHEMY_DATABASE_URI = (
        "sqlite:///" + os.path.join(BASE_DIR, "san_guardian.db")
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MONITORING_INTERVAL = 5
