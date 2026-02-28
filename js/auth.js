// js/auth.js
// Frontend-only auth for hackathon demo (IndexedDB).
// Security note: real auth must be server-side.

(function () {
  // ---------- helpers ----------
  const $ = (id) => document.getElementById(id);

  function setMsg(el, text, kind) {
    el.className = kind === "ok" ? "ok" : "error";
    el.textContent = text;
  }

  // basic sanitize for UI (prevents HTML injection in output)
  function sanitize(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;")
      .trim();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function strongEnough(pw) {
    return typeof pw === "string" && pw.length >= 6;
  }

  // hash (demo only) - not a real secure hash like bcrypt
  async function hashPassword(pw) {
    const enc = new TextEncoder().encode(pw);
    const buf = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }

  // ---------- DB users store ----------
  // We will store users in "users" object store. If you don't have it, we create it by bumping DB version (see db.js patch below).
  async function ensureUsersStoreExists() {
    // If your DB already created without users store, easiest for hackathon:
    // change DB_VERSION in db.js from 1 -> 2, and add "users" store in onupgradeneeded.
    // I'll give you that patch right after this file.
    await initDB();
  }

  function userKey(email, role) {
    return `${email.toLowerCase()}::${role}`;
  }

  async function getUser(email, role) {
    await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("users", "readonly");
      const store = tx.objectStore("users");
      const req = store.get(userKey(email, role));
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function putUser(user) {
    await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("users", "readwrite");
      const store = tx.objectStore("users");
      const req = store.put(user);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  function setSession(session) {
    localStorage.setItem("ba_session", JSON.stringify(session));
  }

  // ---------- Tabs ----------
  function showPanel(which) {
    const panels = {
      login: $("panelLogin"),
      signup: $("panelSignup"),
      forgot: $("panelForgot")
    };
    Object.values(panels).forEach(p => p.classList.add("hidden"));

    $("tabLogin").classList.remove("active");
    $("tabSignup").classList.remove("active");
    $("tabForgot").classList.remove("active");

    if (which === "login") { panels.login.classList.remove("hidden"); $("tabLogin").classList.add("active"); }
    if (which === "signup") { panels.signup.classList.remove("hidden"); $("tabSignup").classList.add("active"); }
    if (which === "forgot") { panels.forgot.classList.remove("hidden"); $("tabForgot").classList.add("active"); }
  }

  // ---------- main ----------
  document.addEventListener("DOMContentLoaded", async () => {
    // auto redirect if already logged in
    const existing = JSON.parse(localStorage.getItem("ba_session") || "null");
    if (existing) {
      window.location.href = "dashboard.html";
      return;
    }

    await ensureUsersStoreExists();

    $("tabLogin").onclick = () => showPanel("login");
    $("tabSignup").onclick = () => showPanel("signup");
    $("tabForgot").onclick = () => showPanel("forgot");
    $("btnGoForgot").onclick = () => showPanel("forgot");
    $("btnBackLogin").onclick = () => showPanel("login");

    // LOGIN
    $("btnLogin").onclick = async () => {
      const msg = $("loginMsg");
      msg.textContent = "";

      const email = sanitize($("loginEmail").value);
      const pw = $("loginPassword").value || "";
      const role = $("loginRole").value;

      if (!isValidEmail(email)) return setMsg(msg, "Enter a valid email.", "err");
      if (!strongEnough(pw)) return setMsg(msg, "Password must be at least 6 characters.", "err");

      try {
        const user = await getUser(email, role);
        if (!user) return setMsg(msg, "Account not found for this role. Try Signup.", "err");

        const hashed = await hashPassword(pw);
        if (hashed !== user.passwordHash) return setMsg(msg, "Wrong password.", "err");

        setSession({
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          loginAt: Date.now()
        });

        setMsg(msg, "Login successful. Redirecting...", "ok");
        setTimeout(() => window.location.href = "index.html", 600);
      } catch (e) {
        console.error(e);
        setMsg(msg, "Login error. Check console.", "err");
      }
    };

    // SIGNUP
    $("btnSignup").onclick = async () => {
      const msg = $("signupMsg");
      msg.textContent = "";

      const name = sanitize($("suName").value);
      const email = sanitize($("suEmail").value);
      const role = $("suRole").value;
      const pw = $("suPassword").value || "";
      const secQ = sanitize($("suSecQ").value);
      const secA = sanitize($("suSecA").value);

      if (name.length < 2) return setMsg(msg, "Enter your name.", "err");
      if (!isValidEmail(email)) return setMsg(msg, "Enter a valid email.", "err");
      if (!strongEnough(pw)) return setMsg(msg, "Password must be at least 6 characters.", "err");
      if (secQ.length < 5) return setMsg(msg, "Enter a security question (min 5 chars).", "err");
      if (secA.length < 1) return setMsg(msg, "Enter a security answer.", "err");

      try {
        const exists = await getUser(email, role);
        if (exists) return setMsg(msg, "Account already exists for this role. Login instead.", "err");

        const passwordHash = await hashPassword(pw);
        const secAHash = await hashPassword(secA.toLowerCase());

        await putUser({
          id: userKey(email, role),
          email: email.toLowerCase(),
          name,
          role,
          passwordHash,
          secQ,
          secAHash,
          createdAt: Date.now()
        });

        setMsg(msg, "Account created! You can login now.", "ok");
        showPanel("login");
        $("loginEmail").value = email;
        $("loginRole").value = role;
      } catch (e) {
        console.error(e);
        setMsg(msg, "Signup error. Check console.", "err");
      }
    };

    // FORGOT PASSWORD
    $("btnReset").onclick = async () => {
      const msg = $("forgotMsg");
      msg.textContent = "";

      const email = sanitize($("fpEmail").value);
      const secA = $("fpSecA").value || "";
      const newPw = $("fpNewPassword").value || "";

      // reset applies to BOTH roles? We'll ask user to reset for the selected role by trying both
      if (!isValidEmail(email)) return setMsg(msg, "Enter a valid email.", "err");
      if (!strongEnough(newPw)) return setMsg(msg, "New password must be at least 6 characters.", "err");
      if (secA.trim().length < 1) return setMsg(msg, "Enter security answer.", "err");

      const roles = ["student", "teacher"];
      let updated = false;

      try {
        const secAHash = await hashPassword(secA.toLowerCase());
        const newHash = await hashPassword(newPw);

        for (const role of roles) {
          const user = await getUser(email, role);
          if (!user) continue;
          if (user.secAHash !== secAHash) continue;

          user.passwordHash = newHash;
          await putUser(user);
          updated = true;
        }

        if (!updated) return setMsg(msg, "No matching account found (or wrong security answer).", "err");

        setMsg(msg, "Password reset successful. Please login.", "ok");
        showPanel("login");
        $("loginEmail").value = email;
      } catch (e) {
        console.error(e);
        setMsg(msg, "Reset error. Check console.", "err");
      }
    };
  });
})();