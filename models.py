from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean
)

from database import Base


# -------------------------
# COURSE
# -------------------------
class Course(Base):

    __tablename__ = "courses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String,
        nullable=False
    )

    description = Column(
        String,
        nullable=False
    )

    playlist_url = Column(
        String,
        nullable=False
    )

    thumbnail_url = Column(
        String,
        nullable=True
    )


# -------------------------
# QUIZ
# -------------------------
class Quiz(Base):

    __tablename__ = "quiz"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    course_id = Column(
        Integer,
        nullable=False
    )

    question = Column(
        String,
        nullable=False
    )

    option_a = Column(
        String,
        nullable=False
    )

    option_b = Column(
        String,
        nullable=False
    )

    option_c = Column(
        String,
        nullable=False
    )

    option_d = Column(
        String,
        nullable=False
    )

    correct_answer = Column(
        String,
        nullable=False
    )


# -------------------------
# PROGRESS
# -------------------------
class Progress(Base):

    __tablename__ = "progress"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_email = Column(
        String,
        nullable=False
    )

    course_id = Column(
        Integer,
        nullable=False
    )

    status = Column(
        String,
        default="In-Progress"
    )


# -------------------------
# LECTURE PROGRESS
# -------------------------
class LectureProgress(Base):

    __tablename__ = (
        "lecture_progress"
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_email = Column(
        String,
        nullable=False
    )

    course_id = Column(
        Integer,
        nullable=False
    )

    video_id = Column(
        String,
        nullable=False
    )

    lecture_title = Column(
        String,
        nullable=False
    )

    completed = Column(
        Boolean,
        default=False
    )


# -------------------------
# CERTIFICATE
# -------------------------
class Certificate(Base):

    __tablename__ = (
        "certificates"
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_email = Column(
        String,
        nullable=False
    )

    course_id = Column(
        Integer,
        nullable=False
    )

    certificate_path = Column(
        String
    )

    student_name = Column(
        String
    )

    course_title = Column(
        String
    )

    certificate_id = Column(
        String,
        unique=True
    )

    completion_date = Column(
        String
    )

    score = Column(
        Integer
    )


# -------------------------
# STUDENT PROFILE
# -------------------------
class StudentProfile(Base):

    __tablename__ = (
        "student_profiles"
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        unique=True,
        nullable=False
    )

    full_name = Column(
        String
    )

    phone = Column(
        String
    )

    gender = Column(
        String
    )

    dob = Column(
        String
    )

    college = Column(
        String
    )

    course = Column(
        String
    )

    city = Column(
        String
    )

    profile_photo = Column(
        String
    )