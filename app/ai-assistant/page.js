"use client";

import { useEffect, useRef, useState } from "react";
import LegacyScreen from "@/components/LegacyScreen";
import AuthGuard from "@/components/AuthGuard";

const BODY_HTML = "<!-- TopAppBar -->\n<header class=\"fixed top-0 w-full z-50 flex items-center justify-between px-margin-mobile h-16 bg-surface/70 dark:bg-surface-container/70 backdrop-blur-xl border-b border-white/50 dark:border-outline/20 shadow-sm\">\n<div class=\"flex items-center gap-3\">\n<div class=\"w-10 h-10 rounded-full overflow-hidden border-2 border-secondary-container/50\">\n<img class=\"w-full h-full object-cover\" data-alt=\"A professional high-resolution studio portrait of a university student with a friendly expression. The student is wearing modern tech-inspired academic clothing. The background is a soft-focus library with gentle cyan and purple ambient lighting, matching a premium educational app aesthetic.\" src=\"https://lh3.googleusercontent.com/aida-public/AB6AXuAsAkAGsa6MflYNVpq8KMdrlQ27CpUAMmXT8EG-JkpJClfTTRF8bZafxKayoB1EpSgbxG13f92EudOgAcI4_NbbGAxKjOLimo_iIloXFNsTIhAa8lOQ9Pa9R6v0odWvKCs0j41TCW5aksSBffsPmmWwTn8PqWUskQDyRKvqQo_LuBVFKFY-Cxia5P6wxs8XlOhCsE4TLq-iPhfqrq87nr0qKS6koZBFKWE-B-6NU2LU76Rctid4mE1v7w\"/>\n</div>\n<h1 class=\"font-headline-md text-headline-md font-bold bg-clip-text text-transparent bg-gradient-to-r from-secondary-container to-on-tertiary-container\">EduCore</h1>\n</div>\n<button class=\"w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors\">\n<span class=\"material-symbols-outlined\">notifications</span>\n</button>\n</header>\n<!-- Main Chat Canvas -->\n<main class=\"flex-1 pt-20 pb-32 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col\">\n<!-- Quick Actions Grid -->\n<section class=\"grid grid-cols-2 md:grid-cols-3 gap-3 mb-8\">\n<button class=\"glass-card flex items-center gap-3 p-4 rounded-xl hover:bg-white/90 transition-all group\">\n<div class=\"w-10 h-10 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform\">\n<span class=\"material-symbols-outlined\">picture_as_pdf</span>\n</div>\n<span class=\"font-label-md text-label-md text-on-surface\">Summarize PDF</span>\n</button>\n<button class=\"glass-card flex items-center gap-3 p-4 rounded-xl hover:bg-white/90 transition-all group\">\n<div class=\"w-10 h-10 rounded-lg bg-on-tertiary-container/10 flex items-center justify-center text-on-tertiary-container group-hover:scale-110 transition-transform\">\n<span class=\"material-symbols-outlined\">lightbulb</span>\n</div>\n<span class=\"font-label-md text-label-md text-on-surface\">Explain Concept</span>\n</button>\n<button class=\"glass-card hidden md:flex items-center gap-3 p-4 rounded-xl hover:bg-white/90 transition-all group\">\n<div class=\"w-10 h-10 rounded-lg bg-primary-container/10 flex items-center justify-center text-primary-fixed-dim group-hover:scale-110 transition-transform\">\n<span class=\"material-symbols-outlined\">quiz</span>\n</div>\n<span class=\"font-label-md text-label-md text-on-surface\">Generate Quiz</span>\n</button>\n</section>\n<!-- Message List -->\n<div class=\"flex-1 space-y-6 overflow-y-auto custom-scrollbar pb-4\" id=\"chat-container\">\n<!-- AI Welcome Message -->\n<div class=\"flex flex-col items-start max-w-[85%] md:max-w-[70%] animate-in fade-in slide-in-from-bottom-4 duration-500\">\n<div class=\"ai-bubble p-4 rounded-2xl rounded-tl-none\">\n<p class=\"font-body-md text-body-md text-on-surface\">\n                        Welcome back! I'm your <span class=\"font-bold text-secondary\">EduCore AI</span> assistant. How can I help you excel in your studies today? \n                    </p>\n<div class=\"mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar\">\n<span class=\"px-3 py-1 bg-surface-container rounded-full text-[12px] font-medium text-on-surface-variant border border-outline-variant/30\">Calc III Exam Prep</span>\n<span class=\"px-3 py-1 bg-surface-container rounded-full text-[12px] font-medium text-on-surface-variant border border-outline-variant/30\">Organic Chemistry</span>\n</div>\n</div>\n<span class=\"mt-1 ml-1 text-[10px] text-outline font-medium\">EDUCORE AI \u2022 JUST NOW</span>\n</div>\n<!-- User Message -->\n<div class=\"flex flex-col items-end self-end max-w-[85%] md:max-w-[70%]\">\n<div class=\"bg-primary-container text-white p-4 rounded-2xl rounded-tr-none shadow-md\">\n<p class=\"font-body-md text-body-md\">\n                        Can you explain the difference between Mitochondria and Chloroplasts in simple terms for my biology quiz?\n                    </p>\n</div>\n<span class=\"mt-1 mr-1 text-[10px] text-outline font-medium\">YOU \u2022 2 MIN AGO</span>\n</div>\n<!-- AI Detailed Response -->\n<div class=\"flex flex-col items-start max-w-[85%] md:max-w-[70%]\">\n<div class=\"ai-bubble p-4 rounded-2xl rounded-tl-none\">\n<h4 class=\"font-headline-sm text-headline-sm mb-2 text-secondary\">The Powerhouse Comparison</h4>\n<p class=\"font-body-md text-body-md text-on-surface mb-3\">\n                        Think of them both as biological batteries, but they charge in different ways:\n                    </p>\n<ul class=\"space-y-3 font-body-sm text-body-sm text-on-surface-variant\">\n<li class=\"flex gap-2\">\n<span class=\"material-symbols-outlined text-secondary text-sm\">bolt</span>\n<span><strong>Mitochondria:</strong> Found in almost all cells. They turn food (glucose) into energy (ATP). It's like a cell's engine burning fuel.</span>\n</li>\n<li class=\"flex gap-2\">\n<span class=\"material-symbols-outlined text-on-tertiary-container text-sm\">wb_sunny</span>\n<span><strong>Chloroplasts:</strong> Found only in plant cells and algae. They capture solar energy to make food. It's like a solar panel.</span>\n</li>\n</ul>\n<div class=\"mt-4 p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center gap-3\">\n<div class=\"w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm\">\n<span class=\"material-symbols-outlined text-on-tertiary-container\">play_circle</span>\n</div>\n<div class=\"flex-1\">\n<p class=\"text-[12px] font-bold text-on-surface\">Suggested Visual</p>\n<p class=\"text-[10px] text-outline\">Cell Structure 101 Video</p>\n</div>\n</div>\n</div>\n<span class=\"mt-1 ml-1 text-[10px] text-outline font-medium\">EDUCORE AI \u2022 1 MIN AGO</span>\n</div>\n</div>\n</main>\n<!-- Bottom Input Bar -->\n<div class=\"fixed bottom-0 w-full bg-surface/80 backdrop-blur-2xl px-4 py-4 md:py-6 flex flex-col items-center\">\n<div class=\"max-w-container-max w-full relative flex items-center gap-2 md:gap-4\">\n<!-- Attachment -->\n<button class=\"w-12 h-12 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors shrink-0\">\n<span class=\"material-symbols-outlined\">add</span>\n</button>\n<!-- Main Input -->\n<div class=\"flex-1 glass-card rounded-full flex items-center px-5 py-3 border border-outline-variant/40 shadow-inner\">\n<input id=\"ai-chat-input\" class=\"bg-transparent border-none focus:ring-0 w-full text-body-md text-on-surface placeholder:text-outline/60\" placeholder=\"Ask anything about your courses...\" type=\"text\"/>\n<button class=\"text-on-surface-variant hover:text-secondary-container transition-colors\">\n<span class=\"material-symbols-outlined\">mic</span>\n</button>\n</div>\n<!-- Send Button -->\n<button id=\"ai-chat-send\" class=\"gradient-btn w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-secondary-container/20 shrink-0\">\n<span class=\"material-symbols-outlined\">send</span>\n</button>\n</div>\n<!-- Mobile Navigation Bottom Bar (Filtered) -->\n<nav class=\"md:hidden mt-4 w-full flex justify-around items-center h-12\">\n<div class=\"flex flex-col items-center justify-center text-primary dark:text-primary-fixed bg-secondary-container/30 dark:bg-primary-container/50 rounded-full px-4 py-1\">\n<span class=\"material-symbols-outlined\" style=\"font-variation-settings: 'FILL' 1;\">smart_toy</span>\n<span class=\"text-[10px] font-bold\">AI</span>\n</div>\n<div class=\"flex flex-col items-center justify-center text-on-surface-variant\">\n<span class=\"material-symbols-outlined\">dashboard</span>\n<span class=\"text-[10px]\">Home</span>\n</div>\n<div class=\"flex flex-col items-center justify-center text-on-surface-variant\">\n<span class=\"material-symbols-outlined\">library_books</span>\n<span class=\"text-[10px]\">Courses</span>\n</div>\n<div class=\"flex flex-col items-center justify-center text-on-surface-variant\">\n<span class=\"material-symbols-outlined\">person</span>\n<span class=\"text-[10px]\">Profile</span>\n</div>\n</nav>\n</div>\n<!-- Desktop Sidebar Suggestion (Optional context piece) -->\n<aside class=\"fixed right-8 top-24 w-64 hidden xl:block\">\n<div class=\"glass-card rounded-2xl p-6 space-y-6\">\n<div>\n<h3 class=\"font-label-md text-label-md text-outline uppercase tracking-wider mb-4\">Study Stats</h3>\n<div class=\"flex items-center justify-between mb-2\">\n<span class=\"text-body-sm text-on-surface\">Current Focus</span>\n<span class=\"text-body-sm font-bold text-secondary\">85%</span>\n</div>\n<div class=\"w-full h-1 bg-surface-container-highest rounded-full overflow-hidden\">\n<div class=\"h-full bg-gradient-to-r from-secondary-container to-on-tertiary-container shadow-[0_0_8px_rgba(6,182,212,0.5)]\" style=\"width: 85%\"></div>\n</div>\n</div>\n<div>\n<h3 class=\"font-label-md text-label-md text-outline uppercase tracking-wider mb-4\">Upcoming Deadlines</h3>\n<div class=\"space-y-3\">\n<div class=\"p-3 rounded-lg bg-surface-container-low border border-white/50 flex items-center gap-3\">\n<div class=\"w-2 h-2 rounded-full bg-error\"></div>\n<div class=\"flex-1\">\n<p class=\"text-[12px] font-bold text-on-surface\">Bio Lab Report</p>\n<p class=\"text-[10px] text-outline\">Tomorrow, 11:59 PM</p>\n</div>\n</div>\n<div class=\"p-3 rounded-lg bg-surface-container-low border border-white/50 flex items-center gap-3 opacity-60\">\n<div class=\"w-2 h-2 rounded-full bg-on-tertiary-container\"></div>\n<div class=\"flex-1\">\n<p class=\"text-[12px] font-bold text-on-surface\">Psych Quiz</p>\n<p class=\"text-[10px] text-outline\">Friday, 10:00 AM</p>\n</div>\n</div>\n</div>\n</div>\n<button class=\"w-full py-3 rounded-xl border-2 border-secondary-container/30 text-secondary font-bold text-body-sm hover:bg-secondary-container/10 transition-colors\">\n                View Study Plan\n            </button>\n</div>\n</aside>";
const BODY_CLASS = "mesh-bg min-h-screen flex flex-col";
const STYLE_CSS = "\n      body {\n        font-family: 'Inter', sans-serif;\n        background-color: #fcf8fa;\n        overflow-x: hidden;\n      }\n      .glass-card {\n        background: rgba(255, 255, 255, 0.7);\n        backdrop-filter: blur(20px);\n        -webkit-backdrop-filter: blur(20px);\n        border: 1px solid rgba(255, 255, 255, 0.5);\n      }\n      .ai-bubble {\n        background: rgba(255, 255, 255, 0.85);\n        backdrop-filter: blur(12px);\n        border: 1.5px solid transparent;\n        background-image: linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), \n                          linear-gradient(135deg, #06b6d4, #9863ff);\n        background-origin: border-box;\n        background-clip: padding-box, border-box;\n        box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);\n      }\n      .gradient-btn {\n        background: linear-gradient(135deg, #06b6d4, #9863ff);\n        transition: transform 0.2s ease, box-shadow 0.2s ease;\n      }\n      .gradient-btn:active {\n        transform: scale(0.95);\n      }\n      .mesh-bg {\n        background-color: #fcf8fa;\n        background-image: \n          radial-gradient(at 0% 0%, rgba(87, 223, 254, 0.15) 0px, transparent 50%),\n          radial-gradient(at 100% 0%, rgba(152, 99, 255, 0.1) 0px, transparent 50%),\n          radial-gradient(at 100% 100%, rgba(87, 223, 254, 0.15) 0px, transparent 50%),\n          radial-gradient(at 0% 100%, rgba(152, 99, 255, 0.1) 0px, transparent 50%);\n      }\n      .custom-scrollbar::-webkit-scrollbar {\n        width: 4px;\n      }\n      .custom-scrollbar::-webkit-scrollbar-track {\n        background: transparent;\n      }\n      .custom-scrollbar::-webkit-scrollbar-thumb {\n        background: #e4e2e4;\n        border-radius: 10px;\n      }\n    ";

function appendBubble(container, { role, text }) {
  const wrap = document.createElement("div");
  if (role === "user") {
    wrap.className =
      "flex flex-col items-end max-w-[85%] md:max-w-[70%] ml-auto animate-in fade-in slide-in-from-bottom-4 duration-500";
    wrap.innerHTML = `
      <div class="gradient-btn text-white p-4 rounded-2xl rounded-tr-none">
        <p class="font-body-md text-body-md">${text}</p>
      </div>
      <span class="mt-1 mr-1 text-[10px] text-outline font-medium">YOU • JUST NOW</span>
    `;
  } else {
    wrap.className =
      "flex flex-col items-start max-w-[85%] md:max-w-[70%] animate-in fade-in slide-in-from-bottom-4 duration-500";
    wrap.innerHTML = `
      <div class="ai-bubble p-4 rounded-2xl rounded-tl-none">
        <p class="font-body-md text-body-md text-on-surface">${text}</p>
      </div>
      <span class="mt-1 ml-1 text-[10px] text-outline font-medium">EDUCORE AI • JUST NOW</span>
    `;
  }
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

function Screen() {
  const wrapRef = useRef(null);
  const historyRef = useRef([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const root = wrapRef.current;
    if (!root) return;
    const container = root.querySelector("#chat-container");
    const input = root.querySelector("#ai-chat-input");
    const sendBtn = root.querySelector("#ai-chat-send");
    if (!container || !input || !sendBtn) return;

    const send = async () => {
      const text = input.value.trim();
      if (!text || sending) return;
      input.value = "";
      appendBubble(container, { role: "user", text });
      historyRef.current.push({ role: "user", text });
      setSending(true);

      try {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, history: historyRef.current.slice(-10) }),
        });
        const data = await res.json();
        const reply = data.reply || data.error || "Something went wrong.";
        appendBubble(container, { role: "ai", text: reply });
        historyRef.current.push({ role: "ai", text: reply });
      } catch (err) {
        appendBubble(container, { role: "ai", text: "Network error — please try again." });
      } finally {
        setSending(false);
      }
    };

    const onSendClick = () => send();
    const onKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        send();
      }
    };

    sendBtn.addEventListener("click", onSendClick);
    input.addEventListener("keydown", onKeyDown);
    return () => {
      sendBtn.removeEventListener("click", onSendClick);
      input.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef}>
      <LegacyScreen bodyHTML={BODY_HTML} bodyClassName={BODY_CLASS} styleCss={STYLE_CSS} />
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <Screen />
    </AuthGuard>
  );
}
