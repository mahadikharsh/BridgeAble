async function selectMode(mode) {
  localStorage.setItem("learningMode", mode); // keep for fast access

  await saveSetting("learningMode", mode);   // save to DB

  window.location.href = "lesson-select.html";
}