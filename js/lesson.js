document.addEventListener("DOMContentLoaded", function () {

    const mode = localStorage.getItem("learningMode") || "normal";
    const lesson = localStorage.getItem("selectedLesson") || "algorithm";

    applyMode(mode);
    renderLesson(lesson);
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
