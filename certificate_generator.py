from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from reportlab.pdfgen import canvas

import os


def generate_certificate_pdf(
    student_name,
    course_title,
    completion_date,
    certificate_id
):

    folder = "certificates"

    os.makedirs(
        folder,
        exist_ok=True
    )

    file_path = os.path.join(
        folder,
        f"{certificate_id}.pdf"
    )

    c = canvas.Canvas(
        file_path,
        pagesize=landscape(
            (1000, 700)
        )
    )

    width = 1000
    height = 700

    # background
    c.setFillColor(
        colors.HexColor(
            "#f8fafc"
        )
    )

    c.rect(
        0,
        0,
        width,
        height,
        fill=1
    )

    # border
    c.setStrokeColor(
        colors.HexColor(
            "#4f7cff"
        )
    )

    c.setLineWidth(8)

    c.rect(
        25,
        25,
        width - 50,
        height - 50
    )

    # title
    c.setFont(
        "Helvetica-Bold",
        34
    )

    c.setFillColor(
        colors.HexColor(
            "#4f7cff"
        )
    )

    c.drawCentredString(
        width / 2,
        620,
        "CourseTube"
    )

    c.setFont(
        "Helvetica-Bold",
        28
    )

    c.setFillColor(
        colors.black
    )

    c.drawCentredString(
        width / 2,
        570,
        "CERTIFICATE OF COMPLETION"
    )

    c.setFont(
        "Helvetica",
        18
    )

    c.drawCentredString(
        width / 2,
        500,
        "This certificate is proudly awarded to"
    )

    # student name
    c.setFont(
        "Helvetica-Bold",
        36
    )

    c.setFillColor(
        colors.HexColor(
            "#111827"
        )
    )

    c.drawCentredString(
        width / 2,
        440,
        student_name
    )

    # course
    c.setFont(
        "Helvetica",
        20
    )

    c.drawCentredString(
        width / 2,
        380,
        f"For successfully completing"
    )

    c.setFont(
        "Helvetica-Bold",
        24
    )

    c.drawCentredString(
        width / 2,
        340,
        course_title
    )

    # details
    c.setFont(
        "Helvetica",
        16
    )

    c.drawCentredString(
        width / 2,
        260,
        f"Completion Date: {completion_date}"
    )

    c.drawCentredString(
        width / 2,
        230,
        f"Certificate ID: {certificate_id}"
    )

    c.drawCentredString(
        width / 2,
        180,
        "This certificate can be verified on CourseTube"
    )

    c.drawCentredString(
        width / 2,
        150,
        "With Regards, CourseTube Team"
    )

    c.save()

    print(
        "Certificate saved:",
        file_path
    )

    return file_path