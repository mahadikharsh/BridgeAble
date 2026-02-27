let timerInterval = null;

function getMode() {
  return localStorage.getItem("learningMode") || "normal";
}

function getDefaultSeconds() {
  const stored = localStorage.getItem("focusTimerDefaultSeconds");
  return stored ? parseInt(stored, 10) : 25 * 60;
}

function setDefaultSeconds(seconds) {
  localStorage.setItem("focusTimerDefaultSeconds", String(seconds));
}

function getRemainingSeconds() {
  const stored = localStorage.getItem("focusTimerRemaining");
  return stored ? parseInt(stored, 10) : getDefaultSeconds();
}

function setRemainingSeconds(seconds) {
  localStorage.setItem("focusTimerRemaining", String(seconds));
}

function updateTimerUI(seconds) {
  const minEl = document.getElementById("timer-min");
  const secEl = document.getElementById("timer-sec");
  if (!minEl || !secEl) return;

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  minEl.textContent = String(m).padStart(2, "0");
  secEl.textContent = String(s).padStart(2, "0");
}

function showTimerIfFocusMode() {
  const box = document.getElementById("focus-timer");
  if (!box) return;

  box.style.display = (getMode() === "focus") ? "block" : "none";
}

function applyTimerMinutes() {
  const input = document.getElementById("timerMinutes");
  if (!input) return;

  let mins = parseInt(input.value, 10);
  if (isNaN(mins) || mins < 1) mins = 1;
  if (mins > 180) mins = 180;

  const seconds = mins * 60;
  setDefaultSeconds(seconds);
  setRemainingSeconds(seconds);
  updateTimerUI(seconds);

  // If running, restart with new time
  const running = localStorage.getItem("focusTimerRunning") === "true";
  if (running) {
    pauseFocusTimer();
    startFocusTimer();
  }
}

function playBeep() {
  const beep = document.getElementById("timerBeep");
  if (beep) {
    beep.currentTime = 0;
    beep.play().catch(() => {});
  } else {
    // fallback simple alert sound (not reliable)
    alert("Timer ended!");
  }
}

function startFocusTimer() {
  if (getMode() !== "focus") return;

  if (timerInterval) clearInterval(timerInterval);

  localStorage.setItem("focusTimerRunning", "true");

  timerInterval = setInterval(() => {
    let remaining = getRemainingSeconds();
    remaining -= 1;

    if (remaining <= 0) {
      remaining = 0;
      setRemainingSeconds(remaining);
      updateTimerUI(remaining);
      pauseFocusTimer();

      playBeep();
      // Optional voice message if you have speak()
      if (typeof speak === "function") speak("Focus session completed.");
      return;
    }

    setRemainingSeconds(remaining);
    updateTimerUI(remaining);
  }, 1000);
}

function pauseFocusTimer() {
  localStorage.setItem("focusTimerRunning", "false");
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetFocusTimer() {
  pauseFocusTimer();
  const def = getDefaultSeconds();
  setRemainingSeconds(def);
  updateTimerUI(def);
}

// Restore on load
document.addEventListener("DOMContentLoaded", () => {
  showTimerIfFocusMode();

  // set input box to saved minutes
  const minutesInput = document.getElementById("timerMinutes");
  if (minutesInput) {
    minutesInput.value = Math.floor(getDefaultSeconds() / 60);
  }

  updateTimerUI(getRemainingSeconds());

  const running = localStorage.getItem("focusTimerRunning") === "true";
  if (running && getMode() === "focus") startFocusTimer();
});