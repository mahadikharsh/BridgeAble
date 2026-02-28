// js/lesson.js  (DB-based lesson rendering)

document.addEventListener("DOMContentLoaded", async () => {
  // 1) Read mode + selected lesson
  const mode = localStorage.getItem("learningMode") || "normal";
  const lessonKey = localStorage.getItem("selectedLesson") || "algorithm";

  // 2) Apply accessibility mode classes
  applyMode(mode);

  // 3) Init DB (don’t let DB failure blank the page)
  try {
    await initDB();
  } catch (e) {
    console.error("DB init failed:", e);
    showError("Database not available.");
    return;
  }

  // 4) Load lesson from DB
  const lesson = await getLesson(lessonKey);

  if (!lesson) {
    showError("Lesson not found in database.");
    return;
  }

  // 5) Render title + content
  const titleEl = document.getElementById("lesson-title");
  const contentEl = document.getElementById("lesson-content");

  titleEl.innerText = lesson.title;

  const html = (mode === "focus" && lesson.focus) ? lesson.focus : lesson.normal;
  contentEl.innerHTML = html;

  // 6) Save last opened lesson (Resume feature)
  saveSetting("lastLesson", lessonKey);
  localStorage.setItem("lastLesson", lessonKey);
});

// ===== Mode styling (same behavior as before) =====
function applyMode(mode) {
  document.body.classList.remove("dyslexia-mode", "focus-mode", "contrast-mode");

  if (mode === "dyslexia") document.body.classList.add("dyslexia-mode");
  if (mode === "focus") document.body.classList.add("focus-mode");
  if (mode === "contrast") document.body.classList.add("contrast-mode");
}

// ===== Mark as completed (keeps your badges working) =====
function markLessonComplete() {
  const lessonKey = localStorage.getItem("selectedLesson");
  if (!lessonKey) return;

  saveProgress(lessonKey, true);
  alert("Lesson marked as completed!");
}

// ===== Helper =====
function showError(msg) {
  const titleEl = document.getElementById("lesson-title");
  const contentEl = document.getElementById("lesson-content");

  if (titleEl) titleEl.innerText = "Error";
  if (contentEl) contentEl.innerHTML = `<p>${msg}</p>`;
}

function readAloud() {
  const contentEl = document.getElementById("lesson-content");
  if (!contentEl) return;

  const text = contentEl.innerText.trim();
  if (!text) {
    alert("No lesson content to read.");
    return;
  }

  if (!("speechSynthesis" in window)) {
    alert("Text-to-speech not supported in this browser.");
    return;
  }

  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 1;
  window.speechSynthesis.speak(utter);
}