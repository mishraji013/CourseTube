from pydantic import (
    BaseModel
)


# -------------------------
# COURSE
# -------------------------
class CourseCreate(
    BaseModel
):

    title: str
    description: str
    playlist_url: str
    thumbnail_url: str


# -------------------------
# QUIZ
# -------------------------
class GenerateQuizRequest(
    BaseModel
):

    course_id: int
    course_title: str


# -------------------------
# PROGRESS
# -------------------------
class ProgressCreate(
    BaseModel
):

    user_email: str
    course_id: int
    status: str


# -------------------------
# CERTIFICATE
# -------------------------
class CertificateCreate(
    BaseModel
):

    user_email: str
    student_name: str

    course_id: int
    course_title: str

    score: int


# -------------------------
# STUDENT PROFILE
# -------------------------
class StudentProfileCreate(
    BaseModel
):

    email: str
    full_name: str
    phone: str
    gender: str
    dob: str
    college: str
    course: str
    city: str
    profile_photo: str