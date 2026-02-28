// js/protect.js
(function () {
  const session = JSON.parse(localStorage.getItem("ba_session") || "null");
  if (!session) window.location.href = "auth.html";
})();