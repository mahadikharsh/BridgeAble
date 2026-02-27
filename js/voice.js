let recognition;

function startListening() {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Voice recognition not supported. Please use Google Chrome.");
    return;
  }

  // reuse one recognition instance
  if (!recognition) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = function (event) {
      // use the latest result in continuous mode
      const i = event.resultIndex;
      const command = event.results[i][0].transcript.toLowerCase().trim();
      console.log("Voice Command:", command);
      handleVoiceCommand(command);
    };

    recognition.onerror = function (e) {
      console.log("Voice recognition error:", e);
    };
  }

  recognition.start();
}

function stopListening() {
  if (recognition) recognition.stop();
}

// Optional: stop mic when leaving page
window.addEventListener("beforeunload", stopListening);

function setModeAndGo(mode) {
  localStorage.setItem("learningMode", mode);
  window.location.href = "lesson-select.html";
}

function selectLessonAndGo(lessonKey) {
  localStorage.setItem("selectedLesson", lessonKey);
  window.location.href = "lesson.html";
}

function handleVoiceCommand(command) {
  // 🔊 Read aloud
  if (command.includes("read")) {
    if (typeof readAloud === "function") readAloud();
    return;
  }

  // 🏠 Navigation
  if (command.includes("home")) {
    window.location.href = "index.html";
    return;
  }

  if (command.includes("lesson select") || command.includes("lessons")) {
    window.location.href = "lesson-select.html";
    return;
  }

  if (command.includes("back")) {
    window.history.back();
    return;
  }

  // 🎯 Mode controls (flexible matching)
  if (command.includes("focus")) return setModeAndGo("focus");
  if (command.includes("dyslexia")) return setModeAndGo("dyslexia");
  if (command.includes("contrast")) return setModeAndGo("contrast");
  if (command.includes("normal")) return setModeAndGo("normal");

  // 📚 Lesson selection by voice
  if (command.includes("algorithm")) return selectLessonAndGo("algorithm");
  if (command.includes("programming")) return selectLessonAndGo("programming");
  if (command.includes("html")) return selectLessonAndGo("html");

  alert("Command not recognized: " + command);
}