/**
 * Tactical Industrial HUD Portfolio - Core Engine
 * Thanaphat Inchuwong (นายธนภัทร อินทร์ชูวงศ์)
 * RMUTI Khon Kaen Campus // Electrical Industrial Education
 */

const DEFAULT_QUICK_CARDS = [
  {
    id: "qc_01",
    badge: "CORE SPEC",
    icon: "fa-bolt",
    title: "INDUSTRIAL AUTOMATION",
    metric: "PLC / VFD",
    metricLabel: "CONTROL SYSTEMS",
    description: "เชี่ยวชาญการออกแบบวงจร Relay Ladder, การโปรแกรม PLC และระบบขับเคลื่อนมอเตอร์ไฟฟ้า",
    buttonText: "สำรวจรายวิชา",
    buttonUrl: "courses.html",
    imageUrl: "",
    videoUrl: ""
  },
  {
    id: "qc_02",
    badge: "EXPERIENCE",
    icon: "fa-chalkboard-user",
    title: "VOCATIONAL PEDAGOGY",
    metric: "4-STEP",
    metricLabel: "TEACHING METHOD",
    description: "การสอนภาคปฏิบัติงานช่างไฟฟ้า เน้นความปลอดภัยตามมาตรฐาน EIT/IEC และเทคนิค Four-Step Method",
    buttonText: "ประวัติการศึกษา",
    buttonUrl: "education.html",
    imageUrl: "",
    videoUrl: ""
  },
  {
    id: "qc_03",
    badge: "PROJECT METRICS",
    icon: "fa-microchip",
    title: "FIELD & LAB WORKS",
    metric: "40+",
    metricLabel: "WORKS & CASES",
    description: "โครงงานติดตั้งระบบไฟฟ้า ตู้ควบคุม MDB และกิจกรรมจิตอาสาบริการวิชาชีพสู่ชุมชน",
    buttonText: "ชมผลงานและกิจกรรม",
    buttonUrl: "activities.html",
    imageUrl: "",
    videoUrl: ""
  }
];

class PortfolioApp {
  constructor() {
    this.storageKey = "thanaphat_portfolio_data_v1";
    this.authKey = "thanaphat_admin_session";
    this.data = this.loadData();
    this.audioCtx = null;
    this.isEditing = false;
    this.supabaseClient = null;

    this.init();
  }

  // Load from localStorage or fallback to default
  loadData() {
    const defaultQuickCards = (window.DEFAULT_PORTFOLIO_DATA && Array.isArray(window.DEFAULT_PORTFOLIO_DATA.quickCards) && window.DEFAULT_PORTFOLIO_DATA.quickCards.length > 0)
      ? window.DEFAULT_PORTFOLIO_DATA.quickCards
      : DEFAULT_QUICK_CARDS;

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = {
          ...window.DEFAULT_PORTFOLIO_DATA,
          ...parsed,
          profile: { ...(window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.profile), ...(parsed.profile || {}) },
          siteSettings: { ...(window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.siteSettings), ...(parsed.siteSettings || {}) },
          dashboard: {
            panel1: { ...(window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.dashboard && window.DEFAULT_PORTFOLIO_DATA.dashboard.panel1), ...((parsed.dashboard && parsed.dashboard.panel1) || {}) },
            panel2: { ...(window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.dashboard && window.DEFAULT_PORTFOLIO_DATA.dashboard.panel2), ...((parsed.dashboard && parsed.dashboard.panel2) || {}) },
            panel3: { ...(window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.dashboard && window.DEFAULT_PORTFOLIO_DATA.dashboard.panel3), ...((parsed.dashboard && parsed.dashboard.panel3) || {}) },
            panel4: { ...(window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.dashboard && window.DEFAULT_PORTFOLIO_DATA.dashboard.panel4), ...((parsed.dashboard && parsed.dashboard.panel4) || {}) }
          },
          courses: (Array.isArray(parsed.courses) && parsed.courses.length > 0)
            ? parsed.courses
            : (window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.courses ? window.DEFAULT_PORTFOLIO_DATA.courses : []),
          activities: (Array.isArray(parsed.activities) && parsed.activities.length > 0)
            ? parsed.activities
            : (window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.activities ? window.DEFAULT_PORTFOLIO_DATA.activities : []),
          skills: (Array.isArray(parsed.skills) && parsed.skills.length > 0)
            ? parsed.skills
            : (window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.skills ? window.DEFAULT_PORTFOLIO_DATA.skills : []),
          education: (Array.isArray(parsed.education) && parsed.education.length > 0)
            ? parsed.education
            : (window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.education ? window.DEFAULT_PORTFOLIO_DATA.education : []),
          quickCards: (Array.isArray(parsed.quickCards) && parsed.quickCards.length > 0)
            ? parsed.quickCards
            : JSON.parse(JSON.stringify(defaultQuickCards)),
          lastUpdated: parsed.lastUpdated || new Date().toISOString()
        };

        if (!merged.profile.heroTitle) {
          merged.profile.heroTitle = window.DEFAULT_PORTFOLIO_DATA?.profile?.heroTitle || "WELCOME TO PORTFOLIO";
        }
        if (!merged.profile.heroWhiteTitle) {
          merged.profile.heroWhiteTitle = window.DEFAULT_PORTFOLIO_DATA?.profile?.heroWhiteTitle || "THANAPHAT INCHUWONG";
        }
        return merged;
      }
    } catch (e) {
      console.warn("Could not parse saved portfolio data, using defaults:", e);
    }
    const fallback = JSON.parse(JSON.stringify(window.DEFAULT_PORTFOLIO_DATA || {}));
    if (!Array.isArray(fallback.quickCards) || fallback.quickCards.length === 0) {
      fallback.quickCards = JSON.parse(JSON.stringify(DEFAULT_QUICK_CARDS));
    }
    return fallback;
  }

  saveData() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      this.updateStatusTelemetry();

      // Realtime cross-tab broadcast bus
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({
            type: "DATA_SYNC",
            payload: this.data
          });
        } catch (err) {
          console.warn("BroadcastChannel error:", err);
        }
      }

      if (this.supabaseClient) {
        this.supabaseClient
          .from("portfolio_data")
          .upsert({ id: "main_data", payload: this.data, updated_at: new Date().toISOString() })
          .then(({ error }) => {
            if (!error) this.updateStatusTelemetry("SUPABASE: SYNCED");
          })
          .catch((e) => console.warn("Supabase auto-sync error:", e));
      }
    } catch (e) {
      console.error("Failed to save data locally:", e);
    }
  }

  setupRealtimeSync() {
    // 1. BroadcastChannel: zero-latency cross-tab/cross-page synchronization
    if ("BroadcastChannel" in window) {
      try {
        this.broadcastChannel = new BroadcastChannel("thanaphat_portfolio_bus");
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === "DATA_SYNC" && event.data.payload) {
            console.log("[Realtime Bus] Syncing fresh data from active tab");
            this.data = event.data.payload;
            this.renderAll();
            this.updateStatusTelemetry("REALTIME: LIVE_SYNC");
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel initialization warning:", err);
      }
    }

    // 2. Storage event listener (fires across tabs on localStorage change)
    window.addEventListener("storage", (e) => {
      if (e.key === this.storageKey && e.newValue) {
        try {
          const freshData = JSON.parse(e.newValue);
          console.log("[Storage Event] Realtime sync from storage update");
          this.data = freshData;
          this.renderAll();
          this.updateStatusTelemetry("STORAGE: LIVE_SYNC");
        } catch (err) {
          console.warn("Storage sync parse error:", err);
        }
      }
    });

    // 3. Tab visibility & focus sync
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.checkAndReloadLatestData();
      }
    });
    window.addEventListener("focus", () => {
      this.checkAndReloadLatestData();
    });

    // 4. Beforeunload flush
    window.addEventListener("beforeunload", () => {
      if (this.isEditing) {
        document.querySelectorAll("[data-cms-key]").forEach((el) => {
          this.saveCmsElement(el);
        });
      }
    });
  }

  checkAndReloadLatestData() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lastUpdated && parsed.lastUpdated !== this.data.lastUpdated) {
          console.log("[Focus Sync] Newer data found in storage, reloading");
          this.data = this.loadData();
          this.renderAll();
          this.updateStatusTelemetry("AUTO_RELOADED");
        }
      }
    } catch (e) {
      console.warn("Focus reload error:", e);
    }
  }

  init() {
    // Apply Palette (defaulting to warm coffee tone)
    const palette = this.data.siteSettings.palette || "coffee";
    this.applyPalette(palette);

    // Apply Dark / Light Theme
    this.applyTheme(this.data.siteSettings.theme || "dark");
    if (this.data.siteSettings.accentColor) {
      this.applyAccentColor(this.data.siteSettings.accentColor);
    }

    this.initAudioContext();
    this.setupEventListeners();
    this.setupSecretGreenTrigger();
    this.initProfilePaneOrdering();
    this.renderAll();
    this.startTimecodeTicker();
    this.renderSegmentedBars();
    this.renderCadBlueprint();
    this.setupRealtimeSync();
    this.initSupabase();

    if (sessionStorage.getItem(this.authKey) === "authenticated") {
      this.activateAdminMode();
    }
  }

  applyPalette(paletteName) {
    document.documentElement.setAttribute("data-palette", paletteName);
    this.data.siteSettings.palette = paletteName;
    if (paletteName === "coffee") {
      this.applyAccentColor("#C68642");
    } else if (paletteName === "brick") {
      this.applyAccentColor("#E05A2B");
    } else if (paletteName === "amber") {
      this.applyAccentColor("#FF9E1B");
    }
  }

  initAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      this.audioCtx = new AudioCtx();
    }
  }

  ensureAudio() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playTacticalBeep(freq = 880, type = "sine", duration = 0.08) {
    if (!this.data.siteSettings.soundEnabled || !this.audioCtx) return;
    try {
      this.ensureAudio();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio not permitted yet
    }
  }

  playSynthNote(freq, noteName = "") {
    this.ensureAudio();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 1.002, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.min(freq * 8, 3500), now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.2);
    filter.Q.value = 3;

    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.6);
    osc2.stop(now + 1.6);

    this.drawOscilloscopeWave(freq);
  }

  playChordRiff() {
    const notes = [
      { f: 82.41, d: 250 },
      { f: 98.00, d: 250 },
      { f: 110.00, d: 250 },
      { f: 123.47, d: 250 },
      { f: 146.83, d: 300 },
      { f: 164.81, d: 450 }
    ];

    let delay = 0;
    notes.forEach((item) => {
      setTimeout(() => {
        this.playSynthNote(item.f);
      }, delay);
      delay += item.d;
    });
  }

  drawOscilloscopeWave(freq) {
    const canvas = document.getElementById("oscilloscopeCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = (canvas.width = canvas.offsetWidth || 300);
    const height = (canvas.height = canvas.offsetHeight || 80);

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(198, 134, 66, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    for (let x = 0; x < width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    ctx.strokeStyle = this.data.siteSettings.accentColor || "#C68642";
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.beginPath();

    const cycles = Math.max(2, Math.round(freq / 25));
    for (let x = 0; x < width; x++) {
      const angle = (x / width) * Math.PI * 2 * cycles;
      const decay = Math.exp(-x / (width * 0.7));
      const y = height / 2 + Math.sin(angle) * (height * 0.35) * decay;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  startTimecodeTicker() {
    const el = document.getElementById("telemetryTimecode");
    const footerClock = document.getElementById("footerClock");
    let frames = 18;
    let seconds = 24;
    let minutes = 1;
    let hours = 0;

    setInterval(() => {
      frames++;
      if (frames >= 24) {
        frames = 0;
        seconds++;
        if (seconds >= 60) {
          seconds = 0;
          minutes++;
          if (minutes >= 60) {
            minutes = 0;
            hours++;
          }
        }
      }
      const pad = (n) => String(n).padStart(2, "0");
      const tc = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
      if (el) el.textContent = tc;
      if (footerClock) footerClock.textContent = tc;
      document.querySelectorAll(".timecode-val").forEach(item => {
        item.textContent = tc;
      });
    }, 1000 / 24);
  }

  renderSegmentedBars() {
    const container = document.getElementById("telemetrySegmentedBars");
    if (!container) return;
    container.innerHTML = "";
    const totalBars = 32;
    const centerIdx = Math.floor(totalBars / 2);

    for (let i = 0; i < totalBars; i++) {
      const bar = document.createElement("div");
      bar.className = "seg-bar";
      if (i === centerIdx) {
        bar.classList.add("center-indicator", "active");
      } else if (i >= centerIdx - 6 && i <= centerIdx + 6) {
        bar.classList.add("active");
      }
      container.appendChild(bar);
    }

    setInterval(() => {
      const bars = container.querySelectorAll(".seg-bar");
      const activeRadius = Math.floor(Math.random() * 5) + 4;
      bars.forEach((b, idx) => {
        if (idx === centerIdx) return;
        if (Math.abs(idx - centerIdx) <= activeRadius) {
          b.classList.add("active");
        } else {
          b.classList.remove("active");
        }
      });
    }, 1200);
  }

  renderCadBlueprint() {
    const canvas = document.getElementById("cadBlueprintCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = canvas.offsetWidth || 300);
    const h = (canvas.height = canvas.offsetHeight || 180);

    ctx.fillStyle = "#0a0806";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(198, 134, 66, 0.2)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < w; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#e0a96d";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(w * 0.5, 10);
    ctx.lineTo(w * 0.5, 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w * 0.5, 50, 10, 0, Math.PI * 2);
    ctx.arc(w * 0.5, 65, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w * 0.5, 75);
    ctx.lineTo(w * 0.5, 95);
    ctx.stroke();

    ctx.strokeStyle = "#c68642";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, 95);
    ctx.lineTo(w * 0.85, 95);
    ctx.stroke();

    const feeders = [0.25, 0.5, 0.75];
    ctx.strokeStyle = "#b0a194";
    ctx.lineWidth = 1;

    feeders.forEach((pos, idx) => {
      const x = w * pos;
      ctx.beginPath();
      ctx.moveTo(x, 95);
      ctx.lineTo(x, 120);
      ctx.rect(x - 5, 120, 10, 15);
      ctx.moveTo(x, 135);
      ctx.lineTo(x, 150);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, 160, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#e0a96d";
      ctx.font = "8px JetBrains Mono";
      ctx.textAlign = "center";
      ctx.fillText(idx === 1 ? "M2 (PLC)" : `M${idx + 1}`, x, 163);
    });
  }

  toggleAccordion(headerEl) {
    const item = headerEl.closest(".spec-item");
    if (!item) return;
    const isOpen = item.classList.contains("open");
    const parent = item.parentElement;
    parent.querySelectorAll(".spec-item").forEach((it) => it.classList.remove("open"));
    if (!isOpen) {
      item.classList.add("open");
      this.playTacticalBeep(640, "triangle", 0.05);
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.data.siteSettings.theme = theme;
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    this.applyTheme(next);
    this.saveData();
    this.playTacticalBeep(1000, "sine", 0.06);
  }

  applyAccentColor(hex) {
    document.documentElement.style.setProperty("--accent-primary", hex);
    this.data.siteSettings.accentColor = hex;
  }

  renderAll() {
    this.renderProfile();
    this.renderQuickCards();
    this.renderDashboardGrid();
    this.renderSkills();
    this.renderEducation();
    this.renderCourses(this.currentCourseFilter || "all");
    this.renderActivities(this.currentActivityFilter || "all");
    this.applyProfilePaneOrder();
  }

  renderProfile() {
    const p = this.data.profile;

    if (p.birthDateIso) {
      const birth = new Date(p.birthDateIso);
      const diff = Date.now() - birth.getTime();
      const ageDate = new Date(diff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      const ageEl = document.getElementById("profileAgeDisplay");
      if (ageEl) ageEl.textContent = `${age} ปี`;
    }

    document.querySelectorAll("[data-cms-key]").forEach((el) => {
      const keyPath = el.getAttribute("data-cms-key").split(".");
      let val = this.data;
      for (const k of keyPath) {
        val = val ? val[k] : "";
      }
      if (val !== undefined && val !== null) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.value = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // Default to the uploaded portrait image
    const avatarSrc = p.avatarUrl || "assets/profile.jpg";
    const heroImg = document.getElementById("heroPortraitImg");
    const heroPlaceholder = document.getElementById("heroPortraitPlaceholder");
    const cardImg = document.getElementById("profileCardAvatar");
    const cardPlaceholder = document.getElementById("profileCardPlaceholder");

    if (heroImg) {
      heroImg.src = avatarSrc;
      heroImg.classList.add("active");
      if (heroPlaceholder) heroPlaceholder.style.display = "none";
    }
    if (cardImg) {
      cardImg.src = avatarSrc;
      cardImg.style.display = "block";
      if (cardPlaceholder) cardPlaceholder.style.display = "none";
    }
  }
  renderSkills() {
    const container = document.getElementById("skillsContainer");
    if (!container) return;
    container.innerHTML = "";

    (this.data.skills || []).forEach((cat) => {
      const box = document.createElement("div");
      box.style.marginBottom = "0.75rem";
      box.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-amber); font-weight: 700; margin-bottom: 6px;">
          // ${cat.category}
        </div>
        ${cat.items
          .map(
            (s) => `
          <div style="margin-bottom: 6px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 2px;">
              <span>${s.name}</span>
              <span style="font-family: var(--font-mono); color: var(--accent-primary);">${s.level}%</span>
            </div>
            <div style="height: 4px; background: var(--border-hairline); overflow: hidden;">
              <div style="width: ${s.level}%; height: 100%; background: var(--accent-primary);"></div>
            </div>
          </div>
        `
          )
          .join("")}
      `;
      container.appendChild(box);
    });
  }

  renderEducation() {
    const container = document.getElementById("educationTimelineTrack");
    if (!container) return;
    container.innerHTML = "";

    (this.data.education || []).forEach((edu, idx) => {
      const isCurrent = idx === 0;
      const node = document.createElement("div");
      node.className = `timeline-node ${isCurrent ? "current" : ""}`;
      node.innerHTML = `
        <div class="timeline-card hud-reticle">
          <div class="hud-reticle-tr"></div>
          <div class="hud-reticle-bl"></div>

          <div class="timeline-header">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-primary); font-weight: 700;">
                  [ ${edu.year} ]
                </span>
                <span style="font-family: var(--font-mono); font-size: 0.68rem; background: var(--accent-dim); padding: 2px 6px; border: 1px solid var(--border-hairline);">
                  ${edu.badge || "DEGREE"}
                </span>
              </div>
              <h3 class="edu-level">${edu.level}</h3>
              <div class="edu-inst"><i class="fa-solid fa-landmark"></i> ${edu.institution}</div>
              ${edu.department ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">${edu.department} ${edu.faculty ? `• ${edu.faculty}` : ""}</div>` : ""}
            </div>
            <div class="edu-gpa-badge">
              <span style="font-size: 0.65rem; display: block; color: var(--text-muted); text-align: center;">GPAX</span>
              <span>${edu.gpa}</span>
            </div>
          </div>

          <div class="edu-desc">${edu.description || ""}</div>
          ${edu.honors ? `
            <div style="margin-top: 8px; font-family: var(--font-mono); font-size: 0.78rem; color: var(--accent-amber);">
              <i class="fa-solid fa-award"></i> ${edu.honors}
            </div>` : ""
          }
        </div>
      `;
      container.appendChild(node);
    });
  }

  // --- Tactical Quick Cards Manager (Hazard Zone) ---
  renderQuickCards() {
    const container = document.getElementById("quickCardsContainer");
    const fallback = document.getElementById("hazardStripesFallback");
    if (!container) return;

    if (!Array.isArray(this.data.quickCards) || this.data.quickCards.length === 0) {
      const defaultCards = (window.DEFAULT_PORTFOLIO_DATA && Array.isArray(window.DEFAULT_PORTFOLIO_DATA.quickCards) && window.DEFAULT_PORTFOLIO_DATA.quickCards.length > 0)
        ? window.DEFAULT_PORTFOLIO_DATA.quickCards
        : DEFAULT_QUICK_CARDS;
      this.data.quickCards = JSON.parse(JSON.stringify(defaultCards));
      this.saveData();
    }

    const cards = this.data.quickCards;
    const isAdmin = document.body.classList.contains("admin-mode");

    if (cards.length === 0 && !isAdmin) {
      container.style.display = "none";
      if (fallback) fallback.style.display = "block";
      return;
    }

    container.style.display = "grid";
    if (fallback) fallback.style.display = "none";

    let html = "";
    cards.forEach((card, idx) => {
      const id = card.id || `qc_${idx}`;
      const badge = card.badge ? this.escapeHtml(card.badge) : "SPEC";
      const icon = card.icon || "fa-bolt";
      const title = card.title ? this.escapeHtml(card.title) : "";
      const metric = card.metric ? this.escapeHtml(card.metric) : "";
      const metricLabel = card.metricLabel ? this.escapeHtml(card.metricLabel) : "";
      const desc = card.description ? this.escapeHtml(card.description) : "";
      const btnText = card.buttonText ? this.escapeHtml(card.buttonText) : "";
      const btnUrl = card.buttonUrl || "";
      const imageUrl = card.imageUrl || "";

      html += `
        <div class="quick-card hud-reticle" id="card_${id}">
          <div class="quick-card-header">
            <div class="quick-card-badge-row">
              <span class="quick-card-badge">[${badge}]</span>
              ${title ? `<h4 class="quick-card-title">${title}</h4>` : ""}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid ${icon} quick-card-icon"></i>
              <div class="quick-card-admin-bar">
                <button type="button" class="btn-card-ctrl" onclick="window.app.moveQuickCard(${idx}, -1)" title="เลื่อนซ้าย" ${idx === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
                <button type="button" class="btn-card-ctrl" onclick="window.app.moveQuickCard(${idx}, 1)" title="เลื่อนขวา" ${idx === cards.length - 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
                  <i class="fa-solid fa-chevron-right"></i>
                </button>
                <button type="button" class="btn-card-ctrl" onclick="window.app.openQuickCardModal('${id}')" title="แก้ไขการ์ดนี้">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="btn-card-ctrl btn-danger" onclick="window.app.deleteQuickCard('${id}')" title="ลบการ์ดนี้">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          ${(metric || metricLabel) ? `
            <div class="quick-card-metric-box">
              ${metric ? `<div class="quick-card-metric-val">${metric}</div>` : ""}
              ${metricLabel ? `<div class="quick-card-metric-lbl">${metricLabel}</div>` : ""}
            </div>
          ` : ""}

          ${imageUrl ? `
            <div class="quick-card-media-preview" onclick="window.app.openMediaModal('<img src=&quot;${imageUrl}&quot; style=&quot;max-width:90vw;max-height:85vh;object-fit:contain;&quot;>')" title="คลิกเพื่อดูภาพขยาย">
              <img src="${imageUrl}" alt="${title}" class="quick-card-media-img">
            </div>
          ` : ""}

          ${desc ? `<p class="quick-card-desc">${desc}</p>` : ""}

          ${(btnText && btnUrl) ? `
            <div class="quick-card-footer">
              <a href="${btnUrl}" class="quick-card-action-btn">
                <span>${btnText}</span>
                <i class="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          ` : ""}
        </div>
      `;
    });

    if (isAdmin) {
      html += `
        <button type="button" class="btn-add-quick-card hud-reticle" onclick="window.app.openQuickCardModal()" title="เพิ่มการ์ดใหม่ในแถบนี้">
          <i class="fa-solid fa-plus" style="font-size: 1.5rem;"></i>
          <span>+ เพิ่มการ์ดใหม่</span>
        </button>
      `;
    }

    container.innerHTML = html;
  }

  openQuickCardModal(cardId = null) {
    if (!this.checkAdminOrPrompt("จัดการการ์ด")) return;
    const modal = document.getElementById("cmsStudioModal");
    const title = document.getElementById("cmsModalTitle");
    const body = document.getElementById("cmsModalBody");
    if (!modal || !body) return;

    if (!Array.isArray(this.data.quickCards) || this.data.quickCards.length === 0) {
      const defaultCards = (window.DEFAULT_PORTFOLIO_DATA && Array.isArray(window.DEFAULT_PORTFOLIO_DATA.quickCards) && window.DEFAULT_PORTFOLIO_DATA.quickCards.length > 0)
        ? window.DEFAULT_PORTFOLIO_DATA.quickCards
        : DEFAULT_QUICK_CARDS;
      this.data.quickCards = JSON.parse(JSON.stringify(defaultCards));
    }

    const card = cardId ? (this.data.quickCards.find(c => c.id === cardId) || {}) : {};
    const isEdit = Boolean(card && card.id);

    title.innerHTML = `<i class="fa-solid fa-id-card"></i> ${isEdit ? "แก้ไขการ์ดอเนกประสงค์" : "เพิ่มการ์ดใหม่ (QUICK CARD)"}`;
    body.innerHTML = `
      <form id="quickCardForm" onsubmit="event.preventDefault(); window.app.saveQuickCard('${card.id || ''}');" style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">ป้ายกำกับ (Badge Code)</label>
            <input type="text" id="qcInputBadge" class="tactical-input" value="${this.escapeHtml(card.badge || 'CORE SPEC')}" placeholder="เช่น CORE SPEC, HIGHLIGHT" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">ไอคอน (FontAwesome Class)</label>
            <div style="display: flex; gap: 6px;">
              <select class="tactical-input" style="width: 60%;" onchange="document.getElementById('qcInputIcon').value = this.value;">
                <option value="fa-bolt" ${(!card.icon || card.icon === 'fa-bolt') ? 'selected' : ''}>⚡ fa-bolt (ไฟฟ้า/พลังงาน)</option>
                <option value="fa-microchip" ${card.icon === 'fa-microchip' ? 'selected' : ''}>🔲 fa-microchip (ชิป/บอร์ด)</option>
                <option value="fa-gear" ${card.icon === 'fa-gear' ? 'selected' : ''}>⚙️ fa-gear (ระบบกลไก)</option>
                <option value="fa-chalkboard-user" ${card.icon === 'fa-chalkboard-user' ? 'selected' : ''}>👨‍🏫 fa-chalkboard-user (การสอน)</option>
                <option value="fa-graduation-cap" ${card.icon === 'fa-graduation-cap' ? 'selected' : ''}>🎓 fa-graduation-cap (การศึกษา)</option>
                <option value="fa-chart-line" ${card.icon === 'fa-chart-line' ? 'selected' : ''}>📈 fa-chart-line (สถิติ/ผลงาน)</option>
                <option value="fa-laptop-code" ${card.icon === 'fa-laptop-code' ? 'selected' : ''}>💻 fa-laptop-code (โปรแกรม)</option>
                <option value="fa-shield-halved" ${card.icon === 'fa-shield-halved' ? 'selected' : ''}>🛡️ fa-shield-halved (ความปลอดภัย)</option>
                <option value="fa-award" ${card.icon === 'fa-award' ? 'selected' : ''}>🏆 fa-award (รางวัล)</option>
              </select>
              <input type="text" id="qcInputIcon" class="tactical-input" value="${this.escapeHtml(card.icon || 'fa-bolt')}" placeholder="เช่น fa-bolt" style="width: 40%;">
            </div>
          </div>
        </div>

        <div>
          <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">หัวข้อการ์ด (Card Title)</label>
          <input type="text" id="qcInputTitle" class="tactical-input" value="${this.escapeHtml(card.title || '')}" placeholder="เช่น INDUSTRIAL AUTOMATION" style="width: 100%;" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">ตัวเลข/คำย่อสถิติ (Stat Metric)</label>
            <input type="text" id="qcInputMetric" class="tactical-input" value="${this.escapeHtml(card.metric || '')}" placeholder="เช่น PLC / VFD, 40+, 3.78" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">คำอธิบายสถิติ (Metric Label)</label>
            <input type="text" id="qcInputMetricLabel" class="tactical-input" value="${this.escapeHtml(card.metricLabel || '')}" placeholder="เช่น CONTROL SYSTEMS, WORKS" style="width: 100%;">
          </div>
        </div>

        <div>
          <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">รายละเอียดเนื้อหา (Description)</label>
          <textarea id="qcInputDesc" class="tactical-input" rows="3" placeholder="ระบุข้อความอธิบายความสามารถ หรือข้อมูลสำคัญ..." style="width: 100%;">${this.escapeHtml(card.description || '')}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">ข้อความบนปุ่มกด (Button Text)</label>
            <input type="text" id="qcInputBtnText" class="tactical-input" value="${this.escapeHtml(card.buttonText || '')}" placeholder="เช่น สำรวจรายวิชา (เว้นว่างได้)" style="width: 100%;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">ลิงก์ปลายทาง (Button URL)</label>
            <input type="text" id="qcInputBtnUrl" class="tactical-input" value="${this.escapeHtml(card.buttonUrl || '')}" placeholder="เช่น courses.html, activities.html" style="width: 100%;">
          </div>
        </div>

        <div>
          <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 4px;">รูปภาพประกอบ (Image URL / Upload)</label>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="qcInputImageUrl" class="tactical-input" value="${this.escapeHtml(card.imageUrl || '')}" placeholder="ใส่ URL รูปภาพ หรือกดปุ่มเลือกไฟล์ด้านขวา" style="flex: 1;">
            <label class="btn-dock" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; margin: 0;">
              <i class="fa-solid fa-folder-open"></i> เลือกรูป
              <input type="file" accept="image/*" style="display: none;" onchange="window.app.handleQuickCardImageUpload(event)">
            </label>
          </div>
          <img id="qcImagePreview" src="${card.imageUrl || ''}" style="max-height: 120px; border: 1px solid var(--border-hairline); margin-top: 8px; object-fit: cover; border-radius: 3px; display: ${card.imageUrl ? 'block' : 'none'};">
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; border-top: 1px solid var(--border-hairline); padding-top: 14px;">
          <button type="button" class="btn-tactical btn-tactical-ghost" onclick="window.app.closeCMSModal()">ยกเลิก</button>
          <button type="submit" class="btn-tactical"><i class="fa-solid fa-floppy-disk"></i> บันทึกข้อมูลการ์ด</button>
        </div>
      </form>
    `;

    modal.classList.add("open");
  }

  handleQuickCardImageUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const input = document.getElementById("qcInputImageUrl");
      const preview = document.getElementById("qcImagePreview");
      if (input) input.value = evt.target.result;
      if (preview) {
        preview.src = evt.target.result;
        preview.style.display = "block";
      }
    };
    reader.readAsDataURL(file);
  }

  saveQuickCard(cardId) {
    if (!this.checkAdminOrPrompt("บันทึกการ์ด")) return;
    const badge = (document.getElementById("qcInputBadge").value || "").trim() || "SPEC";
    const icon = (document.getElementById("qcInputIcon").value || "").trim() || "fa-bolt";
    const title = (document.getElementById("qcInputTitle").value || "").trim();
    const metric = (document.getElementById("qcInputMetric").value || "").trim();
    const metricLabel = (document.getElementById("qcInputMetricLabel").value || "").trim();
    const description = (document.getElementById("qcInputDesc").value || "").trim();
    const buttonText = (document.getElementById("qcInputBtnText").value || "").trim();
    const buttonUrl = (document.getElementById("qcInputBtnUrl").value || "").trim();
    const imageUrl = (document.getElementById("qcInputImageUrl").value || "").trim();

    if (!title && !metric && !description) {
      alert("กรุณากรอกหัวข้อ หรือสถิติ หรือรายละเอียดอย่างน้อยหนึ่งอย่าง");
      return;
    }

    if (!Array.isArray(this.data.quickCards)) {
      this.data.quickCards = [];
    }

    if (cardId) {
      const idx = this.data.quickCards.findIndex(c => c.id === cardId);
      if (idx !== -1) {
        this.data.quickCards[idx] = {
          ...this.data.quickCards[idx],
          badge,
          icon,
          title,
          metric,
          metricLabel,
          description,
          buttonText,
          buttonUrl,
          imageUrl
        };
      }
    } else {
      const newCard = {
        id: "qc_" + Date.now(),
        badge,
        icon,
        title,
        metric,
        metricLabel,
        description,
        buttonText,
        buttonUrl,
        imageUrl
      };
      this.data.quickCards.push(newCard);
    }

    this.saveData();
    this.renderQuickCards();
    this.closeCMSModal();
    this.playTacticalBeep(880, "sine", 0.15);
  }

  deleteQuickCard(cardId) {
    if (!this.checkAdminOrPrompt("ลบการ์ด")) return;
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบการ์ดใบนี้?")) return;

    if (!Array.isArray(this.data.quickCards)) return;
    this.data.quickCards = this.data.quickCards.filter(c => c.id !== cardId);

    this.saveData();
    this.renderQuickCards();
    this.playTacticalBeep(320, "sawtooth", 0.15);
  }

  moveQuickCard(index, direction) {
    if (!this.checkAdminOrPrompt("จัดเรียงการ์ด")) return;
    if (!Array.isArray(this.data.quickCards)) return;
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= this.data.quickCards.length) return;

    const temp = this.data.quickCards[index];
    this.data.quickCards[index] = this.data.quickCards[targetIdx];
    this.data.quickCards[targetIdx] = temp;

    this.saveData();
    this.renderQuickCards();
    this.playTacticalBeep(640, "triangle", 0.08);
  }

  resetDefaultQuickCards() {
    if (!this.checkAdminOrPrompt("รีเซ็ตการ์ดเริ่มต้น")) return;
    if (confirm("ยืนยันการคืนค่าการ์ดเริ่มต้นทั้งหมด (3 ใบมาตรฐาน)?\n(การ์ดที่เพิ่มหรือแก้ไขไว้จะถูกแทนที่ด้วยชุดมาตรฐาน)")) {
      const defaultCards = (window.DEFAULT_PORTFOLIO_DATA && Array.isArray(window.DEFAULT_PORTFOLIO_DATA.quickCards) && window.DEFAULT_PORTFOLIO_DATA.quickCards.length > 0)
        ? window.DEFAULT_PORTFOLIO_DATA.quickCards
        : DEFAULT_QUICK_CARDS;
      this.data.quickCards = JSON.parse(JSON.stringify(defaultCards));
      this.saveData();
      this.renderQuickCards();
      this.playTacticalBeep(920, "triangle", 0.12);
      alert("คืนค่าการ์ดเริ่มต้น 3 ใบมาตรฐานเรียบร้อยแล้ว!");
    }
  }

  // --- Modular 4-Panel Dashboard Grid & CMS Manager ---
  renderDashboardGrid() {
    const grid = document.getElementById("modularDashboardGrid");
    if (!grid) return;

    const d = this.data.dashboard || window.DEFAULT_PORTFOLIO_DATA.dashboard;
    const p1 = d.panel1 || window.DEFAULT_PORTFOLIO_DATA.dashboard.panel1;
    const p2 = d.panel2 || window.DEFAULT_PORTFOLIO_DATA.dashboard.panel2;
    const p3 = d.panel3 || window.DEFAULT_PORTFOLIO_DATA.dashboard.panel3;
    const p4 = d.panel4 || window.DEFAULT_PORTFOLIO_DATA.dashboard.panel4;

    grid.innerHTML = `
      <!-- Panel 1: System Highlights (Accordion) -->
      <div class="dash-panel hud-reticle" id="dashPanel1">
        <div class="panel-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="panel-title">${this.escapeHtml(p1.title || "SYSTEM HIGHLIGHTS")}</div>
            <button type="button" class="btn-dock admin-only panel-edit-btn" onclick="window.app.editDashboardPanel(1)" title="แก้ไขข้อมูล SPEC_01">
              <i class="fa-solid fa-pen"></i> แก้ไข
            </button>
          </div>
          <div class="panel-code">${this.escapeHtml(p1.code || "[SPEC_01]")}</div>
        </div>
        <div class="specs-accordion" id="systemHighlightsAccordion">
          ${(p1.specs || []).map((spec, idx) => `
            <div class="spec-item ${idx === 0 ? 'open' : ''}">
              <div class="spec-header" onclick="window.app.toggleAccordion(this)">
                <span>${this.escapeHtml(spec.title)}</span>
                <span class="toggle-icon">${idx === 0 ? '-' : '+'}</span>
              </div>
              <div class="spec-content">
                ${this.escapeHtml(spec.content)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Panel 2: In The Field (Video / Media Preview) -->
      <div class="dash-panel hud-reticle" id="dashPanel2">
        <div class="panel-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="panel-title">${this.escapeHtml(p2.title || "IN THE FIELD")}</div>
            <button type="button" class="btn-dock admin-only panel-edit-btn" onclick="window.app.editDashboardPanel(2)" title="แก้ไขข้อมูล FEED_02">
              <i class="fa-solid fa-pen"></i> แก้ไข
            </button>
          </div>
          <div class="panel-code">${this.escapeHtml(p2.code || "[FEED_02]")}</div>
        </div>
        <div class="field-media-frame" id="fieldMediaPreviewBox">
          <img src="${p2.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'}" alt="${this.escapeHtml(p2.captionTag || 'IN THE FIELD')}" class="field-media-img" id="fieldMediaImg">
          <button class="play-overlay-btn" id="playFieldMediaBtn" onclick="window.app.playFieldVideo()" title="ชมวิดีโอสาธิตการปฏิบัติงาน">
            <i class="fa-solid fa-play"></i>
          </button>
        </div>
        <div class="field-caption">
          <strong>${this.escapeHtml(p2.captionTag || "LAB WORKSHOP:")}</strong> ${this.escapeHtml(p2.captionText || "")}
        </div>
      </div>

      <!-- Panel 3: Field Notes (Logs & Case Studies) -->
      <div class="dash-panel hud-reticle" id="dashPanel3">
        <div class="panel-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="panel-title">${this.escapeHtml(p3.title || "FIELD NOTES")}</div>
            <button type="button" class="btn-dock admin-only panel-edit-btn" onclick="window.app.editDashboardPanel(3)" title="แก้ไขข้อมูล LOGS_03">
              <i class="fa-solid fa-pen"></i> แก้ไข
            </button>
          </div>
          <div class="panel-code">${this.escapeHtml(p3.code || "[LOGS_03]")}</div>
        </div>
        <div class="field-notes-list">
          ${(p3.notes || []).map((note) => `
            <div class="note-entry">
              <div class="note-text">${this.escapeHtml(note.text)}</div>
              <div class="note-meta">
                <span>${this.escapeHtml(note.index || "INDEX 01:00")}</span>
                <a href="${note.link || '#'}" style="color: var(--accent-amber); text-decoration: none;" class="note-arrow">&gt;</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Panel 4: System Overview (CAD / Blueprint Wireframe) -->
      <div class="dash-panel hud-reticle" id="dashPanel4">
        <div class="panel-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="panel-title">${this.escapeHtml(p4.title || "SYSTEM OVERVIEW")}</div>
            <button type="button" class="btn-dock admin-only panel-edit-btn" onclick="window.app.editDashboardPanel(4)" title="แก้ไขข้อมูล CAD_04">
              <i class="fa-solid fa-pen"></i> แก้ไข
            </button>
          </div>
          <div class="panel-code">${this.escapeHtml(p4.code || "[CAD_04]")}</div>
        </div>
        <div class="cad-blueprint-frame">
          ${p4.mode === 'image' && p4.imageUrl ? `
            <img src="${p4.imageUrl}" alt="CAD Schematic Diagram" class="cad-custom-img" onclick="window.app.openMediaModal('<img src=&quot;${p4.imageUrl}&quot; style=&quot;max-width:90vw;max-height:85vh;object-fit:contain;&quot;>')" style="cursor: pointer; width: 100%; height: 100%; object-fit: contain;" title="คลิกเพื่อดูภาพวงจรขนาดใหญ่">
          ` : `
            <canvas id="cadBlueprintCanvas" class="blueprint-canvas"></canvas>
          `}
        </div>
        <div class="cad-badge">
          <span>${this.escapeHtml(p4.badgeLeft || "SLD: 400V/230V 50Hz")}</span>
          <span>${this.escapeHtml(p4.badgeRight || "DWG: SCHEMATIC_REV2")}</span>
        </div>
      </div>
    `;

    if (!p4.mode || p4.mode === 'canvas' || !p4.imageUrl) {
      setTimeout(() => this.renderCadBlueprint(), 40);
    }
  }

  playFieldVideo() {
    const d = this.data.dashboard || window.DEFAULT_PORTFOLIO_DATA.dashboard;
    const p2 = (d && d.panel2) || {};
    const videoUrl = p2.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    this.openYouTubeModal(videoUrl, p2.captionTag ? `${p2.captionTag} ${p2.captionText || ''}` : "วิดีโอสาธิตการปฏิบัติงาน");
  }

  openDashboardManagerModal() {
    if (!this.checkAdminOrPrompt("จัดการ Dashboard")) return;
    const modal = document.getElementById("cmsStudioModal");
    const title = document.getElementById("cmsModalTitle");
    const body = document.getElementById("cmsModalBody");
    if (!modal || !body) return;

    title.innerHTML = `<i class="fa-solid fa-table-columns"></i> จัดการ MODULAR 4-PANEL DASHBOARD`;
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
          เลือก Panel ที่ต้องการแก้ไขเนื้อหา รูปภาพ วิดีโอ หรือแบบแปลน CAD:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
          <button class="btn-quick-upload" style="padding: 12px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;" onclick="window.app.editDashboardPanel(1)">
            <span style="font-family: var(--font-mono); color: var(--accent-amber); font-weight: 700;">[SPEC_01]</span>
            <span style="font-weight: 700; font-size: 0.9rem;">1. SYSTEM HIGHLIGHTS</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">แก้ไขหัวข้อ และรายละเอียด Accordion สเปกวิศวกรรม</span>
          </button>

          <button class="btn-quick-upload" style="padding: 12px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;" onclick="window.app.editDashboardPanel(2)">
            <span style="font-family: var(--font-mono); color: #64b5f6; font-weight: 700;">[FEED_02]</span>
            <span style="font-weight: 700; font-size: 0.9rem;">2. IN THE FIELD</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">เปลี่ยนภาพหน้างาน ลิงก์วิดีโอ YouTube และคำอธิบาย</span>
          </button>

          <button class="btn-quick-upload" style="padding: 12px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;" onclick="window.app.editDashboardPanel(3)">
            <span style="font-family: var(--font-mono); color: #81c784; font-weight: 700;">[LOGS_03]</span>
            <span style="font-weight: 700; font-size: 0.9rem;">3. FIELD NOTES</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">แก้ไขบันทึกเหตุการณ์ รหัส INDEX และลิงก์ปลายทาง</span>
          </button>

          <button class="btn-quick-upload" style="padding: 12px; display: flex; flex-direction: column; align-items: flex-start; gap: 4px;" onclick="window.app.editDashboardPanel(4)">
            <span style="font-family: var(--font-mono); color: #ffb74d; font-weight: 700;">[CAD_04]</span>
            <span style="font-weight: 700; font-size: 0.9rem;">4. SYSTEM OVERVIEW</span>
            <span style="font-size: 0.75rem; color: var(--text-muted);">เลือก Blueprint Canvas หรืออัปโหลดภาพแบบแปลน CAD</span>
          </button>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
          <button class="btn-tactical btn-tactical-ghost" onclick="window.app.closeCMSModal()">ปิดหน้าต่าง</button>
        </div>
      </div>
    `;
    modal.classList.add("open");
  }

  editDashboardPanel(num) {
    if (!this.checkAdminOrPrompt(`แก้ไข Dashboard Panel ${num}`)) return;
    const modal = document.getElementById("cmsStudioModal");
    const title = document.getElementById("cmsModalTitle");
    const body = document.getElementById("cmsModalBody");
    if (!modal || !body) return;

    if (!this.data.dashboard) {
      this.data.dashboard = JSON.parse(JSON.stringify(window.DEFAULT_PORTFOLIO_DATA.dashboard));
    }
    const d = this.data.dashboard;

    if (num === 1) {
      const p1 = d.panel1 || window.DEFAULT_PORTFOLIO_DATA.dashboard.panel1;
      this.currentEditingSpecs = JSON.parse(JSON.stringify(p1.specs || []));

      title.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไข PANEL 1: SYSTEM HIGHLIGHTS [SPEC_01]`;
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
            <div class="form-group">
              <label class="form-label">PANEL TITLE</label>
              <input type="text" id="p1TitleInput" class="form-control" value="${this.escapeHtml(p1.title || 'SYSTEM HIGHLIGHTS')}">
            </div>
            <div class="form-group">
              <label class="form-label">SECTION CODE</label>
              <input type="text" id="p1CodeInput" class="form-control" value="${this.escapeHtml(p1.code || '[SPEC_01]')}">
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-hairline); padding-bottom: 6px;">
            <label class="form-label" style="margin: 0; color: var(--accent-amber);"><i class="fa-solid fa-list-check"></i> รายการสเปกและทักษะย่อย (Accordion Specs)</label>
            <button type="button" class="btn-att-add" onclick="window.app.addSpecItemToPanel1Editor()">
              <i class="fa-solid fa-plus"></i> เพิ่มหัวข้อย่อย
            </button>
          </div>

          <div id="p1SpecsEditorContainer" style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
          </div>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button class="btn-tactical btn-tactical-primary" onclick="window.app.saveDashboardPanel(1)">
              <i class="fa-solid fa-check"></i> บันทึก Panel 1
            </button>
            <button class="btn-tactical btn-tactical-ghost" onclick="window.app.closeCMSModal()">
              ยกเลิก
            </button>
          </div>
        </div>
      `;
      this.renderPanel1SpecsEditor();
      modal.classList.add("open");
    } else if (num === 2) {
      const p2 = d.panel2 || window.DEFAULT_PORTFOLIO_DATA.dashboard.panel2;
      title.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไข PANEL 2: IN THE FIELD [FEED_02]`;
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
            <div class="form-group">
              <label class="form-label">PANEL TITLE</label>
              <input type="text" id="p2TitleInput" class="form-control" value="${this.escapeHtml(p2.title || 'IN THE FIELD')}">
            </div>
            <div class="form-group">
              <label class="form-label">SECTION CODE</label>
              <input type="text" id="p2CodeInput" class="form-control" value="${this.escapeHtml(p2.code || '[FEED_02]')}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">รูปภาพหน้างาน (COVER IMAGE)</label>
            <div style="display: flex; gap: 6px;">
              <input type="text" id="p2ImageUrlInput" class="form-control" value="${this.escapeHtml(p2.imageUrl || '')}" placeholder="URL รูปภาพ หรือกดเลือกไฟล์">
              <button type="button" class="btn-att-add" style="white-space: nowrap;" onclick="document.getElementById('p2FileUploader').click()">
                <i class="fa-solid fa-folder-open"></i> เลือกรูปจากเครื่อง
              </button>
              <input type="file" id="p2FileUploader" accept="image/*" style="display: none;" onchange="window.app.handlePanel2ImageUpload(this.files[0])">
            </div>
            <div id="p2ImagePreviewBox" style="margin-top: 6px;">
              ${p2.imageUrl ? `<img src="${p2.imageUrl}" style="max-height: 90px; border: 1px solid var(--border-hairline); border-radius: 4px;">` : ''}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">ลิงก์วิดีโอ YouTube (YOUTUBE VIDEO LINK)</label>
            <input type="text" id="p2VideoUrlInput" class="form-control" value="${this.escapeHtml(p2.videoUrl || '')}" placeholder="เช่น https://www.youtube.com/watch?v=... หรือ https://youtu.be/...">
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px;">
              เมื่อกดปุ่ม Play สีส้ม วิดีโอนี้จะเล่นในป็อปอัป Modal ทันที
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">ป้ายกำกับคำอธิบาย (CAPTION PREFIX)</label>
            <input type="text" id="p2CaptionTagInput" class="form-control" value="${this.escapeHtml(p2.captionTag || 'LAB WORKSHOP:')}" placeholder="เช่น LAB WORKSHOP: หรือ SITE INSPECTION:">
          </div>

          <div class="form-group">
            <label class="form-label">ข้อความคำอธิบาย (CAPTION DESCRIPTION)</label>
            <textarea id="p2CaptionTextInput" class="form-control" rows="2">${this.escapeHtml(p2.captionText || '')}</textarea>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button class="btn-tactical btn-tactical-primary" onclick="window.app.saveDashboardPanel(2)">
              <i class="fa-solid fa-check"></i> บันทึก Panel 2
            </button>
            <button class="btn-tactical btn-tactical-ghost" onclick="window.app.closeCMSModal()">
              ยกเลิก
            </button>
          </div>
        </div>
      `;
      modal.classList.add("open");
    } else if (num === 3) {
      const p3 = d.panel3 || window.DEFAULT_PORTFOLIO_DATA.dashboard.panel3;
      this.currentEditingNotes = JSON.parse(JSON.stringify(p3.notes || []));

      title.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไข PANEL 3: FIELD NOTES [LOGS_03]`;
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
            <div class="form-group">
              <label class="form-label">PANEL TITLE</label>
              <input type="text" id="p3TitleInput" class="form-control" value="${this.escapeHtml(p3.title || 'FIELD NOTES')}">
            </div>
            <div class="form-group">
              <label class="form-label">SECTION CODE</label>
              <input type="text" id="p3CodeInput" class="form-control" value="${this.escapeHtml(p3.code || '[LOGS_03]')}">
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-hairline); padding-bottom: 6px;">
            <label class="form-label" style="margin: 0; color: #81c784;"><i class="fa-solid fa-clipboard-list"></i> รายการบันทึก (Field Log Entries)</label>
            <button type="button" class="btn-att-add" onclick="window.app.addNoteItemToPanel3Editor()">
              <i class="fa-solid fa-plus"></i> เพิ่มบันทึกใหม่
            </button>
          </div>

          <div id="p3NotesEditorContainer" style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
          </div>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button class="btn-tactical btn-tactical-primary" onclick="window.app.saveDashboardPanel(3)">
              <i class="fa-solid fa-check"></i> บันทึก Panel 3
            </button>
            <button class="btn-tactical btn-tactical-ghost" onclick="window.app.closeCMSModal()">
              ยกเลิก
            </button>
          </div>
        </div>
      `;
      this.renderPanel3NotesEditor();
      modal.classList.add("open");
    } else if (num === 4) {
      const p4 = d.panel4 || window.DEFAULT_PORTFOLIO_DATA.dashboard.panel4;
      title.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไข PANEL 4: SYSTEM OVERVIEW [CAD_04]`;
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 8px;">
            <div class="form-group">
              <label class="form-label">PANEL TITLE</label>
              <input type="text" id="p4TitleInput" class="form-control" value="${this.escapeHtml(p4.title || 'SYSTEM OVERVIEW')}">
            </div>
            <div class="form-group">
              <label class="form-label">SECTION CODE</label>
              <input type="text" id="p4CodeInput" class="form-control" value="${this.escapeHtml(p4.code || '[CAD_04]')}">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">รูปแบบการแสดงผล (DISPLAY MODE)</label>
            <select id="p4ModeSelect" class="form-control" onchange="window.app.toggleCadModeView(this.value)">
              <option value="canvas" ${(!p4.mode || p4.mode === 'canvas') ? 'selected' : ''}>1. Animated CAD Blueprint Canvas (เส้นไดอะแกรมไซเบอร์อัตโนมัติ)</option>
              <option value="image" ${p4.mode === 'image' ? 'selected' : ''}>2. Custom Schematic / CAD Image (อัปโหลดรูปภาพแบบแปลนจริงจากเครื่อง)</option>
            </select>
          </div>

          <div id="p4ImageGroup" class="form-group" style="${p4.mode === 'image' ? '' : 'display: none;'}">
            <label class="form-label">ไฟล์ภาพแบบแปลน CAD / วงจร SLD</label>
            <div style="display: flex; gap: 6px;">
              <input type="text" id="p4ImageUrlInput" class="form-control" value="${this.escapeHtml(p4.imageUrl || '')}" placeholder="URL รูปภาพแบบแปลน หรือกดเลือกไฟล์">
              <button type="button" class="btn-att-add" style="white-space: nowrap;" onclick="document.getElementById('p4CadFileUploader').click()">
                <i class="fa-solid fa-folder-open"></i> เลือกไฟล์แบบแปลน
              </button>
              <input type="file" id="p4CadFileUploader" accept="image/*" style="display: none;" onchange="window.app.handleCadImageUpload(this.files[0])">
            </div>
            <div id="p4CadPreviewBox" style="margin-top: 6px;">
              ${p4.imageUrl ? `<img src="${p4.imageUrl}" style="max-height: 100px; border: 1px solid var(--border-hairline); border-radius: 4px;">` : ''}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="form-group">
              <label class="form-label">ป้ายสถานะซ้าย (SLD BADGE)</label>
              <input type="text" id="p4BadgeLeftInput" class="form-control" value="${this.escapeHtml(p4.badgeLeft || 'SLD: 400V/230V 50Hz')}">
            </div>
            <div class="form-group">
              <label class="form-label">ป้ายสถานะขวา (DWG REV)</label>
              <input type="text" id="p4BadgeRightInput" class="form-control" value="${this.escapeHtml(p4.badgeRight || 'DWG: SCHEMATIC_REV2')}">
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button class="btn-tactical btn-tactical-primary" onclick="window.app.saveDashboardPanel(4)">
              <i class="fa-solid fa-check"></i> บันทึก Panel 4
            </button>
            <button class="btn-tactical btn-tactical-ghost" onclick="window.app.closeCMSModal()">
              ยกเลิก
            </button>
          </div>
        </div>
      `;
      modal.classList.add("open");
    }
  }

  toggleCadModeView(val) {
    const box = document.getElementById("p4ImageGroup");
    if (box) box.style.display = val === "image" ? "block" : "none";
  }

  handlePanel2ImageUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const inp = document.getElementById("p2ImageUrlInput");
      if (inp) inp.value = e.target.result;
      const preview = document.getElementById("p2ImagePreviewBox");
      if (preview) {
        preview.innerHTML = `<img src="${e.target.result}" style="max-height: 90px; border: 1px solid var(--border-hairline); border-radius: 4px;">`;
      }
    };
    reader.readAsDataURL(file);
  }

  handleCadImageUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const inp = document.getElementById("p4ImageUrlInput");
      if (inp) inp.value = e.target.result;
      const preview = document.getElementById("p4CadPreviewBox");
      if (preview) {
        preview.innerHTML = `<img src="${e.target.result}" style="max-height: 100px; border: 1px solid var(--border-hairline); border-radius: 4px;">`;
      }
    };
    reader.readAsDataURL(file);
  }

  renderPanel1SpecsEditor() {
    const container = document.getElementById("p1SpecsEditorContainer");
    if (!container) return;
    const list = this.currentEditingSpecs || [];

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 10px;">ยังไม่มีหัวข้อ — คลิกปุ่มด้านบนเพื่อเพิ่ม</div>`;
      return;
    }

    container.innerHTML = list.map((spec, idx) => `
      <div style="background: var(--bg-chassis); border: 1px solid var(--border-hairline); padding: 8px 10px; border-radius: 4px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
          <input type="text" class="form-control" style="font-size: 0.8rem; font-weight: 700;" value="${this.escapeHtml(spec.title)}" placeholder="ชื่อหัวข้อ เช่น INDUSTRIAL AUTOMATION" oninput="window.app.updateSpecItem(${idx}, 'title', this.value)">
          <div style="display: flex; gap: 4px;">
            <button type="button" class="btn-thumb-arrow" style="position: static;" onclick="window.app.moveSpecItem(${idx}, -1)" title="เลื่อนขึ้น">▲</button>
            <button type="button" class="btn-thumb-arrow" style="position: static;" onclick="window.app.moveSpecItem(${idx}, 1)" title="เลื่อนลง">▼</button>
            <button type="button" class="btn-doc-del" onclick="window.app.removeSpecItemFromPanel1Editor(${idx})" title="ลบหัวข้อนี้">✕</button>
          </div>
        </div>
        <textarea class="form-control" rows="2" style="font-size: 0.78rem;" placeholder="คำอธิบายรายละเอียด..." oninput="window.app.updateSpecItem(${idx}, 'content', this.value)">${this.escapeHtml(spec.content || '')}</textarea>
      </div>
    `).join('');
  }

  updateSpecItem(idx, field, val) {
    if (this.currentEditingSpecs && this.currentEditingSpecs[idx]) {
      this.currentEditingSpecs[idx][field] = val;
    }
  }

  addSpecItemToPanel1Editor() {
    if (!this.currentEditingSpecs) this.currentEditingSpecs = [];
    this.currentEditingSpecs.push({
      title: `NEW TECHNICAL SPECIFICATION`,
      content: "รายละเอียดทักษะความเชี่ยวชาญทางวิศวกรรม"
    });
    this.renderPanel1SpecsEditor();
  }

  moveSpecItem(idx, dir) {
    if (!this.currentEditingSpecs) return;
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= this.currentEditingSpecs.length) return;
    const tmp = this.currentEditingSpecs[idx];
    this.currentEditingSpecs[idx] = this.currentEditingSpecs[tgt];
    this.currentEditingSpecs[tgt] = tmp;
    this.renderPanel1SpecsEditor();
  }

  removeSpecItemFromPanel1Editor(idx) {
    if (!this.currentEditingSpecs) return;
    this.currentEditingSpecs.splice(idx, 1);
    this.renderPanel1SpecsEditor();
  }

  renderPanel3NotesEditor() {
    const container = document.getElementById("p3NotesEditorContainer");
    if (!container) return;
    const list = this.currentEditingNotes || [];

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 10px;">ยังไม่มีบันทึก — คลิกปุ่มด้านบนเพื่อเพิ่ม</div>`;
      return;
    }

    container.innerHTML = list.map((note, idx) => `
      <div style="background: var(--bg-chassis); border: 1px solid var(--border-hairline); padding: 8px 10px; border-radius: 4px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
          <input type="text" class="form-control" style="font-size: 0.8rem;" value="${this.escapeHtml(note.text)}" placeholder="ข้อความบันทึก เช่น การทดสอบระบบสายพาน..." oninput="window.app.updateNoteItem(${idx}, 'text', this.value)">
          <div style="display: flex; gap: 4px;">
            <button type="button" class="btn-thumb-arrow" style="position: static;" onclick="window.app.moveNoteItem(${idx}, -1)" title="เลื่อนขึ้น">▲</button>
            <button type="button" class="btn-thumb-arrow" style="position: static;" onclick="window.app.moveNoteItem(${idx}, 1)" title="เลื่อนลง">▼</button>
            <button type="button" class="btn-doc-del" onclick="window.app.removeNoteItemFromPanel3Editor(${idx})" title="ลบบันทึกนี้">✕</button>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
          <input type="text" class="form-control" style="font-size: 0.75rem;" value="${this.escapeHtml(note.index || 'INDEX 01:00')}" placeholder="INDEX เช่น INDEX 03:12" oninput="window.app.updateNoteItem(${idx}, 'index', this.value)">
          <input type="text" class="form-control" style="font-size: 0.75rem;" value="${this.escapeHtml(note.link || '#')}" placeholder="ลิงก์ปลายทาง เช่น courses.html" oninput="window.app.updateNoteItem(${idx}, 'link', this.value)">
        </div>
      </div>
    `).join('');
  }

  updateNoteItem(idx, field, val) {
    if (this.currentEditingNotes && this.currentEditingNotes[idx]) {
      this.currentEditingNotes[idx][field] = val;
    }
  }

  addNoteItemToPanel3Editor() {
    if (!this.currentEditingNotes) this.currentEditingNotes = [];
    this.currentEditingNotes.push({
      text: "บันทึกการปฏิบัติงานและกรณีศึกษาใหม่",
      index: `INDEX 0${this.currentEditingNotes.length + 1}:00`,
      link: "courses.html"
    });
    this.renderPanel3NotesEditor();
  }

  moveNoteItem(idx, dir) {
    if (!this.currentEditingNotes) return;
    const tgt = idx + dir;
    if (tgt < 0 || tgt >= this.currentEditingNotes.length) return;
    const tmp = this.currentEditingNotes[idx];
    this.currentEditingNotes[idx] = this.currentEditingNotes[tgt];
    this.currentEditingNotes[tgt] = tmp;
    this.renderPanel3NotesEditor();
  }

  removeNoteItemFromPanel3Editor(idx) {
    if (!this.currentEditingNotes) return;
    this.currentEditingNotes.splice(idx, 1);
    this.renderPanel3NotesEditor();
  }

  saveDashboardPanel(num) {
    if (!this.data.dashboard) {
      this.data.dashboard = JSON.parse(JSON.stringify(window.DEFAULT_PORTFOLIO_DATA.dashboard));
    }

    if (num === 1) {
      const title = document.getElementById("p1TitleInput")?.value.trim() || "SYSTEM HIGHLIGHTS";
      const code = document.getElementById("p1CodeInput")?.value.trim() || "[SPEC_01]";
      this.data.dashboard.panel1 = {
        title: title,
        code: code,
        specs: this.currentEditingSpecs || []
      };
    } else if (num === 2) {
      const title = document.getElementById("p2TitleInput")?.value.trim() || "IN THE FIELD";
      const code = document.getElementById("p2CodeInput")?.value.trim() || "[FEED_02]";
      const imageUrl = document.getElementById("p2ImageUrlInput")?.value.trim() || "";
      const videoUrl = document.getElementById("p2VideoUrlInput")?.value.trim() || "";
      const captionTag = document.getElementById("p2CaptionTagInput")?.value.trim() || "LAB WORKSHOP:";
      const captionText = document.getElementById("p2CaptionTextInput")?.value.trim() || "";

      this.data.dashboard.panel2 = {
        title: title,
        code: code,
        imageUrl: imageUrl,
        videoUrl: videoUrl,
        captionTag: captionTag,
        captionText: captionText
      };
    } else if (num === 3) {
      const title = document.getElementById("p3TitleInput")?.value.trim() || "FIELD NOTES";
      const code = document.getElementById("p3CodeInput")?.value.trim() || "[LOGS_03]";
      this.data.dashboard.panel3 = {
        title: title,
        code: code,
        notes: this.currentEditingNotes || []
      };
    } else if (num === 4) {
      const title = document.getElementById("p4TitleInput")?.value.trim() || "SYSTEM OVERVIEW";
      const code = document.getElementById("p4CodeInput")?.value.trim() || "[CAD_04]";
      const mode = document.getElementById("p4ModeSelect")?.value || "canvas";
      const imageUrl = document.getElementById("p4ImageUrlInput")?.value.trim() || "";
      const badgeLeft = document.getElementById("p4BadgeLeftInput")?.value.trim() || "SLD: 400V/230V 50Hz";
      const badgeRight = document.getElementById("p4BadgeRightInput")?.value.trim() || "DWG: SCHEMATIC_REV2";

      this.data.dashboard.panel4 = {
        title: title,
        code: code,
        mode: mode,
        imageUrl: imageUrl,
        badgeLeft: badgeLeft,
        badgeRight: badgeRight
      };
    }

    this.saveData();
    this.renderDashboardGrid();
    this.closeCMSModal();
    this.playTacticalBeep(1000, "triangle", 0.1);
    alert(`บันทึกการแก้ไข Panel ${num} สำเร็จเรียบร้อยแล้ว!`);
  }

  filterCourses(cat) {
    this.currentCourseFilter = cat;
    document.querySelectorAll("#courseFilterBar .filter-btn").forEach((b) => b.classList.remove("active"));
    if (event && event.target) event.target.classList.add("active");
    this.renderCourses(cat);
    this.playTacticalBeep(700, "sine", 0.04);
  }

  checkAdminOrPrompt(actionName = "ดำเนินการ") {
    if (sessionStorage.getItem(this.authKey) === "authenticated" || document.body.classList.contains("admin-mode")) {
      if (!sessionStorage.getItem(this.authKey)) {
        sessionStorage.setItem(this.authKey, "authenticated");
      }
      return true;
    }
    this.openLoginModal();
    alert(`ระบบความปลอดภัย: กรุณาเข้าสู่ระบบก่อนทำการ${actionName}\n(ชื่อผู้ใช้: O’Coner / รหัสผ่าน: thanapat4444)`);
    return false;
  }

  promptAddCourse() {
    if (!this.checkAdminOrPrompt("เพิ่มรายวิชาใหม่")) return;
    this.openCMSModal("items");
    setTimeout(() => this.switchItemTab("course"), 50);
  }

  promptAddActivity() {
    if (!this.checkAdminOrPrompt("เพิ่มกิจกรรม/ผลงานใหม่")) return;
    this.openCMSModal("items");
    setTimeout(() => this.switchItemTab("activity"), 50);
  }

  renderCourses(category = "all") {
    const container = document.getElementById("coursesGrid");
    if (!container) return;
    container.innerHTML = "";

    const list = this.data.courses.filter((c) => (category === "all" ? true : c.category === category));

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center; background: var(--bg-panel); border: 1px dashed var(--border-hairline);">
          <i class="fa-solid fa-book-open" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem;"></i>
          <div style="font-size: 1.05rem; font-weight: 600; color: var(--text-secondary);">ยังไม่มีรายวิชาในหมวดหมู่นี้</div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 6px 0 16px 0;">คุณสามารถเพิ่มรายวิชาใหม่ได้โดยคลิกปุ่มด้านล่าง</p>
          <button class="btn-tactical btn-tactical-primary admin-only" onclick="window.app.promptAddCourse()">
            <i class="fa-solid fa-plus"></i> เพิ่มรายวิชาใหม่
          </button>
        </div>
      `;
      return;
    }

    list.forEach((c) => {
      const card = document.createElement("div");
      card.className = "course-card hud-reticle";
      card.innerHTML = `
        <div class="hud-reticle-tr"></div>
        <div class="hud-reticle-bl"></div>

        <div class="course-code-row">
          <span>CODE: ${c.code}</span>
          <span>${c.credits || ""}</span>
        </div>
        <h3 class="course-title">${c.title}</h3>
        <p class="course-desc">${c.description}</p>

        <div class="artifacts-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span><i class="fa-solid fa-microchip"></i> ชิ้นงานและผลลัพธ์การเรียนรู้ (ARTIFACTS)</span>
          <button class="btn-dock admin-only btn-add-artifact" style="font-size: 0.68rem; padding: 1px 6px;" onclick="window.app.promptAddArtifact('${c.id}')" title="เพิ่มชิ้นงานในวิชานี้">
            <i class="fa-solid fa-plus"></i> เพิ่มชิ้นงาน
          </button>
        </div>
        <div class="artifacts-list">
          ${(c.artifacts && c.artifacts.length > 0)
            ? c.artifacts.map((art, artIdx) => {
                const atts = art.attachments || [];
                const imgAtts = atts.filter(a => a.type === "image" && a.url);
                const pdfAtts = atts.filter(a => a.type === "pdf" && a.url);
                const ytAtts = atts.filter(a => a.type === "youtube" && a.url);
                if (atts.length === 0 && art.fileUrl) {
                  pdfAtts.push({ type: "pdf", name: art.name || "เอกสาร", url: art.fileUrl });
                }

                return `
                  <div class="artifact-item" style="flex-direction: column; align-items: stretch; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                      <div style="flex-grow: 1;">
                        <div class="artifact-name"><i class="fa-solid fa-file-lines" style="color: var(--accent-amber); margin-right: 6px;"></i>${this.escapeHtml(art.name)}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${this.escapeHtml(art.summary || "")}</div>
                      </div>
                      <div class="artifact-admin-ctrls admin-only" style="gap: 4px; align-items: center; flex-shrink: 0;">
                        <button class="btn-dock" style="padding: 2px 6px; font-size: 0.7rem;" onclick="window.app.editArtifact('${c.id}', ${artIdx})" title="แก้ไขชิ้นงานนี้">
                          <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-dock" style="padding: 2px 6px; font-size: 0.7rem; color: var(--signal-rec);" onclick="window.app.deleteArtifact('${c.id}', ${artIdx})" title="ลบชิ้นงานนี้">
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                    
                    ${(imgAtts.length > 0 || pdfAtts.length > 0 || ytAtts.length > 0) ? `
                      <div class="media-chips-row" style="margin: 2px 0 0 0;">
                        ${imgAtts.length > 0 ? `
                          <button type="button" class="media-chip chip-gallery" onclick="window.app.openGalleryModal(${JSON.stringify(imgAtts).replace(/"/g, '&quot;')}, 0)">
                            <i class="fa-solid fa-images"></i> รูปภาพ (${imgAtts.length})
                          </button>
                        ` : ''}
                        ${pdfAtts.map(pdf => `
                          <button type="button" class="media-chip chip-pdf" onclick="window.app.openPdfModal('${encodeURIComponent(pdf.url)}', '${encodeURIComponent(pdf.name || 'เอกสาร PDF')}')">
                            <i class="fa-solid fa-file-pdf"></i> ${this.escapeHtml(pdf.name || 'เอกสาร PDF')}
                          </button>
                        `).join('')}
                        ${ytAtts.map(yt => `
                          <button type="button" class="media-chip chip-youtube" onclick="window.app.openYouTubeModal('${encodeURIComponent(yt.url)}', '${encodeURIComponent(yt.name || 'วิดีโอสาธิต')}')">
                            <i class="fa-brands fa-youtube"></i> ${this.escapeHtml(yt.name || 'วิดีโอสาธิต')}
                          </button>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                `;
              }).join("")
            : `<div style="font-size: 0.78rem; color: var(--text-muted); padding: 6px 0;">ยังไม่มีชิ้นงานแนบในวิชานี้</div>`
          }
        </div>

        <div class="card-mgmt-actions admin-only" style="margin-top: auto; padding-top: 1rem; border-top: 1px dashed var(--border-hairline); justify-content: space-between; align-items: center; gap: 8px;">
          <button class="btn-dock" style="font-size: 0.72rem; padding: 4px 10px;" onclick="window.app.editCourse('${c.id}')">
            <i class="fa-solid fa-pen"></i> แก้ไขวิชา
          </button>
          <button class="btn-dock" style="font-size: 0.72rem; padding: 4px 10px; color: var(--signal-rec);" onclick="window.app.deleteCourse('${c.id}')">
            <i class="fa-solid fa-trash-can"></i> ลบวิชานี้
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  deleteCourse(id) {
    if (!this.checkAdminOrPrompt("ลบรายวิชา")) return;
    const c = this.data.courses.find((item) => item.id === id);
    const title = c ? `${c.code} ${c.title}` : "รายวิชานี้";
    if (confirm(`ยืนยันการลบรายวิชา:\n"${title}"\nออกจากระบบหรือไม่?`)) {
      this.data.courses = this.data.courses.filter((item) => item.id !== id);
      this.saveData();
      this.renderCourses(this.currentCourseFilter || "all");
      this.playTacticalBeep(320, "sawtooth", 0.12);
      alert(`ลบรายวิชา "${title}" เรียบร้อยแล้ว`);
    }
  }

  editCourse(id) {
    if (!this.checkAdminOrPrompt("แก้ไขรายวิชา")) return;
    const c = this.data.courses.find((item) => item.id === id);
    if (!c) return;

    const modal = document.getElementById("cmsStudioModal");
    const title = document.getElementById("cmsModalTitle");
    const body = document.getElementById("cmsModalBody");
    if (!modal || !body) return;

    title.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไขข้อมูลรายวิชา: ${c.code}`;
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="form-group">
          <label class="form-label">รหัสวิชา (COURSE CODE)</label>
          <input type="text" id="editCourseCode" class="form-control" value="${c.code || ""}" required>
        </div>
        <div class="form-group">
          <label class="form-label">ชื่อวิชา (COURSE TITLE)</label>
          <input type="text" id="editCourseTitle" class="form-control" value="${c.title || ""}" required>
        </div>
        <div class="form-group">
          <label class="form-label">หมวดหมู่วิชา</label>
          <select id="editCourseCat" class="form-control">
            <option value="automation" ${c.category === "automation" ? "selected" : ""}>ระบบควบคุมอัตโนมัติ (Automation)</option>
            <option value="power" ${c.category === "power" ? "selected" : ""}>วิศวกรรมไฟฟ้ากำลัง (Power)</option>
            <option value="pedagogy" ${c.category === "pedagogy" ? "selected" : ""}>ครุศาสตร์อุตสาหกรรม (Pedagogy)</option>
            <option value="circuit" ${c.category === "circuit" ? "selected" : ""}>วงจรไฟฟ้า (Circuits)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">หน่วยกิต (CREDITS)</label>
          <input type="text" id="editCourseCredits" class="form-control" value="${c.credits || "3 (2-2-5)"}">
        </div>
        <div class="form-group">
          <label class="form-label">คำอธิบายรายวิชา</label>
          <textarea id="editCourseDesc" class="form-control" rows="3">${c.description || ""}</textarea>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn-tactical btn-tactical-primary" onclick="window.app.submitEditCourse('${c.id}')">
            <i class="fa-solid fa-check"></i> บันทึกการแก้ไข
          </button>
          <button class="btn-tactical btn-tactical-ghost" onclick="window.app.closeCMSModal()">
            ยกเลิก
          </button>
        </div>
      </div>
    `;
    modal.classList.add("open");
  }

  submitEditCourse(id) {
    const c = this.data.courses.find((item) => item.id === id);
    if (!c) return;

    c.code = document.getElementById("editCourseCode").value.trim();
    c.title = document.getElementById("editCourseTitle").value.trim();
    c.category = document.getElementById("editCourseCat").value;
    c.credits = document.getElementById("editCourseCredits").value.trim();
    c.description = document.getElementById("editCourseDesc").value.trim();

    this.saveData();
    this.renderCourses(this.currentCourseFilter || "all");
    this.closeCMSModal();
    this.playTacticalBeep(900, "triangle", 0.08);
    alert("บันทึกการแก้ไขรายวิชาเรียบร้อยแล้ว!");
  }

  promptAddArtifact(courseId) {
    if (!this.checkAdminOrPrompt("เพิ่มชิ้นงานในรายวิชา")) return;
    const c = this.data.courses.find((item) => item.id === courseId);
    if (!c) return;

    const modal = document.getElementById("cmsStudioModal");
    const title = document.getElementById("cmsModalTitle");
    const body = document.getElementById("cmsModalBody");
    if (!modal || !body) return;

    title.innerHTML = `<i class="fa-solid fa-file-circle-plus"></i> เพิ่มชิ้นงานในวิชา: ${c.code}`;
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="form-group">
          <label class="form-label">ชื่อชิ้นงาน (ARTIFACT NAME)</label>
          <input type="text" id="newArtName" class="form-control" placeholder="เช่น แผนการจัดการเรียนรู้เรื่อง วงจรควบคุมมอเตอร์" required>
        </div>
        <div class="form-group">
          <label class="form-label">คำอธิบายสรุปชิ้นงาน</label>
          <textarea id="newArtSummary" class="form-control" rows="2" placeholder="เช่น รายละเอียดแบบแปลน เอกสาร หรือโครงงาน"></textarea>
        </div>
        ${this.getHTMLAttachmentBuilderUI()}
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="btn-tactical btn-tactical-primary" onclick="window.app.submitNewArtifact('${c.id}')">
            <i class="fa-solid fa-check"></i> บันทึกชิ้นงาน
          </button>
          <button class="btn-tactical btn-tactical-ghost" onclick="window.app.closeCMSModal()">
            ยกเลิก
          </button>
        </div>
      </div>
    `;
    modal.classList.add("open");
    this.initAttachmentsBuilder([]);
  }

  submitNewArtifact(courseId) {
    const c = this.data.courses.find((item) => item.id === courseId);
    if (!c) return;

    const name = document.getElementById("newArtName").value.trim();
    const summary = document.getElementById("newArtSummary").value.trim();

    if (!name) {
      alert("โปรดระบุชื่อชิ้นงาน");
      return;
    }

    if (!c.artifacts) c.artifacts = [];
    const atts = (this.currentEditingAttachments || []).filter(a => a.url || a.name);
    c.artifacts.push({
      name: name,
      summary: summary || "",
      fileUrl: atts.length > 0 ? atts[0].url : "",
      type: "project",
      attachments: atts
    });

    this.saveData();
    this.renderCourses(this.currentCourseFilter || "all");
    this.closeCMSModal();
    this.playTacticalBeep(900, "triangle", 0.08);
    alert(`เพิ่มชิ้นงานในวิชา ${c.code} สำเร็จแล้ว!`);
  }

  editArtifact(courseId, artifactIdx) {
    if (!this.checkAdminOrPrompt("แก้ไขชิ้นงาน")) return;
    const c = this.data.courses.find((item) => item.id === courseId);
    if (!c || !c.artifacts || !c.artifacts[artifactIdx]) return;
    const art = c.artifacts[artifactIdx];

    const modal = document.getElementById("cmsStudioModal");
    const title = document.getElementById("cmsModalTitle");
    const body = document.getElementById("cmsModalBody");
    if (!modal || !body) return;

    title.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไขชิ้นงานในวิชา: ${c.code}`;
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="form-group">
          <label class="form-label">ชื่อชิ้นงาน (ARTIFACT NAME)</label>
          <input type="text" id="editArtName" class="form-control" value="${this.escapeHtml(art.name || '')}" required>
        </div>
        <div class="form-group">
          <label class="form-label">คำอธิบายสรุปชิ้นงาน</label>
          <textarea id="editArtSummary" class="form-control" rows="2">${this.escapeHtml(art.summary || '')}</textarea>
        </div>
        ${this.getHTMLAttachmentBuilderUI()}
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="btn-tactical btn-tactical-primary" onclick="window.app.submitEditArtifact('${c.id}', ${artifactIdx})">
            <i class="fa-solid fa-check"></i> บันทึกการแก้ไขชิ้นงาน
          </button>
          <button class="btn-tactical btn-tactical-ghost" onclick="window.app.closeCMSModal()">
            ยกเลิก
          </button>
        </div>
      </div>
    `;

    modal.classList.add("open");
    let initialAtts = art.attachments || [];
    if (initialAtts.length === 0 && art.fileUrl) {
      initialAtts = [{ id: 'att_init', type: 'pdf', name: art.name, url: art.fileUrl }];
    }
    this.initAttachmentsBuilder(initialAtts);
  }

  submitEditArtifact(courseId, artifactIdx) {
    const c = this.data.courses.find((item) => item.id === courseId);
    if (!c || !c.artifacts || !c.artifacts[artifactIdx]) return;
    const art = c.artifacts[artifactIdx];

    const name = document.getElementById("editArtName").value.trim();
    const summary = document.getElementById("editArtSummary").value.trim();

    if (!name) {
      alert("โปรดระบุชื่อชิ้นงาน");
      return;
    }

    art.name = name;
    art.summary = summary;
    art.attachments = (this.currentEditingAttachments || []).filter(a => a.url || a.name);
    if (art.attachments.length > 0) {
      art.fileUrl = art.attachments[0].url || "";
    }

    this.saveData();
    this.renderCourses(this.currentCourseFilter || "all");
    this.closeCMSModal();
    this.playTacticalBeep(900, "triangle", 0.08);
    alert(`บันทึกการแก้ไขชิ้นงาน "${name}" เรียบร้อยแล้ว!`);
  }

  deleteArtifact(courseId, artifactIdx) {
    if (!this.checkAdminOrPrompt("ลบชิ้นงาน")) return;
    const c = this.data.courses.find((item) => item.id === courseId);
    if (!c || !c.artifacts || !c.artifacts[artifactIdx]) return;

    const artName = c.artifacts[artifactIdx].name;
    if (confirm(`ยืนยันการลบชิ้นงาน:\n"${artName}"\nออกจากวิชา ${c.code} หรือไม่?`)) {
      c.artifacts.splice(artifactIdx, 1);
      this.saveData();
      this.renderCourses(this.currentCourseFilter || "all");
      this.playTacticalBeep(320, "sawtooth", 0.1);
      alert(`ลบชิ้นงาน "${artName}" เรียบร้อยแล้ว`);
    }
  }

  filterActivities(cat) {
    this.currentActivityFilter = cat;
    document.querySelectorAll("#activityFilterBar .filter-btn").forEach((b) => b.classList.remove("active"));
    if (event && event.target) event.target.classList.add("active");
    this.renderActivities(cat);
    this.playTacticalBeep(700, "sine", 0.04);
  }

  renderActivities(category = "all") {
    const container = document.getElementById("activitiesGrid");
    if (!container) return;
    container.innerHTML = "";

    const list = this.data.activities.filter((a) => (category === "all" ? true : a.category === category));

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem 1.5rem; text-align: center; background: var(--bg-panel); border: 1px dashed var(--border-hairline);">
          <i class="fa-solid fa-trophy" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 0.75rem;"></i>
          <div style="font-size: 1.05rem; font-weight: 600; color: var(--text-secondary);">ยังไม่มีกิจกรรมหรือผลงานในหมวดหมู่นี้</div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 6px 0 16px 0;">คุณสามารถเพิ่มกิจกรรม/ผลงานใหม่ได้โดยคลิกปุ่มด้านล่าง</p>
          <button class="btn-tactical btn-tactical-primary admin-only" onclick="window.app.promptAddActivity()">
            <i class="fa-solid fa-plus"></i> เพิ่มกิจกรรม/ผลงานใหม่
          </button>
        </div>
      `;
      return;
    }

    list.forEach((act) => {
      const card = document.createElement("div");
      card.className = "activity-card hud-reticle";
      const defaultImg = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";

      const atts = act.attachments || [];
      const imgAtts = atts.filter(a => a.type === "image" && a.url);
      const pdfAtts = atts.filter(a => a.type === "pdf" && a.url);
      const ytAtts = atts.filter(a => a.type === "youtube" && a.url);
      const coverImg = imgAtts.length > 0 ? imgAtts[0].url : (act.imageUrl || defaultImg);

      card.innerHTML = `
        <div class="activity-media-box">
          <img src="${coverImg}" alt="${this.escapeHtml(act.title)}" class="activity-img" onclick="window.app.openGalleryModal('${act.id}', 0)" style="cursor: pointer;" title="คลิกเพื่อดูรูปภาพขนาดใหญ่">
          <div class="activity-badge">${act.badge || "ACHIEVEMENT"}</div>
        </div>
        <div class="activity-body">
          <div class="activity-date"><i class="fa-regular fa-calendar"></i> ${act.date} • ${act.place || ""}</div>
          <h3 class="activity-title">${act.title}</h3>
          <p class="activity-summary">${act.summary}</p>
          
          ${(imgAtts.length > 1 || pdfAtts.length > 0 || ytAtts.length > 0) ? `
            <div class="media-chips-row">
              ${imgAtts.length > 1 ? `
                <button type="button" class="media-chip chip-gallery" onclick="window.app.openGalleryModal('${act.id}', 0)">
                  <i class="fa-solid fa-images"></i> รูปภาพ (${imgAtts.length})
                </button>
              ` : ''}
              ${pdfAtts.map(pdf => `
                <button type="button" class="media-chip chip-pdf" onclick="window.app.openPdfModal('${encodeURIComponent(pdf.url)}', '${encodeURIComponent(pdf.name || 'เอกสาร PDF')}')">
                  <i class="fa-solid fa-file-pdf"></i> ${this.escapeHtml(pdf.name || 'เอกสาร PDF')}
                </button>
              `).join('')}
              ${ytAtts.map(yt => `
                <button type="button" class="media-chip chip-youtube" onclick="window.app.openYouTubeModal('${encodeURIComponent(yt.url)}', '${encodeURIComponent(yt.name || 'วิดีโอสาธิต')}')">
                  <i class="fa-brands fa-youtube"></i> ${this.escapeHtml(yt.name || 'วิดีโอสาธิต')}
                </button>
              `).join('')}
            </div>
          ` : ''}

          <div class="card-mgmt-actions admin-only" style="margin-top: auto; padding-top: 1rem; border-top: 1px dashed var(--border-hairline); justify-content: space-between; align-items: center; gap: 8px;">
            <button class="btn-dock" style="font-size: 0.72rem; padding: 4px 10px;" onclick="window.app.editActivity('${act.id}')">
              <i class="fa-solid fa-pen"></i> แก้ไขผลงาน
            </button>
            <button class="btn-dock" style="font-size: 0.72rem; padding: 4px 10px; color: var(--signal-rec);" onclick="window.app.deleteActivity('${act.id}')">
              <i class="fa-solid fa-trash-can"></i> ลบผลงานนี้
            </button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  deleteActivity(id) {
    if (!this.checkAdminOrPrompt("ลบผลงาน")) return;
    const a = this.data.activities.find((item) => item.id === id);
    const title = a ? a.title : "ผลงานนี้";
    if (confirm(`ยืนยันการลบกิจกรรม/ผลงาน:\n"${title}"\nออกจากระบบหรือไม่?`)) {
      this.data.activities = this.data.activities.filter((item) => item.id !== id);
      this.saveData();
      this.renderActivities(this.currentActivityFilter || "all");
      this.playTacticalBeep(320, "sawtooth", 0.12);
      alert(`ลบผลงาน "${title}" เรียบร้อยแล้ว`);
    }
  }

  editActivity(id) {
    if (!this.checkAdminOrPrompt("แก้ไขผลงาน")) return;
    const act = this.data.activities.find((item) => item.id === id);
    if (!act) return;

    const modal = document.getElementById("cmsStudioModal");
    const title = document.getElementById("cmsModalTitle");
    const body = document.getElementById("cmsModalBody");
    if (!modal || !body) return;

    title.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> แก้ไขกิจกรรม/ผลงาน`;
    body.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="form-group">
          <label class="form-label">ชื่อกิจกรรมหรือผลงาน</label>
          <input type="text" id="editActTitle" class="form-control" value="${this.escapeHtml(act.title || "")}" required>
        </div>
        <div class="form-group">
          <label class="form-label">หมวดหมู่</label>
          <select id="editActCat" class="form-control">
            <option value="competition" ${act.category === "competition" ? "selected" : ""}>แข่งขันทักษะวิชาชีพ</option>
            <option value="training" ${act.category === "training" ? "selected" : ""}>การฝึกอบรมเชิงปฏิบัติการ</option>
            <option value="community" ${act.category === "community" ? "selected" : ""}>บริการวิชาชีพสู่สังคม</option>
            <option value="music" ${act.category === "music" ? "selected" : ""}>ดนตรีและศิลปวัฒนธรรม</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">ป้ายสถานะ (BADGE)</label>
          <input type="text" id="editActBadge" class="form-control" value="${this.escapeHtml(act.badge || "ACHIEVEMENT")}">
        </div>
        <div class="form-group">
          <label class="form-label">ช่วงเวลาและสถานที่</label>
          <input type="text" id="editActDate" class="form-control" value="${this.escapeHtml(act.date || "")}">
        </div>
        <div class="form-group">
          <label class="form-label">คำอธิบายรายละเอียด</label>
          <textarea id="editActSummary" class="form-control" rows="3">${this.escapeHtml(act.summary || "")}</textarea>
        </div>
        ${this.getHTMLAttachmentBuilderUI()}
        <div style="display: flex; gap: 10px; margin-top: 10px;">
          <button class="btn-tactical btn-tactical-primary" onclick="window.app.submitEditActivity('${act.id}')">
            <i class="fa-solid fa-check"></i> บันทึกการแก้ไข
          </button>
          <button class="btn-tactical btn-tactical-ghost" onclick="window.app.closeCMSModal()">
            ยกเลิก
          </button>
        </div>
      </div>
    `;
    modal.classList.add("open");

    let initialAtts = act.attachments || [];
    if (initialAtts.length === 0 && act.imageUrl) {
      initialAtts = [{ id: 'att_cover', type: 'image', name: 'รูปภาพหน้าปก', url: act.imageUrl }];
    }
    this.initAttachmentsBuilder(initialAtts);
  }

  submitEditActivity(id) {
    const act = this.data.activities.find((item) => item.id === id);
    if (!act) return;

    act.title = document.getElementById("editActTitle").value.trim();
    act.category = document.getElementById("editActCat").value;
    act.badge = document.getElementById("editActBadge").value.trim() || "ACHIEVEMENT";
    act.date = document.getElementById("editActDate").value.trim();
    act.summary = document.getElementById("editActSummary").value.trim();

    act.attachments = (this.currentEditingAttachments || []).filter(a => a.url || a.name);
    const coverImg = act.attachments.find(a => a.type === "image")?.url;
    if (coverImg) act.imageUrl = coverImg;

    this.saveData();
    this.renderActivities(this.currentActivityFilter || "all");
    this.closeCMSModal();
    this.playTacticalBeep(900, "triangle", 0.08);
    alert("บันทึกการแก้ไขกิจกรรมเรียบร้อยแล้ว!");
  }
  setupEventListeners() {
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) themeBtn.addEventListener("click", () => this.toggleTheme());

    const soundBtn = document.getElementById("soundToggleBtn");
    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        this.data.siteSettings.soundEnabled = !this.data.siteSettings.soundEnabled;
        soundBtn.innerHTML = this.data.siteSettings.soundEnabled
          ? `<i class="fa-solid fa-volume-high"></i>`
          : `<i class="fa-solid fa-volume-xmark"></i>`;
        this.playTacticalBeep(800, "sine", 0.05);
      });
    }

    const lockBtn = document.getElementById("adminKeyholeBtn");
    if (lockBtn) lockBtn.addEventListener("click", () => this.openLoginModal());

    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey && (e.key === "p" || e.key === "P" || e.code === "KeyP")) {
        e.preventDefault();
        this.openLoginModal();
      }
    });

    const dossierBtn = document.getElementById("quickDossierBtn");
    if (dossierBtn) dossierBtn.addEventListener("click", () => window.print());

    const playMediaBtn = document.getElementById("playFieldMediaBtn");
    if (playMediaBtn) {
      playMediaBtn.addEventListener("click", () => {
        this.playFieldVideo();
      });
    }

    const avatarInput = document.getElementById("avatarUploadInput");
    if (avatarInput) {
      avatarInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const record = await window.assetDB.saveAsset(file, "image");
          this.data.profile.avatarUrl = record.data;
          this.saveData();
          this.renderProfile();
          alert("อัปเดตรูปโปรไฟล์สำเร็จแล้ว!");
        } catch (err) {
          console.error("Avatar upload failed:", err);
        }
      });
    }
  }

  openLoginModal() {
    this.playTacticalBeep(920, "sine", 0.06);
    const modal = document.getElementById("adminLoginModal");
    if (modal) {
      modal.classList.add("open");
      const userInp = document.getElementById("loginUsername");
      if (userInp) userInp.focus();
    }
  }

  closeLoginModal() {
    const modal = document.getElementById("adminLoginModal");
    if (modal) modal.classList.remove("open");
    const err = document.getElementById("loginErrorMsg");
    if (err) err.style.display = "none";
  }

  handleAdminLogin() {
    const uInput = document.getElementById("loginUsername").value.trim();
    const pInput = document.getElementById("loginPassword").value.trim();
    const errEl = document.getElementById("loginErrorMsg");

    const validUsernames = ["O’Coner", "O'Coner", "OConer", "oconer", "o'coner"];
    const validPassword = "thanapat4444";

    if (validUsernames.includes(uInput) && pInput === validPassword) {
      sessionStorage.setItem(this.authKey, "authenticated");
      this.closeLoginModal();
      this.activateAdminMode();
      this.playTacticalBeep(1200, "triangle", 0.15);
      alert("ยินดีต้อนรับคุณ O’Coner! เข้าสู่โหมดผู้ดูแลระบบ (Admin CMS)");
    } else {
      if (errEl) errEl.style.display = "block";
      this.playTacticalBeep(240, "sawtooth", 0.2);
    }
  }

  activateAdminMode() {
    sessionStorage.setItem(this.authKey, "authenticated");
    document.body.classList.add("admin-mode");
    const dock = document.getElementById("adminDock");
    if (dock) dock.style.display = "flex";
    this.renderQuickCards();
    this.renderDashboardGrid();
    this.renderCourses(this.currentCourseFilter || "all");
    this.renderActivities(this.currentActivityFilter || "all");
    this.setupProfilePaneDragAndDrop();
  }

  handleLogout() {
    sessionStorage.removeItem(this.authKey);
    document.body.classList.remove("admin-mode", "editable-active");
    this.isEditing = false;
    const dock = document.getElementById("adminDock");
    if (dock) dock.style.display = "none";
    this.renderQuickCards();
    this.renderDashboardGrid();
    this.renderCourses(this.currentCourseFilter || "all");
    this.renderActivities(this.currentActivityFilter || "all");
    this.setupProfilePaneDragAndDrop();
    this.playTacticalBeep(440, "sine", 0.1);
    alert("ออกจากระบบผู้ดูแลเรียบร้อยแล้ว");
  }

  saveCmsElement(el) {
    if (!el) return;
    const keyAttr = el.getAttribute("data-cms-key");
    if (!keyAttr) return;
    const keyPath = keyAttr.split(".");
    let ref = this.data;
    for (let i = 0; i < keyPath.length - 1; i++) {
      if (!ref[keyPath[i]] || typeof ref[keyPath[i]] !== "object") {
        ref[keyPath[i]] = {};
      }
      ref = ref[keyPath[i]];
    }
    const val = (el.tagName === "INPUT" || el.tagName === "TEXTAREA") ? el.value : el.innerText.trim();
    const finalKey = keyPath[keyPath.length - 1];
    if (ref[finalKey] !== val) {
      ref[finalKey] = val;
      this.saveData();
    }
  }

  toggleInlineEdit() {
    this.isEditing = !this.isEditing;
    const statusText = document.getElementById("inlineEditStatus");

    if (this.isEditing) {
      document.body.classList.add("editable-active");
      if (statusText) statusText.textContent = "แก้ไขเนื้อหา (ON)";

      document.querySelectorAll("[data-cms-key]").forEach((el) => {
        el.setAttribute("contenteditable", "true");
        el.setAttribute("spellcheck", "false");

        // Save real-time on input (debounced 350ms)
        el.oninput = () => {
          clearTimeout(this.inlineEditDebounce);
          this.inlineEditDebounce = setTimeout(() => {
            this.saveCmsElement(el);
          }, 350);
        };

        // Save immediately on blur
        el.onblur = () => {
          clearTimeout(this.inlineEditDebounce);
          this.saveCmsElement(el);
        };
      });
      alert("เปิดโหมดแก้ไขเนื้อหา: คุณสามารถคลิกข้อความใดก็ได้บนหน้าเว็บเพื่อแก้ไขโดยตรง และระบบจะบันทึกซิงค์แบบเรียลไทม์อัตโนมัติ!");
    } else {
      document.body.classList.remove("editable-active");
      if (statusText) statusText.textContent = "แก้ไขเนื้อหา (OFF)";
      clearTimeout(this.inlineEditDebounce);
      document.querySelectorAll("[data-cms-key]").forEach((el) => {
        this.saveCmsElement(el);
        el.removeAttribute("contenteditable");
        el.oninput = null;
        el.onblur = null;
      });
    }
  }

  openCMSModal(type) {
    const modal = document.getElementById("cmsStudioModal");
    const title = document.getElementById("cmsModalTitle");
    const body = document.getElementById("cmsModalBody");
    if (!modal || !body) return;

    modal.classList.add("open");

    if (type === "theme") {
      title.innerHTML = `<i class="fa-solid fa-palette"></i> ตกแต่งหน้าตาและโทนสีเว็บ (THEME STUDIO)`;
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label class="form-label">ชุดโทนสีอุ่นหลัก (TACTICAL PALETTES)</label>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px;">
              <button class="btn-dock" style="background: #C68642; color: #fff; font-weight: 700;" onclick="window.app.applyPalette('coffee'); window.app.saveData();">☕ โทนสีกาแฟ (Coffee Roast)</button>
              <button class="btn-dock" style="background: #E05A2B; color: #fff;" onclick="window.app.applyPalette('brick'); window.app.saveData();">🧱 ส้มดินเผา (Terracotta)</button>
              <button class="btn-dock" style="background: #C0392B; color: #fff;" onclick="window.app.applyAccentColor('#C0392B'); window.app.saveData();">🟥 แดงอิฐ (Deep Brick)</button>
              <button class="btn-dock" style="background: #FF9E1B; color: #000;" onclick="window.app.applyPalette('amber'); window.app.saveData();">🟡 ส้มอำพัน (Tactical Amber)</button>
              <button class="btn-dock" style="background: #D35400; color: #fff;" onclick="window.app.applyAccentColor('#D35400'); window.app.saveData();">🔥 ส้มไหม้ (Burnt Orange)</button>
            </div>
          </div>

          <div style="border-top: 1px dashed var(--border-hairline); padding-top: 1rem;">
            <label class="form-label">เอฟเฟกต์ภาพและเสียง (HUD VISUAL EFFECTS)</label>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.85rem;">
                <input type="checkbox" id="scanlineCheck" ${this.data.siteSettings.scanlinesEnabled ? "checked" : ""} onchange="window.app.toggleScanlines(this.checked)">
                เปิดใช้งานเส้นสแกน CRT (Scanlines Overlay)
              </label>
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 0.85rem;">
                <input type="checkbox" id="soundCheck" ${this.data.siteSettings.soundEnabled ? "checked" : ""} onchange="window.app.data.siteSettings.soundEnabled = this.checked; window.app.saveData();">
                เปิดเสียงเอฟเฟกต์เวลาคลิกปุ่ม (Tactical Audio Clicks)
              </label>
            </div>
          </div>
        </div>
      `;
    } else if (type === "files") {
      title.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> คลังจัดเก็บและอัปโหลดไฟล์ (UNIVERSAL ASSET MANAGER)`;
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="background: var(--bg-panel); border: 2px dashed var(--accent-primary); padding: 1.5rem; text-align: center;">
            <i class="fa-solid fa-file-arrow-up" style="font-size: 2.5rem; color: var(--accent-primary); margin-bottom: 0.5rem;"></i>
            <div style="font-size: 0.95rem; font-weight: 600; margin-bottom: 4px;">อัปโหลดไฟล์ทุกประเภท (คลิปวิดีโอ, ไฟล์เสียง, ฟอนต์, รูปภาพ, เอกสาร PDF)</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">ไฟล์จะถูกจัดเก็บในฐานข้อมูล IndexedDB ประจำเครื่องแบบถาวร ไม่จำกัดขนาด</div>
            <input type="file" id="universalAssetUploadInput" multiple onchange="window.app.handleUniversalFileUpload(event)" style="display: none;">
            <button class="btn-tactical btn-tactical-primary" onclick="document.getElementById('universalAssetUploadInput').click()">
              <i class="fa-solid fa-plus"></i> เลือกไฟล์เพื่ออัปโหลด
            </button>
          </div>

          <div>
            <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-amber); margin-bottom: 8px;">
              // รายการไฟล์ที่อัปโหลดแล้วในเครื่อง (STORED ASSETS)
            </div>
            <div id="storedAssetsList" style="display: flex; flex-direction: column; gap: 6px; max-height: 250px; overflow-y: auto;">
              กำลังโหลดรายการไฟล์...
            </div>
          </div>
        </div>
      `;
      this.refreshStoredAssetsUI();
    } else if (type === "items") {
      title.innerHTML = `<i class="fa-solid fa-plus"></i> เพิ่มรายวิชา หรือ กิจกรรมผลงานใหม่`;
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; gap: 10px;">
            <button class="btn-dock active" id="tabNewCourse" onclick="window.app.switchItemTab('course')">เพิ่มรายวิชา (New Course)</button>
            <button class="btn-dock" id="tabNewActivity" onclick="window.app.switchItemTab('activity')">เพิ่มกิจกรรม/ผลงาน (New Activity)</button>
          </div>
          <div id="newItemFormContainer"></div>
        </div>
      `;
      this.switchItemTab("course");
    } else if (type === "supabase") {
      title.innerHTML = `<i class="fa-solid fa-database"></i> ตั้งค่า SUPABASE CLOUD DATABASE`;
      const s = this.data.siteSettings.supabase || {};
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            เชื่อมต่อกับโครงการ Supabase ของคุณเพื่อซิงค์ข้อมูลโปรไฟล์ ผลงาน และรูปภาพขึ้นคลาวด์แบบ Realtime
          </p>
          <div class="form-group">
            <label class="form-label">SUPABASE PROJECT URL</label>
            <input type="text" id="supabaseUrlInput" class="form-control" placeholder="https://xyz.supabase.co" value="${s.url || ""}">
          </div>
          <div class="form-group">
            <label class="form-label">SUPABASE ANON / PUBLIC KEY</label>
            <input type="password" id="supabaseKeyInput" class="form-control" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." value="${s.anonKey || ""}">
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <button class="btn-tactical btn-tactical-primary" onclick="window.app.saveAndTestSupabase()">
              <i class="fa-solid fa-plug"></i> ทดสอบและเชื่อมต่อ Realtime
            </button>
            <button class="btn-tactical btn-tactical-ghost" onclick="window.app.syncDataToSupabase()">
              <i class="fa-solid fa-cloud-arrow-up"></i> อัปโหลดข้อมูลขึ้น Cloud
            </button>
            <button class="btn-tactical btn-tactical-ghost" onclick="window.app.loadFromSupabase().then(() => alert('ดึงข้อมูลล่าสุดจาก Supabase Cloud เรียบร้อยแล้ว!'))">
              <i class="fa-solid fa-cloud-arrow-down"></i> ดึงข้อมูลสดจาก Cloud
            </button>
          </div>
          <div id="supabaseStatusAlert" style="font-family: var(--font-mono); font-size: 0.8rem; margin-top: 6px;"></div>
        </div>
      `;
    }
  }

  closeCMSModal() {
    const modal = document.getElementById("cmsStudioModal");
    if (modal) modal.classList.remove("open");
  }

  toggleScanlines(enabled) {
    this.data.siteSettings.scanlinesEnabled = enabled;
    if (enabled) {
      document.body.classList.add("scanlines-enabled");
    } else {
      document.body.classList.remove("scanlines-enabled");
    }
    this.saveData();
  }

  async handleUniversalFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let cat = "document";
      if (file.type.startsWith("image/")) cat = "image";
      else if (file.type.startsWith("video/")) cat = "video";
      else if (file.type.startsWith("audio/")) cat = "audio";
      else if (file.name.endsWith(".ttf") || file.name.endsWith(".woff") || file.name.endsWith(".woff2")) cat = "font";

      await window.assetDB.saveAsset(file, cat);
    }

    alert(`อัปโหลดเสร็จสิ้น ${files.length} ไฟล์!`);
    this.refreshStoredAssetsUI();
  }

  async refreshStoredAssetsUI() {
    const listEl = document.getElementById("storedAssetsList");
    if (!listEl) return;

    const assets = await window.assetDB.getAllAssets();
    if (assets.length === 0) {
      listEl.innerHTML = `<div style="color: var(--text-muted); font-size: 0.8rem;">ยังไม่มีไฟล์ที่ถูกจัดเก็บในเครื่อง</div>`;
      return;
    }

    listEl.innerHTML = assets
      .map(
        (a) => `
      <div style="background: var(--bg-panel); border: 1px solid var(--border-hairline); padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
        <div>
          <span style="font-family: var(--font-mono); color: var(--accent-amber); font-weight: 700; margin-right: 8px;">[${a.category.toUpperCase()}]</span>
          <span>${a.name}</span>
          <span style="color: var(--text-muted); font-size: 0.72rem; margin-left: 6px;">(${(a.size / 1024).toFixed(1)} KB)</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn-dock" style="padding: 2px 8px; font-size: 0.7rem;" onclick="window.app.previewAssetById('${a.id}')">ดู</button>
          <button class="btn-dock" style="padding: 2px 8px; font-size: 0.7rem; color: var(--signal-rec);" onclick="window.app.deleteAssetById('${a.id}')">ลบ</button>
        </div>
      </div>
    `
      )
      .join("");
  }

  async previewAssetById(id) {
    const asset = await window.assetDB.getAsset(id);
    if (!asset) return;

    if (asset.category === "image") {
      this.openMediaModal(`<img src="${asset.data}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`);
    } else if (asset.category === "video") {
      this.openMediaModal(`<video src="${asset.data}" controls autoplay style="max-width: 100%; max-height: 100%;"></video>`);
    } else if (asset.category === "audio") {
      this.openMediaModal(`<audio src="${asset.data}" controls autoplay style="width: 80%;"></audio>`);
    } else {
      window.open(asset.data, "_blank");
    }
  }

  async deleteAssetById(id) {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้ออกจากเครื่อง?")) {
      await window.assetDB.deleteAsset(id);
      this.refreshStoredAssetsUI();
    }
  }

  switchItemTab(tab) {
    const formBox = document.getElementById("newItemFormContainer");
    const tCourse = document.getElementById("tabNewCourse");
    const tAct = document.getElementById("tabNewActivity");

    if (tab === "course") {
      tCourse.classList.add("active");
      tAct.classList.remove("active");
      formBox.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="form-group">
            <label class="form-label">รหัสวิชา (COURSE CODE)</label>
            <input type="text" id="newCourseCode" class="form-control" placeholder="เช่น EE-312" required>
          </div>
          <div class="form-group">
            <label class="form-label">ชื่อวิชา (COURSE TITLE)</label>
            <input type="text" id="newCourseTitle" class="form-control" placeholder="ชื่อรายวิชา" required>
          </div>
          <div class="form-group">
            <label class="form-label">หมวดหมู่วิชา</label>
            <select id="newCourseCat" class="form-control">
              <option value="automation">ระบบควบคุมอัตโนมัติ (Automation)</option>
              <option value="power">วิศวกรรมไฟฟ้ากำลัง (Power)</option>
              <option value="pedagogy">ครุศาสตร์อุตสาหกรรม (Pedagogy)</option>
              <option value="circuit">วงจรไฟฟ้า (Circuits)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">คำอธิบายรายวิชา</label>
            <textarea id="newCourseDesc" class="form-control" rows="2" placeholder="รายละเอียดเนื้อหาวิชา"></textarea>
          </div>
          <button class="btn-tactical btn-tactical-primary" onclick="window.app.submitNewCourse()">
            <i class="fa-solid fa-check"></i> บันทึกรายวิชาใหม่
          </button>
        </div>
      `;
    } else {
      tAct.classList.add("active");
      tCourse.classList.remove("active");
      formBox.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="form-group">
            <label class="form-label">ชื่อกิจกรรมหรือผลงาน</label>
            <input type="text" id="newActTitle" class="form-control" placeholder="เช่น รางวัลการแข่งขันหุ่นยนต์อุตสาหกรรม" required>
          </div>
          <div class="form-group">
            <label class="form-label">หมวดหมู่</label>
            <select id="newActCat" class="form-control">
              <option value="competition">แข่งขันทักษะวิชาชีพ</option>
              <option value="training">การฝึกอบรมเชิงปฏิบัติการ</option>
              <option value="community">บริการวิชาชีพสู่สังคม</option>
              <option value="music">ดนตรีและศิลปวัฒนธรรม</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">ป้ายสถานะ (BADGE)</label>
            <input type="text" id="newActBadge" class="form-control" placeholder="เช่น AWARDS & HONORS หรือ CERTIFICATION" value="ACHIEVEMENT">
          </div>
          <div class="form-group">
            <label class="form-label">ช่วงเวลาและสถานที่</label>
            <input type="text" id="newActDate" class="form-control" placeholder="เช่น กุมภาพันธ์ 2568 • มทร.อีสาน">
          </div>
          <div class="form-group">
            <label class="form-label">คำอธิบายรายละเอียด</label>
            <textarea id="newActSummary" class="form-control" rows="2" placeholder="บทบาทและผลลัพธ์ของกิจกรรม"></textarea>
          </div>
          ${this.getHTMLAttachmentBuilderUI()}
          <button class="btn-tactical btn-tactical-primary" style="margin-top: 10px;" onclick="window.app.submitNewActivity()">
            <i class="fa-solid fa-check"></i> บันทึกกิจกรรมใหม่
          </button>
        </div>
      `;
      this.initAttachmentsBuilder([]);
    }
  }

  submitNewCourse() {
    const code = document.getElementById("newCourseCode").value.trim();
    const title = document.getElementById("newCourseTitle").value.trim();
    const cat = document.getElementById("newCourseCat").value;
    const desc = document.getElementById("newCourseDesc").value.trim();

    if (!code || !title) {
      alert("โปรดระบุรหัสวิชาและชื่อวิชา");
      return;
    }

    const item = {
      id: `course_${Date.now()}`,
      code: code,
      title: title,
      category: cat,
      credits: "3 (2-2-5)",
      description: desc || "ไม่มีคำอธิบาย",
      artifacts: []
    };

    this.data.courses.unshift(item);
    this.saveData();
    this.renderCourses(this.currentCourseFilter || "all");
    this.closeCMSModal();
    alert("เพิ่มรายวิชาสำเร็จแล้ว!");
  }

  submitNewActivity() {
    const title = document.getElementById("newActTitle").value.trim();
    const cat = document.getElementById("newActCat").value;
    const badge = (document.getElementById("newActBadge")?.value.trim()) || "ACHIEVEMENT";
    const date = document.getElementById("newActDate").value.trim();
    const summary = document.getElementById("newActSummary").value.trim();

    if (!title) {
      alert("โปรดระบุชื่อกิจกรรม/ผลงาน");
      return;
    }

    const atts = (this.currentEditingAttachments || []).filter(a => a.url || a.name);
    const coverImg = atts.find(a => a.type === "image")?.url || "";

    const item = {
      id: `act_${Date.now()}`,
      title: title,
      category: cat,
      date: date || "ปีการศึกษา 2568",
      badge: badge,
      summary: summary || "รายละเอียดกิจกรรม",
      imageUrl: coverImg,
      attachments: atts
    };

    this.data.activities.unshift(item);
    this.saveData();
    this.renderActivities(this.currentActivityFilter || "all");
    this.closeCMSModal();
    this.playTacticalBeep(900, "triangle", 0.08);
    alert("เพิ่มกิจกรรม/ผลงานสำเร็จแล้ว!");
  }

  exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `thanaphat-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  openMediaModal(contentHtml) {
    const modal = document.getElementById("mediaPlayerModal");
    const container = document.getElementById("mediaModalContainer");
    if (!modal || !container) return;
    container.innerHTML = contentHtml;
    modal.classList.add("open");
  }

  closeMediaModal() {
    const modal = document.getElementById("mediaPlayerModal");
    const container = document.getElementById("mediaModalContainer");
    if (container) container.innerHTML = "";
    if (modal) modal.classList.remove("open");
  }

  previewArtifact(name, url) {
    if (url) {
      window.open(url, "_blank");
    } else {
      this.openMediaModal(`
        <div style="padding: 2rem; text-align: center; color: var(--text-primary); font-family: var(--font-mono);">
          <i class="fa-solid fa-file-circle-check" style="font-size: 3rem; color: var(--accent-primary); margin-bottom: 1rem;"></i>
          <h3>${name}</h3>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">
            ชิ้นงานนี้ถูกจัดเก็บในสารบบเอกสารวิชาชีพ คุณสามารถอัปโหลดไฟล์จริงเพื่อเชื่อมโยงผ่าน CMS ไฟล์เมเนเจอร์ได้ตลอดเวลา
          </p>
        </div>
      `);
    }
  }

  exportMasterDataJs() {
    const cleanData = JSON.parse(JSON.stringify(this.data));
    const jsContent = `// Data store for Thanaphat Inchuwong Portfolio\n// Auto-synced with localStorage, IndexedDB, and Supabase\n\nconst DEFAULT_PORTFOLIO_DATA = ${JSON.stringify(cleanData, null, 2)};\n\nwindow.DEFAULT_PORTFOLIO_DATA = DEFAULT_PORTFOLIO_DATA;\n`;
    const blob = new Blob([jsContent], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.playTacticalBeep(920, "triangle", 0.1);
    alert("ระบบสร้างและดาวน์โหลดไฟล์ data.js สำเร็จเรียบร้อยแล้ว!\n(คุณสามารถนำไฟล์นี้ไปวางทับ data.js ในโฟลเดอร์โครงการเพื่อใช้เป็นข้อมูลเริ่มต้นได้ทันที)");
  }

  importDataJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && (imported.profile || imported.courses)) {
          this.data = imported;
          this.saveData();
          this.renderAll();
          this.playTacticalBeep(950, "sine", 0.12);
          alert("นำเข้าข้อมูลและอัปเดตระบบเรียลไทม์สำเร็จเรียบร้อยแล้ว!");
        } else {
          alert("รูปแบบไฟล์ JSON ไม่ถูกต้อง");
        }
      } catch (err) {
        alert("ไม่สามารถอ่านไฟล์ JSON ได้: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  async initSupabase() {
    const s = this.data.siteSettings.supabase;
    if (s && s.url && s.anonKey && window.supabase) {
      try {
        this.supabaseClient = window.supabase.createClient(s.url, s.anonKey);
        this.updateStatusTelemetry("SUPABASE: CONNECTED");
        await this.loadFromSupabase();
        this.setupSupabaseRealtime();
      } catch (e) {
        console.warn("Supabase init error:", e);
      }
    }
  }

  setupSupabaseRealtime() {
    if (!this.supabaseClient || this.supabaseRealtimeChannel) return;
    try {
      this.supabaseRealtimeChannel = this.supabaseClient
        .channel("public:portfolio_data")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "portfolio_data" },
          (payload) => {
            console.log("[Supabase Realtime] Cloud change notification received:", payload);
            if (payload.new && payload.new.payload) {
              const remoteData = payload.new.payload;
              this.data = remoteData;
              localStorage.setItem(this.storageKey, JSON.stringify(this.data));
              this.renderAll();
              this.updateStatusTelemetry("SUPABASE: REALTIME_LIVE");
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("[Supabase Realtime] Successfully subscribed to realtime changes");
            this.updateStatusTelemetry("SUPABASE: REALTIME_LIVE");
          }
        });
    } catch (e) {
      console.warn("Supabase Realtime setup warning:", e);
    }
  }

  async loadFromSupabase() {
    if (!this.supabaseClient) return;
    try {
      const { data, error } = await this.supabaseClient
        .from("portfolio_data")
        .select("payload, updated_at")
        .eq("id", "main_data")
        .single();

      if (error) {
        console.warn("Supabase load fallback:", error.message);
        return;
      }

      if (data && data.payload) {
        console.log("[Supabase] Synced latest portfolio data from Cloud");
        const defaultQuickCards = (window.DEFAULT_PORTFOLIO_DATA && Array.isArray(window.DEFAULT_PORTFOLIO_DATA.quickCards) && window.DEFAULT_PORTFOLIO_DATA.quickCards.length > 0)
          ? window.DEFAULT_PORTFOLIO_DATA.quickCards
          : DEFAULT_QUICK_CARDS;

        this.data = {
          ...window.DEFAULT_PORTFOLIO_DATA,
          ...data.payload,
          profile: { ...(window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.profile), ...(data.payload.profile || {}) },
          siteSettings: { ...(window.DEFAULT_PORTFOLIO_DATA && window.DEFAULT_PORTFOLIO_DATA.siteSettings), ...(data.payload.siteSettings || {}) },
          quickCards: (Array.isArray(data.payload.quickCards) && data.payload.quickCards.length > 0)
            ? data.payload.quickCards
            : (Array.isArray(this.data.quickCards) && this.data.quickCards.length > 0 ? this.data.quickCards : JSON.parse(JSON.stringify(defaultQuickCards)))
        };
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        this.renderAll();
        this.updateStatusTelemetry("SUPABASE: CLOUD_SYNCED");
      }
    } catch (e) {
      console.warn("Failed to load from Supabase:", e);
    }
  }

  async saveAndTestSupabase() {
    const url = document.getElementById("supabaseUrlInput").value.trim();
    const key = document.getElementById("supabaseKeyInput").value.trim();
    const alertBox = document.getElementById("supabaseStatusAlert");

    if (!url || !key) {
      alertBox.innerHTML = `<span style="color: var(--signal-rec);">โปรดกรอกทั้ง URL และ Anon Key</span>`;
      return;
    }

    try {
      alertBox.innerHTML = `<span style="color: var(--accent-amber);">กำลังทดสอบการเชื่อมต่อ...</span>`;
      const client = window.supabase.createClient(url, key);
      this.supabaseClient = client;
      this.data.siteSettings.supabase = { url, anonKey: key, enabled: true, lastSync: new Date().toISOString() };
      this.saveData();
      this.setupSupabaseRealtime();

      alertBox.innerHTML = `<span style="color: var(--signal-online);"><i class="fa-solid fa-check"></i> เชื่อมต่อ Supabase สำเร็จแล้ว! พร้อมซิงค์สด Realtime</span>`;
    } catch (e) {
      alertBox.innerHTML = `<span style="color: var(--signal-rec);">เชื่อมต่อไม่สำเร็จ: ${e.message}</span>`;
    }
  }

  async syncDataToSupabase() {
    if (!this.supabaseClient) {
      alert("โปรดตั้งค่าและทดสอบการเชื่อมต่อ Supabase ก่อนทำการซิงค์");
      return;
    }
    const alertBox = document.getElementById("supabaseStatusAlert");
    alertBox.innerHTML = `<span style="color: var(--accent-amber);">กำลังอัปโหลดข้อมูลทั้งหมดขึ้น Cloud...</span>`;

    try {
      const { error } = await this.supabaseClient
        .from("portfolio_data")
        .upsert({ id: "main_data", payload: this.data, updated_at: new Date() });

      if (error) throw error;
      alertBox.innerHTML = `<span style="color: var(--signal-online);"><i class="fa-solid fa-cloud-arrow-up"></i> ซิงค์ข้อมูลขึ้น Supabase สำเร็จเรียบร้อย!</span>`;
    } catch (e) {
      alertBox.innerHTML = `<span style="color: var(--signal-rec);">ซิงค์ล้มเหลว: ${e.message} (สร้างตาราง portfolio_data ใน Supabase ก่อนซิงค์)</span>`;
    }
  }

  updateStatusTelemetry(msg = null) {
    const dbStatus = document.getElementById("footerDbStatus");
    if (dbStatus) {
      dbStatus.textContent = msg || (this.supabaseClient ? "SUPABASE_CLOUD: SYNCED" : "INDEXED_DB + LOCAL");
    }
  }

  // --- Secret Green Trigger (3 Clicks) ---
  setupSecretGreenTrigger() {
    let clickCount = 0;
    let clickTimer = null;

    document.addEventListener("click", (e) => {
      const trigger = e.target.closest(".secret-green-trigger") || (e.target.classList && e.target.classList.contains("text-green") ? e.target : null);
      if (!trigger) return;

      clickCount++;
      this.playTacticalBeep(650 + (clickCount * 180), "triangle", 0.04);

      trigger.classList.remove("secret-trigger-pulse");
      void trigger.offsetWidth; // re-flow
      trigger.classList.add("secret-trigger-pulse");

      if (clickTimer) clearTimeout(clickTimer);

      if (clickCount >= 3) {
        clickCount = 0;
        this.playTacticalBeep(1250, "sine", 0.16);
        if (sessionStorage.getItem(this.authKey) === "authenticated") {
          alert("โหมดผู้ดูแลระบบ (ADMIN) กำลังทำงานอยู่แล้ว!");
          const dock = document.getElementById("adminDock");
          if (dock) dock.scrollIntoView({ behavior: "smooth" });
        } else {
          this.openLoginModal();
        }
      } else {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 1200);
      }
    });
  }

  // --- Profile Content Pane Reordering & Drag & Drop ---
  initProfilePaneOrdering() {
    if (!this.data.profile.paneOrder) {
      this.data.profile.paneOrder = ["bio", "skills", "music"];
    }
    this.applyProfilePaneOrder();
    this.setupProfilePaneDragAndDrop();
  }

  applyProfilePaneOrder() {
    const pane = document.querySelector(".profile-content-pane");
    if (!pane) return;
    const order = this.data.profile.paneOrder || ["bio", "skills", "music"];

    order.forEach((id) => {
      const el = pane.querySelector(`[data-pane-id="${id}"]`);
      if (el) pane.appendChild(el);
    });
  }

  moveProfileCard(paneId, direction) {
    if (!this.data.profile.paneOrder) {
      this.data.profile.paneOrder = ["bio", "skills", "music"];
    }
    const order = [...this.data.profile.paneOrder];
    const idx = order.indexOf(paneId);
    if (idx === -1) return;

    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= order.length) return;

    const temp = order[idx];
    order[idx] = order[targetIdx];
    order[targetIdx] = temp;

    this.data.profile.paneOrder = order;
    this.saveData();
    this.applyProfilePaneOrder();
    this.playTacticalBeep(780, "sine", 0.05);
  }

  setupProfilePaneDragAndDrop() {
    const pane = document.querySelector(".profile-content-pane");
    if (!pane) return;

    const isAdmin = document.body.classList.contains("admin-mode");
    const cards = pane.querySelectorAll("[data-pane-id]");
    cards.forEach((card) => {
      if (isAdmin) {
        card.setAttribute("draggable", "true");
      } else {
        card.removeAttribute("draggable");
      }

      if (!card._dragInitialized) {
        card._dragInitialized = true;

        card.addEventListener("dragstart", (e) => {
          if (!document.body.classList.contains("admin-mode")) {
            e.preventDefault();
            return;
          }
          e.dataTransfer.setData("text/plain", card.getAttribute("data-pane-id"));
          card.classList.add("pane-dragging");
        });

        card.addEventListener("dragend", () => {
          card.classList.remove("pane-dragging");
          pane.querySelectorAll("[data-pane-id]").forEach((c) => c.classList.remove("pane-drag-over"));
        });

        card.addEventListener("dragover", (e) => {
          if (!document.body.classList.contains("admin-mode")) return;
          e.preventDefault();
          card.classList.add("pane-drag-over");
        });

        card.addEventListener("dragleave", () => {
          card.classList.remove("pane-drag-over");
        });

        card.addEventListener("drop", (e) => {
          if (!document.body.classList.contains("admin-mode")) return;
          e.preventDefault();
          card.classList.remove("pane-drag-over");
          const sourceId = e.dataTransfer.getData("text/plain");
          const targetId = card.getAttribute("data-pane-id");
          if (!sourceId || !targetId || sourceId === targetId) return;

          const order = [...(this.data.profile.paneOrder || ["bio", "skills", "music"])];
          const srcIdx = order.indexOf(sourceId);
          const tgtIdx = order.indexOf(targetId);
          if (srcIdx > -1 && tgtIdx > -1) {
            order.splice(srcIdx, 1);
            order.splice(tgtIdx, 0, sourceId);
            this.data.profile.paneOrder = order;
            this.saveData();
            this.applyProfilePaneOrder();
            this.playTacticalBeep(850, "sine", 0.06);
          }
        });
      }
    });
  }

  // --- Super-Easy Attachments & Multi-Media Manager ---
  initAttachmentsBuilder(initialList = []) {
    this.currentEditingAttachments = JSON.parse(JSON.stringify(initialList || []));
    this.renderEasyAttachmentUI();
  }

  renderAttachmentRows() {
    this.renderEasyAttachmentUI();
  }

  getHTMLAttachmentBuilderUI() {
    return `
      <div class="attachment-builder-box">
        <div class="attachment-builder-head">
          <label class="form-label" style="margin: 0; font-weight: 700; color: var(--accent-amber);">
            <i class="fa-solid fa-paperclip"></i> ไฟล์แนบ & สื่อประกอบ (อัปโหลดได้หลายไฟล์พร้อมกัน)
          </label>
          <div id="attCountSummary" style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">
            0 รายการ
          </div>
        </div>

        <!-- Quick Action Buttons -->
        <div class="attachment-quick-buttons">
          <button type="button" class="btn-quick-upload btn-image-upload" onclick="document.getElementById('batchImageFileInput').click()" title="เลือกรูปภาพได้หลายรูปพร้อมกัน">
            <i class="fa-solid fa-images"></i> 📷 + เลือกรูปภาพ (หลายรูป)
          </button>
          <input type="file" id="batchImageFileInput" accept="image/*" multiple style="display: none;" onchange="window.app.handleBatchImageSelect(this.files)">

          <button type="button" class="btn-quick-upload btn-pdf-upload" onclick="document.getElementById('batchPdfFileInput').click()" title="เลือกไฟล์ PDF ได้หลายไฟล์พร้อมกัน">
            <i class="fa-solid fa-file-pdf"></i> 📄 + เลือกไฟล์ PDF (หลายไฟล์)
          </button>
          <input type="file" id="batchPdfFileInput" accept="application/pdf" multiple style="display: none;" onchange="window.app.handleBatchPdfSelect(this.files)">

          <button type="button" class="btn-quick-upload btn-yt-upload" onclick="window.app.toggleYouTubeInputBar()" title="เพิ่มคลิปวิดีโอจาก YouTube">
            <i class="fa-brands fa-youtube"></i> 🎥 + ลิงก์ YouTube
          </button>

          <button type="button" class="btn-quick-upload btn-url-upload" onclick="window.app.toggleUrlInputBar()" title="ใส่ลิงก์รูปภาพหรือไฟล์จาก URL ตรง">
            <i class="fa-solid fa-link"></i> 🌐 + ใส่ลิงก์ URL ตรง
          </button>
        </div>

        <!-- YouTube Quick Input Bar -->
        <div id="youtubeInputBar" class="quick-input-bar" style="display: none;">
          <i class="fa-brands fa-youtube" style="color: #ff5252; font-size: 1.2rem;"></i>
          <input type="text" id="quickYtUrl" class="form-control" style="font-size: 0.8rem;" placeholder="วางลิงก์ YouTube ที่นี่ (เช่น https://youtu.be/... หรือ https://www.youtube.com/watch?v=...)">
          <button type="button" class="btn-quick-upload btn-yt-upload" style="white-space: nowrap;" onclick="window.app.addYouTubeAttachmentFromBar()">
            + เพิ่มคลิป
          </button>
          <button type="button" class="btn-doc-del" onclick="window.app.toggleYouTubeInputBar(false)">✕</button>
        </div>

        <!-- Direct URL Quick Input Bar -->
        <div id="urlInputBar" class="quick-input-bar" style="display: none;">
          <i class="fa-solid fa-globe" style="color: var(--accent-amber); font-size: 1.1rem;"></i>
          <input type="text" id="quickDirectUrl" class="form-control" style="font-size: 0.8rem;" placeholder="วาง URL ลิงก์ตรง เช่น https://... (รูปภาพ หรือ PDF)">
          <input type="text" id="quickDirectName" class="form-control" style="font-size: 0.8rem; max-width: 180px;" placeholder="ชื่อ/คำอธิบาย (ไม่บังคับ)">
          <button type="button" class="btn-quick-upload" style="white-space: nowrap;" onclick="window.app.addUrlAttachmentFromBar()">
            + เพิ่ม
          </button>
          <button type="button" class="btn-doc-del" onclick="window.app.toggleUrlInputBar(false)">✕</button>
        </div>

        <!-- Drag & Drop Dropzone -->
        <div class="super-dropzone" id="attSuperDropzone" 
             ondragover="window.app.handleDropzoneDragOver(event)" 
             ondragleave="window.app.handleDropzoneDragLeave(event)" 
             ondrop="window.app.handleDropzoneDrop(event)"
             onclick="document.getElementById('batchImageFileInput').click()">
          <i class="fa-solid fa-cloud-arrow-up"></i>
          <div class="dropzone-text">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์รูปภาพ / PDF จากคอมพิวเตอร์มาวางตรงนี้ได้ทันที</div>
          <div class="dropzone-sub">สามารถเลือกหลายไฟล์พร้อมกันได้เลย (รองรับ JPG, PNG, WEBP, PDF)</div>
        </div>

        <!-- Visual Previews List & Grid -->
        <div id="attachmentDisplayArea"></div>
      </div>
    `;
  }

  renderEasyAttachmentUI() {
    const displayArea = document.getElementById("attachmentDisplayArea");
    const countSummary = document.getElementById("attCountSummary");
    if (!displayArea) return;

    const list = this.currentEditingAttachments || [];
    const imgAtts = list.filter(a => a.type === "image");
    const pdfAtts = list.filter(a => a.type === "pdf");
    const ytAtts = list.filter(a => a.type === "youtube");

    if (countSummary) {
      countSummary.innerHTML = `ไฟล์แนบทั้งหมด: <strong>${list.length}</strong> (รูปภาพ: ${imgAtts.length}, PDF: ${pdfAtts.length}, YouTube: ${ytAtts.length})`;
    }

    if (list.length === 0) {
      displayArea.innerHTML = `
        <div style="font-size: 0.78rem; color: var(--text-muted); text-align: center; padding: 10px; border: 1px dashed var(--border-hairline); border-radius: 4px;">
          ยังไม่มีไฟล์แนบ — คลิกปุ่มด้านบน หรือลากไฟล์มาวางที่กล่องด้านบนได้เลย
        </div>
      `;
      return;
    }

    let html = "";

    // 1. Image Thumbnails Grid
    if (imgAtts.length > 0) {
      html += `
        <div style="margin-top: 6px;">
          <div style="font-family: var(--font-mono); font-size: 0.74rem; color: #64b5f6; font-weight: 700; margin-bottom: 4px;">
            <i class="fa-solid fa-images"></i> รูปภาพประกอบ (${imgAtts.length})
          </div>
          <div class="attachment-gallery-grid">
            ${imgAtts.map((att) => {
              const globalIdx = list.indexOf(att);
              return `
                <div class="preview-thumb-card" title="${this.escapeHtml(att.name || 'รูปภาพ')}">
                  <img src="${att.url}" alt="${this.escapeHtml(att.name || '')}">
                  <div class="preview-thumb-caption">${this.escapeHtml(att.name || 'รูปภาพ')}</div>
                  <button type="button" class="btn-thumb-del" onclick="window.app.removeAttachment(${globalIdx})" title="ลบรูปนี้">✕</button>
                  <div class="preview-thumb-order">
                    <button type="button" class="btn-thumb-arrow" onclick="window.app.moveAttachment(${globalIdx}, -1)" title="เลื่อนซ้าย">◀</button>
                    <button type="button" class="btn-thumb-arrow" onclick="window.app.moveAttachment(${globalIdx}, 1)" title="เลื่อนขวา">▶</button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    // 2. Documents & Videos List
    if (pdfAtts.length > 0 || ytAtts.length > 0) {
      html += `
        <div style="margin-top: 10px;">
          <div style="font-family: var(--font-mono); font-size: 0.74rem; color: var(--text-secondary); font-weight: 700; margin-bottom: 4px;">
            <i class="fa-solid fa-paperclip"></i> เอกสารและคลิปวิดีโอ (${pdfAtts.length + ytAtts.length})
          </div>
          <div class="attachment-files-list">
            ${pdfAtts.map((att) => {
              const globalIdx = list.indexOf(att);
              return `
                <div class="doc-item-row">
                  <div class="doc-item-left">
                    <i class="fa-solid fa-file-pdf" style="color: #ef5350; font-size: 1.1rem;"></i>
                    <span class="doc-item-title">${this.escapeHtml(att.name || 'เอกสาร PDF')}</span>
                  </div>
                  <div class="doc-item-actions">
                    <button type="button" class="btn-dock" style="font-size: 0.7rem; padding: 2px 8px;" onclick="window.app.openPdfModal('${encodeURIComponent(att.url)}', '${encodeURIComponent(att.name || 'PDF')}')">
                      เปิดดู
                    </button>
                    <button type="button" class="btn-thumb-arrow" style="position: static; width: 22px; height: 22px;" onclick="window.app.moveAttachment(${globalIdx}, -1)" title="เลื่อนขึ้น">▲</button>
                    <button type="button" class="btn-thumb-arrow" style="position: static; width: 22px; height: 22px;" onclick="window.app.moveAttachment(${globalIdx}, 1)" title="เลื่อนลง">▼</button>
                    <button type="button" class="btn-doc-del" onclick="window.app.removeAttachment(${globalIdx})" title="ลบไฟล์นี้">✕</button>
                  </div>
                </div>
              `;
            }).join("")}

            ${ytAtts.map((att) => {
              const globalIdx = list.indexOf(att);
              const ytId = this.parseYouTubeVideoId(att.url);
              const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : "";
              return `
                <div class="doc-item-row">
                  <div class="doc-item-left">
                    <i class="fa-brands fa-youtube" style="color: #ff5252; font-size: 1.1rem;"></i>
                    ${ytThumb ? `<img src="${ytThumb}" style="width: 32px; height: 20px; object-fit: cover; border-radius: 2px;">` : ''}
                    <span class="doc-item-title">${this.escapeHtml(att.name || 'คลิปวิดีโอ YouTube')}</span>
                  </div>
                  <div class="doc-item-actions">
                    <button type="button" class="btn-dock" style="font-size: 0.7rem; padding: 2px 8px;" onclick="window.app.openYouTubeModal('${encodeURIComponent(att.url)}', '${encodeURIComponent(att.name || 'วิดีโอ')}')">
                      เล่นคลิป
                    </button>
                    <button type="button" class="btn-thumb-arrow" style="position: static; width: 22px; height: 22px;" onclick="window.app.moveAttachment(${globalIdx}, -1)" title="เลื่อนขึ้น">▲</button>
                    <button type="button" class="btn-thumb-arrow" style="position: static; width: 22px; height: 22px;" onclick="window.app.moveAttachment(${globalIdx}, 1)" title="เลื่อนลง">▼</button>
                    <button type="button" class="btn-doc-del" onclick="window.app.removeAttachment(${globalIdx})" title="ลบวิดีโอนี้">✕</button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      `;
    }

    displayArea.innerHTML = html;
  }

  async handleBatchImageSelect(fileList) {
    if (!fileList || fileList.length === 0) return;
    if (!this.currentEditingAttachments) this.currentEditingAttachments = [];

    const files = Array.from(fileList);
    for (const file of files) {
      try {
        const dataUrl = await this.readFileAsDataURL(file);
        this.currentEditingAttachments.push({
          id: `att_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          type: "image",
          name: file.name,
          url: dataUrl
        });
      } catch (err) {
        console.error("Failed to read image file:", err);
      }
    }

    this.renderEasyAttachmentUI();
    this.playTacticalBeep(980, "sine", 0.08);
    const inp = document.getElementById("batchImageFileInput");
    if (inp) inp.value = "";
  }

  async handleBatchPdfSelect(fileList) {
    if (!fileList || fileList.length === 0) return;
    if (!this.currentEditingAttachments) this.currentEditingAttachments = [];

    const files = Array.from(fileList);
    for (const file of files) {
      try {
        const dataUrl = await this.readFileAsDataURL(file);
        this.currentEditingAttachments.push({
          id: `att_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          type: "pdf",
          name: file.name,
          url: dataUrl
        });
      } catch (err) {
        console.error("Failed to read PDF file:", err);
      }
    }

    this.renderEasyAttachmentUI();
    this.playTacticalBeep(920, "sine", 0.08);
    const inp = document.getElementById("batchPdfFileInput");
    if (inp) inp.value = "";
  }

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  handleDropzoneDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById("attSuperDropzone");
    if (dropzone) dropzone.classList.add("drag-over");
  }

  handleDropzoneDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById("attSuperDropzone");
    if (dropzone) dropzone.classList.remove("drag-over");
  }

  async handleDropzoneDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById("attSuperDropzone");
    if (dropzone) dropzone.classList.remove("drag-over");

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const imgFiles = [];
    const pdfFiles = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith("image/")) {
        imgFiles.push(f);
      } else if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
        pdfFiles.push(f);
      }
    }

    if (imgFiles.length > 0) {
      await this.handleBatchImageSelect(imgFiles);
    }
    if (pdfFiles.length > 0) {
      await this.handleBatchPdfSelect(pdfFiles);
    }
  }

  toggleYouTubeInputBar(show = null) {
    const bar = document.getElementById("youtubeInputBar");
    if (!bar) return;
    if (show === null) {
      bar.style.display = bar.style.display === "none" ? "flex" : "none";
    } else {
      bar.style.display = show ? "flex" : "none";
    }
    if (bar.style.display === "flex") {
      const inp = document.getElementById("quickYtUrl");
      if (inp) inp.focus();
    }
  }

  addYouTubeAttachmentFromBar() {
    const inp = document.getElementById("quickYtUrl");
    if (!inp) return;
    const url = inp.value.trim();
    if (!url) {
      alert("กรุณาวางลิงก์ YouTube");
      return;
    }

    if (!this.currentEditingAttachments) this.currentEditingAttachments = [];
    const ytId = this.parseYouTubeVideoId(url);
    this.currentEditingAttachments.push({
      id: `att_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      type: "youtube",
      name: ytId ? `YouTube คลิป (${ytId})` : "คลิปวิดีโอ YouTube",
      url: url
    });

    inp.value = "";
    this.toggleYouTubeInputBar(false);
    this.renderEasyAttachmentUI();
    this.playTacticalBeep(1100, "sine", 0.08);
  }

  toggleUrlInputBar(show = null) {
    const bar = document.getElementById("urlInputBar");
    if (!bar) return;
    if (show === null) {
      bar.style.display = bar.style.display === "none" ? "flex" : "none";
    } else {
      bar.style.display = show ? "flex" : "none";
    }
    if (bar.style.display === "flex") {
      const inp = document.getElementById("quickDirectUrl");
      if (inp) inp.focus();
    }
  }

  addUrlAttachmentFromBar() {
    const inpUrl = document.getElementById("quickDirectUrl");
    const inpName = document.getElementById("quickDirectName");
    if (!inpUrl) return;
    const url = inpUrl.value.trim();
    if (!url) {
      alert("กรุณากรอก URL ลิงก์ตรง");
      return;
    }

    let type = "image";
    const lower = url.toLowerCase();
    if (lower.includes(".pdf")) type = "pdf";
    else if (lower.includes("youtube.com") || lower.includes("youtu.be")) type = "youtube";

    const name = inpName && inpName.value.trim() ? inpName.value.trim() : (type === "pdf" ? "เอกสาร PDF" : (type === "youtube" ? "วิดีโอ" : "รูปภาพประกอบ"));

    if (!this.currentEditingAttachments) this.currentEditingAttachments = [];
    this.currentEditingAttachments.push({
      id: `att_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      type: type,
      name: name,
      url: url
    });

    inpUrl.value = "";
    if (inpName) inpName.value = "";
    this.toggleUrlInputBar(false);
    this.renderEasyAttachmentUI();
    this.playTacticalBeep(950, "sine", 0.06);
  }

  moveAttachment(index, direction) {
    if (!this.currentEditingAttachments) return;
    const target = index + direction;
    if (target < 0 || target >= this.currentEditingAttachments.length) return;
    const temp = this.currentEditingAttachments[index];
    this.currentEditingAttachments[index] = this.currentEditingAttachments[target];
    this.currentEditingAttachments[target] = temp;
    this.renderEasyAttachmentUI();
  }

  removeAttachment(index) {
    if (!this.currentEditingAttachments) return;
    this.currentEditingAttachments.splice(index, 1);
    this.renderEasyAttachmentUI();
    this.playTacticalBeep(400, "sine", 0.04);
  }

  // --- YouTube & Lightbox Modals ---
  parseYouTubeVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = String(url).match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  getYouTubeEmbedUrl(url) {
    const id = this.parseYouTubeVideoId(url);
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  openGalleryModal(actIdOrList, startIndex = 0) {
    let images = [];
    if (typeof actIdOrList === "string") {
      const act = this.data.activities.find(a => a.id === actIdOrList);
      if (act) {
        const atts = act.attachments || [];
        images = atts.filter(a => a.type === "image" && a.url);
        if (images.length === 0 && act.imageUrl) {
          images = [{ id: 'main', type: 'image', name: act.title, url: act.imageUrl }];
        }
      }
    } else if (Array.isArray(actIdOrList)) {
      images = actIdOrList;
    }

    if (!images || images.length === 0) {
      alert("ไม่มีรูปภาพในรายการนี้");
      return;
    }

    this.activeGallery = {
      images: images,
      currentIndex: Math.max(0, Math.min(startIndex, images.length - 1))
    };

    this.renderGalleryModalContent();
    this.playTacticalBeep(880, "sine", 0.05);
  }

  renderGalleryModalContent() {
    if (!this.activeGallery || !this.activeGallery.images.length) return;
    const { images, currentIndex } = this.activeGallery;
    const curImg = images[currentIndex];

    const contentHtml = `
      <div class="gallery-viewer-frame">
        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-hairline); padding-bottom: 8px;">
          <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--accent-amber); font-weight: 700;">
            <i class="fa-solid fa-camera"></i> ${this.escapeHtml(curImg.name || 'รูปภาพ')}
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">
            [ ${currentIndex + 1} / ${images.length} ]
          </div>
        </div>

        <img src="${curImg.url}" alt="${this.escapeHtml(curImg.name || '')}" class="gallery-main-img">

        <div class="gallery-nav-bar">
          <button type="button" class="btn-gallery-nav" onclick="window.app.stepGallery(-1)" ${images.length <= 1 ? 'disabled style="opacity:0.4;"' : ''}>
            <i class="fa-solid fa-chevron-left"></i> ก่อนหน้า (Prev)
          </button>
          <a href="${curImg.url}" target="_blank" download class="btn-dock" style="font-size: 0.78rem;">
            <i class="fa-solid fa-download"></i> ดาวน์โหลดรูปภาพ
          </a>
          <button type="button" class="btn-gallery-nav" onclick="window.app.stepGallery(1)" ${images.length <= 1 ? 'disabled style="opacity:0.4;"' : ''}>
            ถัดไป (Next) <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    `;

    this.openMediaModal(contentHtml);
  }

  stepGallery(direction) {
    if (!this.activeGallery || !this.activeGallery.images.length) return;
    const count = this.activeGallery.images.length;
    this.activeGallery.currentIndex = (this.activeGallery.currentIndex + direction + count) % count;
    this.renderGalleryModalContent();
    this.playTacticalBeep(700, "sine", 0.03);
  }

  openPdfModal(rawUrl, rawTitle) {
    const url = decodeURIComponent(rawUrl);
    const title = decodeURIComponent(rawTitle || "เอกสาร PDF");
    this.openMediaModal(`
      <div style="display: flex; flex-direction: column; gap: 10px; width: 90vw; max-width: 950px; height: 80vh;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-hairline); padding-bottom: 8px;">
          <span style="font-family: var(--font-mono); color: var(--accent-amber); font-weight: 700;">
            <i class="fa-solid fa-file-pdf" style="color: #ef5350;"></i> ${this.escapeHtml(title)}
          </span>
          <div style="display: flex; gap: 8px;">
            <a href="${url}" target="_blank" download class="btn-dock" style="font-size: 0.75rem;"><i class="fa-solid fa-download"></i> ดาวน์โหลด PDF</a>
            <a href="${url}" target="_blank" class="btn-dock" style="font-size: 0.75rem;"><i class="fa-solid fa-arrow-up-right-from-square"></i> เปิดแท็บใหม่</a>
          </div>
        </div>
        <iframe src="${url}" style="width: 100%; height: 100%; border: 1px solid var(--border-hairline); background: #222;" title="${this.escapeHtml(title)}"></iframe>
      </div>
    `);
    this.playTacticalBeep(880, "sine", 0.05);
  }

  openYouTubeModal(rawUrl, rawTitle) {
    const url = decodeURIComponent(rawUrl);
    const title = decodeURIComponent(rawTitle || "คลิปวิดีโอ YouTube");
    const videoId = this.parseYouTubeVideoId(url);
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;

    this.openMediaModal(`
      <div style="width: 90vw; max-width: 850px; display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-hairline); padding-bottom: 8px;">
          <span style="font-family: var(--font-mono); color: var(--accent-amber); font-weight: 700;">
            <i class="fa-brands fa-youtube" style="color: #ff5252;"></i> ${this.escapeHtml(title)}
          </span>
          <a href="${url}" target="_blank" class="btn-dock" style="font-size: 0.75rem;"><i class="fa-solid fa-arrow-up-right-from-square"></i> เปิดใน YouTube</a>
        </div>
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border: 1px solid var(--border-hairline);">
          <iframe src="${embedUrl}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"></iframe>
        </div>
      </div>
    `);
    this.playTacticalBeep(880, "sine", 0.05);
  }

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new PortfolioApp();
  window.openQuickCardModal = (id) => window.app?.openQuickCardModal(id);
  window.resetDefaultQuickCards = () => window.app?.resetDefaultQuickCards();
  window.exportMasterDataJs = () => window.app?.exportMasterDataJs();
  window.importDataJSON = (file) => window.app?.importDataJSON(file);
});