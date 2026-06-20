
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import (
    Course,
    Progress,
    Quiz,
    LectureProgress,
    Certificate,
    StudentProfile
)

from schemas import (
    CourseCreate,
    ProgressCreate,
    GenerateQuizRequest,
    CertificateCreate,
    StudentProfileCreate
)
from certificate_generator import (
    generate_certificate_pdf
)

import requests
import json
import ollama


router = APIRouter()


# ==========================================
# YOUTUBE API KEY
# ==========================================

YOUTUBE_API_KEY = "AIzaSyB_wBq_tqd4g0xf2jhUVXRASZYloY3mlHI"


# ==========================================
# HOME
# ==========================================

@router.get("/")
def home():

    return {
        "message": "Welcome to CourseTube API"
    }


# ==========================================
# ADD COURSE
# ==========================================


@router.post(
    "/add-course"
)
def add_course(
    course: CourseCreate,
    db: Session =
    Depends(get_db)
):

    new_course = Course(

        title=
        course.title,

        description=
        course.description,

        playlist_url=
        course.playlist_url,

        thumbnail_url=
        course.thumbnail_url
    )

    db.add(
        new_course
    )

    db.commit()

    return {

        "message":
        "Course Added"
    }

# ==========================================
# GET COURSES
# ==========================================

@router.get("/courses")
def get_courses(
    db: Session = Depends(get_db)
):

    return db.query(Course).all()


@router.delete(
    "/delete-course/{course_id}"
)
def delete_course(
    course_id: int,
    db: Session =
    Depends(get_db)
):

    course = db.query(
        Course
    ).filter(
        Course.id
        == course_id
    ).first()

    if not course:

        return {
            "message":
            "Course not found"
        }

    # delete related quiz
    db.query(
        Quiz
    ).filter(
        Quiz.course_id
        == course_id
    ).delete()

    # delete related progress
    db.query(
        LectureProgress
    ).filter(
        LectureProgress.course_id
        == course_id
    ).delete()

    # delete certificates
    db.query(
        Certificate
    ).filter(
        Certificate.course_id
        == course_id
    ).delete()

    # delete course
    db.delete(
        course
    )

    db.commit()

    return {
        "message":
        "Course Deleted"
    }

@router.put(
    "/update-course/{course_id}"
)
def update_course(
    course_id: int,
    payload: CourseCreate,
    db: Session =
    Depends(get_db)
):

    course = db.query(
        Course
    ).filter(
        Course.id
        == course_id
    ).first()

    if not course:

        return {
            "message":
            "Course not found"
        }

    course.title = (
        payload.title
    )

    course.description = (
        payload.description
    )

    course.playlist_url = (
        payload.playlist_url
    )

    course.thumbnail_url = (
        payload.thumbnail_url
    )

    db.commit()

    return {
        "message":
        "Course Updated"
    }
# ==========================================
# GET PLAYLIST VIDEOS
# ==========================================

@router.get("/playlist-videos/{playlist_id}")
def get_playlist_videos(
    playlist_id: str
):

    url = (
        "https://www.googleapis.com/"
        "youtube/v3/playlistItems"
    )

    params = {
        "part": "snippet",
        "playlistId": playlist_id,
        "maxResults": 50,
        "key": YOUTUBE_API_KEY
    }

    response = requests.get(
        url,
        params=params
    )

    data = response.json()

    videos = []

    for item in data.get(
        "items",
        []
    ):

        snippet = item[
            "snippet"
        ]

        videos.append({

            "title":
            snippet["title"],

            "videoId":
            snippet[
                "resourceId"
            ]["videoId"]
        })

    return videos


# ==========================================
# GENERATE AI QUIZ (OLLAMA)
# ==========================================

@router.post("/generate-ai-quiz")
def generate_ai_quiz(
    payload: GenerateQuizRequest,
    db: Session = Depends(get_db)
):

    try:

        prompt = f"""
Generate EXACTLY 20 beginner-friendly
multiple choice quiz questions for:

{payload.course_title}

Rules:

1. Questions must be easy to understand.
2. Use human-friendly English.
3. Options must be realistic.
4. Only ONE correct answer.
5. correct_answer MUST contain
the FULL TEXT of correct option,
NOT option_a or option_b.

Return ONLY valid JSON.

Format:

[
  {{
    "question":
    "What is Python?",

    "option_a":
    "Programming Language",

    "option_b":
    "Movie",

    "option_c":
    "Car",

    "option_d":
    "Game",

    "correct_answer":
    "Programming Language"
  }}
]
"""

        response = ollama.chat(

            model="llama3.1:8b",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        raw_text = response[
            "message"
        ]["content"]

        print("\n===================")
        print("RAW AI RESPONSE")
        print("===================")
        print(raw_text)

        # CLEAN RESPONSE
        raw_text = (
            raw_text
            .replace("```json", "")
            .replace("```", "")
            .replace("\\_", "_")
            .strip()
        )

        start = raw_text.find("[")
        end = raw_text.rfind("]") + 1

        clean_json = raw_text[
            start:end
        ]

        quiz_data = json.loads(
            clean_json
        )

        for q in quiz_data:

            new_question = Quiz(

                course_id=
                payload.course_id,

                question=
                q["question"],

                option_a=
                q["option_a"],

                option_b=
                q["option_b"],

                option_c=
                q["option_c"],

                option_d=
                q["option_d"],

                correct_answer=
                q["correct_answer"]
            )

            db.add(
                new_question
            )

        db.commit()

        return {
            "message":
            "20 Quiz Questions Generated"
        }

    except Exception as e:

        print("\nERROR:")
        print(str(e))

        return {
            "error":
            str(e)
        }


# ==========================================
# GET QUIZ
# ==========================================

@router.get("/quiz/{course_id}")
def get_quiz(
    course_id: int,
    db: Session = Depends(get_db)
):

    quizzes = db.query(
        Quiz
    ).filter(
        Quiz.course_id
        == course_id
    ).order_by(
        Quiz.id.desc()
    ).limit(20).all()

    return list(
        reversed(quizzes)
    )

# ==========================================
# SAVE LECTURE PROGRESS
# ==========================================

@router.post("/save-lecture-progress")
def save_lecture_progress(
    payload: dict,
    db: Session = Depends(get_db)
):

    existing = db.query(
        LectureProgress
    ).filter(

        LectureProgress.user_email
        == payload["user_email"],

        LectureProgress.course_id
        == payload["course_id"],

        LectureProgress.video_id
        == payload["video_id"]

    ).first()

    if existing:

        existing.completed = True

    else:

        progress = LectureProgress(

            user_email=
            payload["user_email"],

            course_id=
            payload["course_id"],

            video_id=
            payload["video_id"],

            lecture_title=
            payload["lecture_title"],

            completed=True
        )

        db.add(
            progress
        )

    db.commit()

    return {
        "message":
        "Lecture Saved"
    }


# ==========================================
# GET PROGRESS
# ==========================================

@router.get("/lecture-progress")
def get_progress(
    user_email: str,
    course_id: int,
    db: Session = Depends(get_db)
):

    progress = db.query(
        LectureProgress
    ).filter(

        LectureProgress.user_email
        == user_email,

        LectureProgress.course_id
        == course_id

    ).all()

    completed_ids = [

        p.video_id
        for p in progress
    ]

    return {
        "completed":
        completed_ids
    }


# ==========================================
# ADMIN STATS
# ==========================================

@router.get(
    "/admin-stats"
)
def admin_stats(
    db: Session =
    Depends(get_db)
):

    total_students = db.query(
        StudentProfile
    ).count()

    total_courses = db.query(
        Course
    ).count()

    total_quizzes = db.query(
        Quiz
    ).count()

    total_certificates = db.query(
        Certificate
    ).count()

    return {

        "students":
        total_students,

        "courses":
        total_courses,

        "quizzes":
        total_quizzes,

        "certificates":
        total_certificates
    }
# -------------------------
# GENERATE CERTIFICATE
# -------------------------
# -------------------------
# GENERATE CERTIFICATE
# -------------------------
@router.post(
    "/generate-certificate"
)
def generate_certificate(
    payload: CertificateCreate,
    db: Session =
    Depends(get_db)
):

    import random
    from datetime import datetime

    existing = db.query(
        Certificate
    ).filter(

        Certificate.user_email
        ==
        payload.user_email,

        Certificate.course_id
        ==
        payload.course_id

    ).first()

    # already exists
    if existing:

        return {

            "message":
            "Certificate already exists",

            "certificate_id":
            existing.certificate_id,

            "certificate_path":
            existing.certificate_path
        }

    certificate_id = (
        "CT-" +
        str(
            random.randint(
                100000,
                999999
            )
        )
    )

    completion_date = (
        datetime.now()
        .strftime(
            "%d %B %Y"
        )
    )

    # GENERATE PDF
    certificate_path = (
        generate_certificate_pdf(

            payload.student_name,

            payload.course_title,

            completion_date,

            certificate_id
        )
    )

    new_certificate =Certificate(

        user_email=
        payload.user_email,

        student_name=
        payload.student_name,

        course_id=
        payload.course_id,

        course_title=
        payload.course_title,

        certificate_id=
        certificate_id,

        completion_date=
        completion_date,

        score=
        payload.score,

        certificate_path=
        certificate_path
    )

    db.add(
        new_certificate
    )

    db.commit()

    return {

        "message":
        "Certificate Generated",

        "certificate_id":
        certificate_id,

        "certificate_path":
        certificate_path
    }


# -------------------------
# VERIFY CERTIFICATE
# -------------------------
@router.get(
    "/verify-certificate/{certificate_id}"
)
def verify_certificate(
    certificate_id: str,
    db: Session =
    Depends(get_db)
):

    certificate = db.query(
        Certificate
    ).filter(
        Certificate
        .certificate_id
        ==
        certificate_id
    ).first()

    if not certificate:

        return {
            "valid":
            False
        }

    return {

        "valid":
        True,

        "student_name":
        certificate.student_name,

        "course_title":
        certificate.course_title,

        "completion_date":
        certificate.completion_date,

        "score":
        certificate.score,

        "certificate_id":
        certificate.certificate_id
    }
from fastapi.responses import FileResponse


# -------------------------
# DOWNLOAD CERTIFICATE
# -------------------------
@router.get(
    "/download-certificate/{certificate_id}"
)
def download_certificate(
    certificate_id: str,
    db: Session =
    Depends(get_db)
):

    certificate =db.query(
        Certificate
    ).filter(
        Certificate
        .certificate_id
        ==
        certificate_id
    ).first()

    if not certificate:

        return {
            "message":
            "Certificate not found"
        }

    return FileResponse(
    certificate.certificate_path,
    media_type=
    "application/pdf",
    filename=
    f"{certificate_id}.pdf"
    )
    # -------------------------
# SAVE PROFILE
# -------------------------
@router.post(
    "/save-profile"
)
def save_profile(
    payload:
    StudentProfileCreate,

    db: Session =
    Depends(get_db)
):

    existing =db.query(
        StudentProfile
    ).filter(
        StudentProfile.email
        ==
        payload.email
    ).first()

    if existing:

        existing.full_name =payload.full_name

        existing.phone =payload.phone

        existing.gender =payload.gender

        existing.dob =payload.dob

        existing.college =payload.college

        existing.course =payload.course

        existing.city =payload.city
        existing.profile_photo =payload.profile_photo

    else:

        profile =StudentProfile(
            email=payload.email,
            full_name=payload.full_name,
            phone=payload.phone,
            gender=payload.gender,
            dob=payload.dob,
            college=payload.college,
            course=payload.course,
            city=payload.city,
            profile_photo=payload.profile_photo
        )

        db.add(
            profile
        )

    db.commit()

    return {
        "message":
        "Profile Saved"
    }


# -------------------------
# GET PROFILE
# -------------------------
@router.get(
    "/profile/{email}"
)
def get_profile(
    email: str,
    db: Session =
    Depends(get_db)
):

    profile =db.query(
        StudentProfile
    ).filter(
        StudentProfile.email
        ==
        email
    ).first()

    if not profile:

        return {
            "exists":
            False
        }

    return {

    "exists":
    True,

    "full_name":
    profile.full_name,

    "phone":
    profile.phone,

    "gender":
    profile.gender,

    "dob":
    profile.dob,

    "college":
    profile.college,

    "course":
    profile.course,

    "city":
    profile.city,

    "profile_photo":
    profile.profile_photo
}
    # -------------------------
# USER CERTIFICATES
# -------------------------
@router.get(
    "/my-certificates/{email}"
)
def my_certificates(
    email: str,
    db: Session =
    Depends(get_db)
):

    certificates =db.query(
        Certificate
    ).filter(
        Certificate.user_email
        ==
        email
    ).all()

    return certificates