document.addEventListener("DOMContentLoaded", function () {

    const mode = localStorage.getItem("learningMode") || "normal";
    const lessonKey = localStorage.getItem("selectedLesson") || "algorithm";

    applyMode(mode);
    renderLesson(lessonKey);
});

function applyMode(mode) {
    document.body.classList.remove("dyslexia-mode", "focus-mode", "contrast-mode");

    if (mode === "dyslexia") {
        document.body.classList.add("dyslexia-mode");
    } 
    else if (mode === "focus") {
        document.body.classList.add("focus-mode");
    } 
    else if (mode === "contrast") {
        document.body.classList.add("contrast-mode");
    }
}

function renderLesson(lessonKey) {

    if (!lessons || !lessons[lessonKey]) {
        console.error("Lesson not found:", lessonKey);
        return;
    }

    const lessonTitle = document.getElementById("lesson-title");
    const lessonContent = document.getElementById("lesson-content");

    const mode = localStorage.getItem("learningMode") || "normal";
    

    lessonTitle.innerText = lessons[lessonKey].title;

    if (mode === "focus") {
        lessonContent.innerHTML = lessons[lessonKey].focus;
    } else {
        lessonContent.innerHTML = lessons[lessonKey].normal;
    }
}

function readAloud() {
    const content = document.getElementById("lesson-content");
    const text = content.innerText;

    if (!text) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";

    window.speechSynthesis.speak(speech);
}
