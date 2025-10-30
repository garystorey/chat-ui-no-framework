const messagesEl = document.getElementById("messages");
const suggestionsEl = document.getElementById("suggestions");
const inputEl = document.getElementById("inputText");
const sendBtn = document.getElementById("sendBtn");
const inputPanel = document.getElementById("inputPanel");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const hljsTheme = document.getElementById("hljs-theme");
const chatContainer = document.querySelector(".chat-container");

// Respect reduced motion in JS animations as well
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// Initial theme from system preference
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
document.body.className = prefersDark ? "dark" : "light";
updateThemeToggleUI();
updateHighlightTheme();

// Toggle via emoji button
themeToggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  document.body.className = isLight ? "dark" : "light";
  updateThemeToggleUI();
  updateHighlightTheme();
});

function updateThemeToggleUI() {
  const isLight = document.body.classList.contains("light");
  themeToggleBtn.textContent = isLight ? "☀️" : "🌓";
  themeToggleBtn.setAttribute("aria-checked", String(isLight));
  themeToggleBtn.setAttribute(
    "aria-label",
    isLight ? "Switch to dark mode" : "Switch to light mode"
  );
  themeToggleBtn.setAttribute(
    "title",
    isLight ? "Switch to dark mode" : "Switch to light mode"
  );
}

function updateHighlightTheme() {
  const theme = document.body.classList.contains("light")
    ? "github.min.css"
    : "github-dark.min.css";
  hljsTheme.href = `https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/${theme}`;
}

// Markdown + code highlight
marked.setOptions({
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});
function renderMarkdown(text) {
  return DOMPurify.sanitize(marked.parse(text));
}

// Auto-grow textarea
function autoGrow(el) {
  el.style.height = "auto";
  el.style.height = el.scrollHeight + "px";
}
inputEl.addEventListener("input", () => autoGrow(inputEl));

// Open chat (instant height; content fades via CSS)
function openChatInstant() {
  document.body.classList.add("chat-open"); // sets 80vh + bottom gap
  chatContainer.removeAttribute("aria-hidden");
  messagesEl.style.display = "block";
  if (suggestionsEl) suggestionsEl.style.display = "none";
}

function addMessage(text, cls) {
  const m = document.createElement("div");
  m.classList.add("message", cls);
  m.setAttribute("role", "article");
  m.setAttribute("aria-label", `${cls === "user" ? "User" : "Bot"} message`);
  m.innerHTML = renderMarkdown(text);
  messagesEl.appendChild(m);
  messagesEl.scrollTo({
    top: messagesEl.scrollHeight,
    behavior: reduceMotion ? "auto" : "smooth",
  });
}

// Accessible typing indicator
function showTyping() {
  const status = document.createElement("div");
  status.className = "typing";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-label", "Assistant is typing");
  status.innerHTML =
    '<span class="dot" aria-hidden="true"></span><span class="dot" aria-hidden="true"></span><span class="dot" aria-hidden="true"></span>';
  status.id = "typing-indicator";
  messagesEl.appendChild(status);
  messagesEl.scrollTo({
    top: messagesEl.scrollHeight,
    behavior: reduceMotion ? "auto" : "smooth",
  });
}

function hideTyping() {
  const t = document.getElementById("typing-indicator");
  if (t) t.remove();
}

let opened = false;

// Send handler (form submit for semantics)
inputPanel.addEventListener("submit", (e) => {
  e.preventDefault();
  const txt = inputEl.value.trim();
  if (!txt) {
    inputEl.focus();
    return;
  }

  if (!opened) {
    opened = true;
    openChatInstant();
  }

  addMessage(txt, "user");
  inputEl.value = "";
  autoGrow(inputEl);

  // Simulate async bot reply with typing indicator
  showTyping();
  setTimeout(() => {
    hideTyping();
    addMessage(`You said:\n\n> ${txt}`, "bot");
  }, 350 + Math.min(1400, Math.max(250, txt.length * 8))); // tiny dynamic delay
});

// Enter to send; Shift+Enter = newline
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendBtn.click();
  }
});

// Suggestion cards fill textarea (no auto-send)
document.querySelectorAll(".suggestion-card").forEach((card) => {
  card.addEventListener("click", () => {
    inputEl.value = card.textContent.trim();
    autoGrow(inputEl);
    inputEl.focus();
  });
});
