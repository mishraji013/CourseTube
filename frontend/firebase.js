// Firebase SDK
import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

    getAuth,

    GoogleAuthProvider,

    signInWithPopup,

    signOut

}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



// YOUR FIREBASE CONFIG

const firebaseConfig = {
    apiKey: "AIzaSyDqRGwBUTo_qpgwZWMcmxcpfSKTnVrg8LQ",
    authDomain: "coursetube-20765.firebaseapp.com",
    projectId: "coursetube-20765",
    storageBucket:
        "coursetube-20765.firebasestorage.app",
    messagingSenderId:
        "933973808835",
    appId:
        "1:933973808835:web:e193deb0c257bd8518b476",
    measurementId:
        "G-919RX6HQLM"
};



// INIT

const app =
initializeApp(
    firebaseConfig
);

const auth =
getAuth(app);

const provider =
new GoogleAuthProvider();




// GOOGLE LOGIN

window.googleLogin =
async function(){

    try{

        const result =
        await signInWithPopup(
            auth,
            provider
        );

        const user =
        result.user;

        localStorage.setItem(
            "studentEmail",
            user.email
        );

        localStorage.setItem(
            "studentName",
            user.displayName
        );

        localStorage.setItem(
            "studentPhoto",
            user.photoURL
        );

        window.location.href =
        "dashboard.html";

    }

    catch(error){

        console.log(error);

        alert(
            error.message
        );
    }
};




// LOGOUT

window.logout =
async function(){

    try{

        await signOut(auth);

        localStorage.clear();

        window.location.href =
        "index.html";
    }

    catch(error){

        console.log(error);

        alert(
            "Logout failed"
        );
    }
};