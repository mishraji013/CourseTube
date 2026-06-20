const API_URL =
"http://127.0.0.1:8000";

const ADMIN_EMAIL =
"hraj19216@gmail.com";

let lectures = [];
let currentLecture = 0;
let completedLectures = [];
let quizData = [];


/* ==========================
   GOOGLE LOGIN
========================== */

function googleLogin(){

    const email =
    prompt(
        "Enter your Gmail:"
    );

    if(!email){

        alert(
            "Email required"
        );

        return;
    }

    localStorage.setItem(
        "studentEmail",
        email
    );

    window.location.href =
    "dashboard.html";
}


/* ==========================
   PROTECT ROUTE
========================== */

function protectRoute(){

    const email =
    localStorage.getItem(
        "studentEmail"
    );

    if(!email){

        window.location.href =
        "index.html";
    }
}


/* ==========================
   LOGOUT
========================== */

function logout(){

    localStorage.removeItem(
        "studentEmail"
    );

    localStorage.removeItem(
        "courseId"
    );

    localStorage.removeItem(
        "playlistId"
    );

    localStorage.removeItem(
        "courseTitle"
    );

    window.location.href =
    "index.html";
}


/* ==========================
   ADMIN CHECK
========================== */

function checkAdmin(){

    const email =
    localStorage.getItem(
        "studentEmail"
    );

    const adminBtn =
    document.getElementById(
        "adminBtn"
    );

    if(
        email &&
        adminBtn &&
        email.toLowerCase()
        ===
        ADMIN_EMAIL.toLowerCase()
    ){

        adminBtn.style.display =
        "block";
    }
}


/* ==========================
   ADD COURSE
========================== */

async function addCourse(){

    const title =
    document.getElementById(
        "title"
    )?.value.trim();

    const description =
    document.getElementById(
        "description"
    )?.value.trim();

    const playlist_url =
    document.getElementById(
        "playlist"
    )?.value.trim();

    const thumbnail_url =
    document.getElementById(
        "thumbnailUrl"
    )?.value.trim();

    if(
        !title ||
        !description ||
        !playlist_url
    ){

        alert(
            "Please fill all fields"
        );

        return;
    }

    try{

        const response =
        await fetch(
            `${API_URL}/add-course`,
            {

                method:
                "POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify({

                    title,
                    description,
                    playlist_url,
                    thumbnail_url
                })
            }
        );

        const data =
        await response.json();

        console.log(data);

        if(response.ok){

            alert(
                "✅ Course Added Successfully"
            );

            location.reload();

        }else{

            alert(
                "❌ Failed to add course"
            );
        }

    }catch(error){

        console.log(error);

        alert(
            "Server Error"
        );
    }
}

function extractPlaylistId(
    url
){

    try{

        const parsed =
        new URL(url);

        return parsed
        .searchParams
        .get("list");

    }catch(error){

        console.log(
            error
        );

        return null;
    }
}

/* ==========================
   LOAD COURSES
========================== */

let allCourses = [];

async function loadCourses(){

    try{

        await checkProfile();

    }catch(error){

        console.log(
            "Profile check skipped"
        );
    }

    try{

        const response =
        await fetch(
            `${API_URL}/courses`
        );

        allCourses =
        await response.json();

        renderCourses(
            allCourses
        );

    }catch(error){

        console.log(
            error
        );
    }
}


function renderCourses(
    courses
){

    const container =
    document.getElementById(
        "courseGrid"
    );

    if(!container){

        return;
    }

    container.innerHTML =
    "";

    courses.forEach(
    course => {

        container.innerHTML +=
        `
        <div
        class="course-card"

        onclick="
        openCourse(
            '${course.playlist_url}',
            '${course.title}',
            ${course.id}
        )
        "
        >

            <img
            src="${
                course.thumbnail_url
                ||
                'https://via.placeholder.com/600x320?text=CourseTube'
            }"

            class="course-image"

            onerror="
            this.src=
            'https://via.placeholder.com/600x320?text=CourseTube'
            "
            >

            <div class="course-content">

                <h3>
                    ${course.title}
                </h3>

                <p>
                    ${
                        course.description
                        ?
                        course.description
                        .slice(0,120)
                        + "..."
                        :
                        "Start learning this course"
                    }
                </p>

                <button
                class="start-btn"

                onclick="
                event.stopPropagation();

                openCourse(
                    '${course.playlist_url}',
                    '${course.title}',
                    ${course.id}
                )
                "
                >
                    Start Learning →
                </button>

            </div>

        </div>
        `;
    });
}


function searchCourses(){

    const keyword =
    document
    .getElementById(
        "courseSearch"
    )
    .value
    .toLowerCase();

    const filtered =
    allCourses.filter(
        course =>

        course.title
        .toLowerCase()
        .includes(keyword)

        ||

        (
            course.description &&
            course.description
            .toLowerCase()
            .includes(keyword)
        )
    );

    renderCourses(
        filtered
    );
}

/* ==========================
   OPEN COURSE
========================== */

function openCourseFromButton(
    button
){

    const courseId =
    button.dataset.id;

    const courseTitle =
    button.dataset.title;

    const playlistUrl =
    button.dataset.playlist;

    let playlistId =
    "";

    try{

        const url =
        new URL(
            playlistUrl
        );

        playlistId =
        url.searchParams.get(
            "list"
        );

    }catch(error){

        console.log(error);
    }

    if(!playlistId){

        alert(
            "Invalid Playlist URL"
        );

        return;
    }

    localStorage.setItem(
        "courseId",
        courseId
    );

    localStorage.setItem(
        "courseTitle",
        courseTitle
    );

    localStorage.setItem(
        "playlistId",
        playlistId
    );

    window.location.href =
    "player.html";
}

function openCourse(
    playlistUrl,
    courseTitle,
    courseId
){

    const playlistId =
    extractPlaylistId(
        playlistUrl
    );

    if(!playlistId){

        alert(
            "Invalid playlist URL"
        );

        return;
    }

    localStorage.setItem(
        "playlistId",
        playlistId
    );

    localStorage.setItem(
        "courseTitle",
        courseTitle
    );

    localStorage.setItem(
        "courseId",
        courseId
    );

    window.location.href =
    "player.html";
}
/* ==========================
   PLAYER
========================== */

async function loadPlayer(){

    const playlistId =
    localStorage.getItem(
        "playlistId"
    );

    const courseTitle =
    localStorage.getItem(
        "courseTitle"
    );

    const course_id =
    localStorage.getItem(
        "courseId"
    );

    const user_email =
    localStorage.getItem(
        "studentEmail"
    );

    const title =
    document.getElementById(
        "courseTitle"
    );

    if(title){

        title.innerText =
        courseTitle;
    }

    if(!playlistId){

        alert(
            "Playlist not found"
        );

        return;
    }

    try{

        // LOAD PLAYLIST
        const response =
        await fetch(
            `${API_URL}/playlist-videos/${playlistId}`
        );

        const videos =
        await response.json();

        console.log(
            "Videos:",
            videos
        );

        const iframe =
        document.getElementById(
            "videoFrame"
        );

        const lectureList =
        document.getElementById(
            "lectureList"
        );

        if(
            !iframe ||
            !lectureList
        ){

            return;
        }

        lectureList.innerHTML =
        "";

        // SAVE LECTURES
        lectures =
        videos.map(video => ({

            videoId:
            video.videoId,

            title:
            video.title
        }));


        // LOAD SAVED PROGRESS
        const progressResponse =
        await fetch(
`${API_URL}/lecture-progress?user_email=${user_email}&course_id=${course_id}`
        );

        const progressData =
        await progressResponse.json();

        completedLectures =
        progressData.completed || [];

        console.log(
            "Completed:",
            completedLectures
        );


        // FIND NEXT UNWATCHED LECTURE
        let resumeIndex = 0;

        for(
            let i = 0;
            i < lectures.length;
            i++
        ){

            if(
                !completedLectures.includes(
                    lectures[i].videoId
                )
            ){

                resumeIndex = i;
                break;
            }
        }

        currentLecture =
        resumeIndex;


        // RESUME VIDEO
        changeVideo(
    lectures[
        resumeIndex
    ].videoId
);


        // RENDER LECTURES
        lectures.forEach(
        (video,index)=>{

            const lecture =
            document.createElement(
                "div"
            );

            lecture.className =
            "lecture-card";

            const completed =
            completedLectures.includes(
                video.videoId
            );

            lecture.innerHTML =
            `
            <h4>
                ${completed ? "✅" : "📘"}
                Lecture ${index + 1}
            </h4>

            <p>
                ${video.title}
            </p>
            `;

            lecture.onclick =
            function(){

                currentLecture =
                index;

                changeVideo(
                    video.videoId
                );
            };

            lectureList.appendChild(
                lecture
            );
        });

        updateProgress();

    }catch(error){

        console.log(
            "Player Error:",
            error
        );
    }
}


let player = null;

function changeVideo(
    videoId
){

    if(
        typeof YT ===
        "undefined"
    ){

        return;
    }

    if(player){

        player.loadVideoById(
            videoId
        );

        return;
    }

    player =
    new YT.Player(
        "videoFrame",
        {

            height:
            "500",

            width:
            "100%",

            videoId:
            videoId,

            playerVars:{
                autoplay:1
            },

            events:{

                onStateChange:
                onPlayerStateChange
            }
        }
    );
}


/* ==========================
   COMPLETE LECTURE
========================== */

async function completeLecture(){

    const lecture =
    lectures[currentLecture];

    if(!lecture){

        alert(
            "No lecture selected"
        );

        return;
    }

    const user_email =
    localStorage.getItem(
        "studentEmail"
    );

    const course_id =
    localStorage.getItem(
        "courseId"
    );

    // SAVE PROGRESS
    await fetch(
        `${API_URL}/save-lecture-progress`,
        {

            method:
            "POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify({

                user_email,
                course_id,

                video_id:
                lecture.videoId,

                lecture_title:
                lecture.title
            })
        }
    );

    // SAVE LOCALLY
    if(
        !completedLectures.includes(
            lecture.videoId
        )
    ){

        completedLectures.push(
            lecture.videoId
        );
    }

    updateProgress();

    // QUIZ UNLOCK
    const percent =
    Math.floor(
        (
            completedLectures.length
            /
            lectures.length
        ) * 100
    );

    if(percent >= 80){

        const quizBtn =
        document.getElementById(
            "quizBtn"
        );

        if(quizBtn){

            quizBtn.style.display =
            "block";
        }
    }

    // AUTO MOVE TO NEXT LECTURE
    const nextLecture =
    currentLecture + 1;

    // IF NEXT LECTURE EXISTS
    if(
        nextLecture <
        lectures.length
    ){

        currentLecture =
        nextLecture;

        changeVideo(
            lectures[
                currentLecture
            ].videoId
        );

        // scroll selected lecture into view
        const lectureCards =
        document.querySelectorAll(
            ".lecture-card"
        );

        if(
            lectureCards[
                currentLecture
            ]
        ){

            lectureCards[
                currentLecture
            ].scrollIntoView({
                behavior:
                "smooth",

                block:
                "center"
            });
        }

    }else{

        alert(
            "🎉 Course Completed!"
        );
    }
}


/* ==========================
   UPDATE PROGRESS
========================== */

function updateProgress(){

    const percent =
    lectures.length > 0
    ?
    Math.floor(
        (
            completedLectures.length
            /
            lectures.length
        ) * 100
    )
    :
    0;

    const progressText =
    document.getElementById(
        "progressText"
    );

    const progressFill =
    document.getElementById(
        "progressFill"
    );

    if(progressText){

        progressText.innerText =
        `${percent}%`;
    }

    if(progressFill){

        progressFill.style.width =
        `${percent}%`;
    }
}


/* ==========================
   QUIZ
========================== */

async function generateAIQuiz(){

    const course_id =
    document.getElementById(
        "quizCourseId"
    )?.value;

    const course_title =
    document.getElementById(
        "quizCourseTitle"
    )?.value;

    const response =
    await fetch(
        `${API_URL}/generate-ai-quiz`,
        {

            method:
            "POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify({

                course_id,
                course_title
            })
        }
    );

    const data =
    await response.json();

    alert(
        data.message
    );
}


async function loadQuiz(){

    const courseId =
    localStorage.getItem(
        "courseId"
    );

    const response =
    await fetch(
        `${API_URL}/quiz/${courseId}`
    );

    quizData =
    await response.json();

    const container =
    document.getElementById(
        "quizContainer"
    );

    if(!container){

        return;
    }

    container.innerHTML =
    "";

    quizData.forEach(
    (q,index)=>{

        container.innerHTML +=
        `
        <div class="question-card">

            <h3>
                ${index + 1}.
                ${q.question}
            </h3>

            ${createOption(index,q.option_a)}
            ${createOption(index,q.option_b)}
            ${createOption(index,q.option_c)}
            ${createOption(index,q.option_d)}

        </div>
        `;
    });

    attachProgressListener();
}


function createOption(
    questionIndex,
    optionText
){

    return `
    <label class="option">

        <input
            type="radio"
            name="q${questionIndex}"
            value="${optionText}"
        >

        <span>
            ${optionText}
        </span>

    </label>
    `;
}


function attachProgressListener(){

    const radios =
    document.querySelectorAll(
        'input[type="radio"]'
    );

    radios.forEach(
    radio => {

        radio.addEventListener(
            "change",
            updateQuizProgress
        );
    });
}


function updateQuizProgress(){

    const total =
    quizData.length;

    const answered =
    document.querySelectorAll(
        'input[type="radio"]:checked'
    ).length;

    const percent =
    Math.round(
        (
            answered /
            total
        ) * 100
    );

    document.getElementById(
        "quizProgressText"
    ).innerText =
    `${percent}%`;

    document.getElementById(
        "quizProgressFill"
    ).style.width =
    `${percent}%`;
}


async function submitQuiz(){

    let score = 0;

    quizData.forEach(
    (q,index)=>{

        const selected =
        document.querySelector(
            `input[name="q${index}"]:checked`
        );

        if(!selected){

            return;
        }

        if(
            selected.value
            .trim()
            .toLowerCase()
            ===
            q.correct_answer
            .trim()
            .toLowerCase()
        ){

            score++;
        }
    });

    const percent =
    Math.round(
        (
            score /
            quizData.length
        ) * 100
    );

    if(percent < 70){

        alert(
            `❌ Failed\nScore: ${percent}%`
        );

        return;
    }

    const user_email =
    localStorage.getItem(
        "studentEmail"
    );

    const student_name =
    localStorage.getItem(
        "studentName"
    );

    const course_id =
    parseInt(
        localStorage.getItem(
            "courseId"
        )
    );

    const course_title =
    localStorage.getItem(
        "courseTitle"
    );

    const response =
    await fetch(
        `${API_URL}/generate-certificate`,
        {

            method:
            "POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify({

                user_email,
                student_name,
                course_id,
                course_title,
                score:
                percent
            })
        }
    );

    const data =
    await response.json();

    alert(
        `🎉 Passed!\nScore: ${percent}%`
    );

    window.open(
        `${API_URL}/download-certificate/${data.certificate_id}`,
        "_blank"
    );
}


/* ==========================
   PROFILE
========================== */

async function checkProfile(){

    const email =
    localStorage.getItem(
        "studentEmail"
    );

    if(!email){

        window.location.href =
        "index.html";

        return;
    }

    const response =
    await fetch(
        `${API_URL}/profile/${email}`
    );

    const data =
    await response.json();

    if(
        !data.exists &&
        !window.location.pathname
        .includes(
            "profile-setup"
        )
    ){

        window.location.href =
        "profile-setup.html";

        return;
    }

    if(data.exists){

        localStorage.setItem(
            "studentName",
            data.full_name
        );
    }
}


function previewProfilePhoto(
    event
){

    const file =
    event.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload =
    function(e){

        document
        .getElementById(
            "previewImage"
        )
        .src =
        e.target.result;
    };

    reader.readAsDataURL(
        file
    );
}


async function saveProfile(){

    const email =
    localStorage.getItem(
        "studentEmail"
    );

    const payload = {

        email,

        full_name:
        document.getElementById(
            "fullName"
        ).value,

        phone:
        document.getElementById(
            "phone"
        ).value,

        gender:
        document.getElementById(
            "gender"
        ).value,

        dob:
        document.getElementById(
            "dob"
        ).value,

        college:
        document.getElementById(
            "college"
        ).value,

        course:
        document.getElementById(
            "course"
        ).value,

        city:
        document.getElementById(
            "city"
        ).value,

        profile_photo:
        document.getElementById(
            "previewImage"
        ).src
    };

    await fetch(
        `${API_URL}/save-profile`,
        {

            method:
            "POST",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify(
                payload
            )
        }
    );

    localStorage.setItem(
        "studentName",
        payload.full_name
    );

    window.location.href =
    "dashboard.html";
}


/* ==========================
   LOAD PROFILE
========================== */

async function loadProfile(){

    const email =
    localStorage.getItem(
        "studentEmail"
    );

    const response =
    await fetch(
        `${API_URL}/profile/${email}`
    );

    const data =
    await response.json();

    document.getElementById(
        "profileName"
    ).innerText =
    data.full_name;

    document.getElementById(
        "profileEmail"
    ).innerText =
    email;

    document.getElementById(
        "profileCollege"
    ).innerText =
    data.college;

    document.getElementById(
        "profileCourse"
    ).innerText =
    data.course;

    document.getElementById(
        "profileCity"
    ).innerText =
    data.city;

    document.getElementById(
        "profilePhone"
    ).innerText =
    data.phone;

    if(data.profile_photo){

        document.querySelector(
            ".profile-avatar"
        ).innerHTML =
        `
        <img
        src="${data.profile_photo}"

        style="
        width:100%;
        height:100%;
        border-radius:50%;
        object-fit:cover;
        "
        >
        `;
    }

    const certRes =
    await fetch(
        `${API_URL}/my-certificates/${email}`
    );

    const certificates =
    await certRes.json();

    const container =
    document.getElementById(
        "certificateContainer"
    );

    container.innerHTML =
    "";

    if(
        certificates.length === 0
    ){

        container.innerHTML =
        `
        <div
        class="certificate-card"
        >
            <h3>
                No Certificates Yet
            </h3>

            <p>
                Complete a course and
                pass the quiz to earn
                certificates.
            </p>
        </div>
        `;

        return;
    }

    certificates.forEach(
    cert => {

        container.innerHTML +=
        `
        <div
        class="certificate-card"
        >

            <div>

                <h3>
                    ${cert.course_title}
                </h3>

                <p>
                    Certificate ID:
                    ${cert.certificate_id}
                </p>

                <p>
                    Completion:
                    ${cert.completion_date}
                </p>

                <p>
                    Score:
                    ${cert.score}%
                </p>

            </div>

            <a
            href=
            "${API_URL}/download-certificate/${cert.certificate_id}"

            target="_blank"
            >

                <button
                class="download-btn"
                >
                    Download PDF
                </button>

            </a>

        </div>
        `;
    });
}


/* ==========================
   PAGE DETECTION
========================== */

if(
window.location.pathname
.includes(
    "dashboard"
)
){

    setTimeout(() => {

        checkAdmin();
        loadCourses();

    },500);
}

if(
window.location.pathname
.includes(
    "player"
)
){

    loadPlayer();
}

if(
window.location.pathname
.includes(
    "quiz"
)
){

    loadQuiz();
}

if(
window.location.pathname
.includes(
    "profile.html"
)
){

    loadProfile();
}

async function verifyCertificate(){

    const certificateId =
    document.getElementById(
        "certificateId"
    ).value.trim();

    if(!certificateId){

        alert(
            "Please enter Certificate ID"
        );

        return;
    }

    try{

        const response =
        await fetch(
`${API_URL}/verify-certificate/${certificateId}`
        );

        const data =
        await response.json();

        if(!data.valid){

            alert(
                "❌ Invalid Certificate"
            );

            return;
        }

        // SHOW RESULT PAGE
        document.body.innerHTML =
        `
        <div
        style="
        min-height:100vh;
        display:flex;
        justify-content:center;
        align-items:center;
        background:#0f172a;
        font-family:sans-serif;
        padding:20px;
        "
        >

            <div
            style="
            width:650px;
            background:#161f35;
            border-radius:30px;
            padding:50px;
            color:white;
            text-align:center;
            "
            >

                <h1
                style="
                color:#22c55e;
                font-size:42px;
                "
                >
                    ✅ Certificate Verified
                </h1>

                <p
                style="
                color:#aaa;
                margin-top:10px;
                "
                >
                    This certificate is valid
                </p>

                <div
                style="
                margin-top:35px;
                text-align:left;
                "
                >

                    <h2>
                        👤 Student:
                        ${data.student_name}
                    </h2>

                    <h2>
                        📚 Course:
                        ${data.course_title}
                    </h2>

                    <h2>
                        📅 Completed:
                        ${data.completion_date}
                    </h2>

                    <h2>
                        🏆 Score:
                        ${data.score}%
                    </h2>

                    <h2>
                        🆔 ID:
                        ${data.certificate_id}
                    </h2>

                </div>

                <button
                    onclick=
                    "window.location.reload()"

                    style="
                    margin-top:35px;
                    padding:16px 28px;
                    border:none;
                    border-radius:15px;
                    background:#4f7cff;
                    color:white;
                    font-size:18px;
                    cursor:pointer;
                    "
                >
                    Back
                </button>

            </div>

        </div>
        `;

    }catch(error){

        console.log(error);

        alert(
            "Server Error"
        );
    }
}
async function loadAdminCourses(){

    const container =
    document.getElementById(
        "adminCourseList"
    );

    if(!container){

        return;
    }

    try{

        const response =
        await fetch(
            `${API_URL}/courses`
        );

        const courses =
        await response.json();

        container.innerHTML =
        "";

        courses.forEach(
        course => {

            container.innerHTML +=
            `
            <div
            style="
            background:#1e293b;
            border-radius:22px;
            overflow:hidden;
            color:white;
            box-shadow:
            0 8px 30px
            rgba(0,0,0,.25);

            display:flex;
            flex-direction:column;

            min-height:320px;
            "
            >

                <!-- COURSE IMAGE -->

                <img
                src="${
                    course.thumbnail_url
                    ||
                    'https://via.placeholder.com/400x220'
                }"

                style="
                width:100%;
                height:180px;
                object-fit:cover;
                "
                >


                <!-- CONTENT -->

                <div
                style="
                padding:20px;
                flex:1;

                display:flex;
                flex-direction:column;
                justify-content:space-between;
                "
                >

                    <div>

                        <h2
                        style="
                        font-size:24px;
                        margin-bottom:10px;
                        line-height:1.4;
                        "
                        >
                            ${course.title}
                        </h2>

                        <p
                        style="
                        color:#94a3b8;
                        font-size:15px;
                        "
                        >
                            Course ID:
                            ${course.id}
                        </p>

                    </div>


                    <!-- BUTTONS -->

                    <div
                    style="
                    display:flex;
                    gap:12px;
                    margin-top:20px;
                    "
                    >

                        <button
                        onclick=
                        "editCourse(${course.id})"

                        style="
                        flex:1;
                        background:#3b82f6;
                        border:none;
                        padding:14px;
                        border-radius:14px;
                        color:white;
                        cursor:pointer;
                        font-weight:700;
                        font-size:15px;
                        "
                        >
                            Edit
                        </button>

                        <button
                        onclick=
                        "deleteCourse(${course.id})"

                        style="
                        flex:1;
                        background:#ef4444;
                        border:none;
                        padding:14px;
                        border-radius:14px;
                        color:white;
                        cursor:pointer;
                        font-weight:700;
                        font-size:15px;
                        "
                        >
                            Delete
                        </button>

                    </div>

                </div>

            </div>
            `;
        });

    }catch(error){

        console.log(
            error
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const logo =
        document.querySelector(
            ".logo"
        );

        if(logo){

            logo.style.cursor =
            "pointer";

            logo.onclick =
            function(){

                window.location.href =
                "dashboard.html";
            };
        }
    }
);

/* ==========================
   DELETE COURSE
========================== */

async function deleteCourse(
    courseId
){

    const confirmDelete =
    confirm(
        "Delete this course?"
    );

    if(!confirmDelete){

        return;
    }

    try{

        const response =
        await fetch(
            `${API_URL}/delete-course/${courseId}`,
            {
                method:
                "DELETE"
            }
        );

        const data =
        await response.json();

        alert(
            data.message
        );

        loadAdminCourses();

    }catch(error){

        console.log(error);

        alert(
            "Delete failed"
        );
    }
}


/* ==========================
   ADMIN PAGE DETECTION
========================== */

if(
window.location.pathname
.includes(
    "admin"
)
){

    loadAdminCourses();
}
async function editCourse(
    courseId
){

    try{

        const response =
        await fetch(
            `${API_URL}/courses`
        );

        const courses =
        await response.json();

        const course =
        courses.find(
            c => c.id === courseId
        );

        if(!course){

            alert(
                "Course not found"
            );

            return;
        }

        const title =
        prompt(
            "Course Title",
            course.title
        );

        if(title === null){

            return;
        }

        const description =
        prompt(
            "Course Description",
            course.description
        );

        if(description === null){

            return;
        }

        const playlist =
        prompt(
            "Playlist URL",
            course.playlist_url
        );

        if(playlist === null){

            return;
        }

        const thumbnail =
        prompt(
            "Thumbnail URL",
            course.thumbnail_url
        );

        if(thumbnail === null){

            return;
        }

        const updateResponse =
        await fetch(
            `${API_URL}/update-course/${courseId}`,
            {

                method:"PUT",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:
                JSON.stringify({

                    title:
                    title,

                    description:
                    description,

                    playlist_url:
                    playlist,

                    thumbnail_url:
                    thumbnail
                })
            }
        );

        const result =
        await updateResponse.json();

        alert(
            result.message
        );

        loadAdminCourses();

    }catch(error){

        console.log(
            error
        );

        alert(
            "Failed to update course"
        );
    }
}
/* ==========================
   VIDEO END DETECTION
========================== */

function onPlayerStateChange(
    event
){

    if(
        event.data ===
        YT.PlayerState.ENDED
    ){

        console.log(
            "Video Completed"
        );

        completeLecture();
    }
}

async function loadAdminStats(){

    try{

        const response =
        await fetch(
            `${API_URL}/admin-stats`
        );

        const data =
        await response.json();

        document.getElementById(
            "totalStudents"
        ).innerText =
        data.students;

        document.getElementById(
            "totalCourses"
        ).innerText =
        data.courses;

        document.getElementById(
            "totalQuizzes"
        ).innerText =
        data.quizzes;

        document.getElementById(
            "totalCertificates"
        ).innerText =
        data.certificates;

    }catch(error){

        console.log(
            error
        );
    }
}