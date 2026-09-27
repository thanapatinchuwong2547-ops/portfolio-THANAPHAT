/**
 * Tactical Industrial HUD Portfolio - Core Engine
 * Thanaphat Inchuwong (นายธนภัทร อินทร์ชูวงศ์)
 * RMUTI Khon Kaen Campus // Electrical Industrial Education
 */

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
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with defaults to ensure all fields exist
        return {
          ...window.DEFAULT_PORTFOLIO_DATA,
          ...parsed,
          profile: { ...window.DEFAULT_PORTFOLIO_DATA.profile, ...(parsed.profile || {}) },
          siteSettings: { ...window.DEFAULT_PORTFOLIO_DATA.siteSettings, ...(parsed.siteSettings || {}) }
        };
      }
    } catch (e) {
      console.warn("Could not parse saved portfolio data, using defaults:", e);
    }
    return JSON.parse(JSON.stringify(window.DEFAULT_PORTFOLIO_DATA));
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      this.updateStatusTelemetry();
    } catch (e) {
      console.error("Failed to save data locally:", e);
    }
  }

  init() {
    this.applyTheme(this.data.siteSettings.theme || "dark");
    this.applyAccentColor(this.data.siteSettings.accentColor || "#E05A2B");
    this.initAudioContext();
    this.setupEventListeners();
    this.renderAll();
    this.startTimecodeTicker();
    this.renderSegmentedBars();
    this.renderCadBlueprint();
    this.initSupabase();

    // Check if user was already logged in this session
    if (sessionStorage.getItem(this.authKey) === "authenticated") {
      this.activateAdminMode();
    }
  }

  // Web Audio Context initialization
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

  // Guitar / Bass Plucked String Audio Synthesizer
  playSynthNote(freq, noteName = "") {
    this.ensureAudio();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Dual oscillator for rich plucked string harmonics
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 1.002, now); // slight chorus detune

    // Warm resonant lowpass filter envelope
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(Math.min(freq * 8, 3500), now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 1.2);
    filter.Q.value = 3;

    // Pluck amplitude envelope
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
      { f: 82.41, d: 250 },  // E2
      { f: 98.00, d: 250 },  // G2
      { f: 110.00, d: 250 }, // A2
      { f: 123.47, d: 250 }, // B2
      { f: 146.83, d: 300 }, // D3
      { f: 164.81, d: 450 }  // E3
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

    // Draw background reticle grid
    ctx.strokeStyle = "rgba(224, 90, 43, 0.2)";
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

    // Draw sine waveform
    ctx.strokeStyle = this.data.siteSettings.accentColor || "#FF9E1B";
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
  // Timecode real-time ticker (00:01:24:18)
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
    }, 1000 / 24);
  }

  // Render 24 segmented indicator bars (W [||||||] T from reference screenshot)
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

    // Dynamic wave animation for telemetry
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

  // CAD / Blueprint Single Line Diagram simulation canvas
  renderCadBlueprint() {
    const canvas = document.getElementById("cadBlueprintCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = (canvas.width = canvas.offsetWidth || 300);
    const h = (canvas.height = canvas.offsetHeight || 180);

    ctx.fillStyle = "#06080d";
    ctx.fillRect(0, 0, w, h);

    // Fine grid lines
    ctx.strokeStyle = "rgba(40, 50, 75, 0.4)";
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

    // SLD Electrical Schematics (Busbar, Transformer, Feeder, Motor)
    ctx.strokeStyle = "#ff9e1b";
    ctx.lineWidth = 1.5;

    // Incoming 22kV Line
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 10);
    ctx.lineTo(w * 0.5, 40);
    ctx.stroke();

    // Transformer Dual Circles
    ctx.beginPath();
    ctx.arc(w * 0.5, 50, 10, 0, Math.PI * 2);
    ctx.arc(w * 0.5, 65, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Line to Main Busbar
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 75);
    ctx.lineTo(w * 0.5, 95);
    ctx.stroke();

    // Main 400V 3Φ Busbar (Bold horizontal line)
    ctx.strokeStyle = "#e05a2b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, 95);
    ctx.lineTo(w * 0.85, 95);
    ctx.stroke();

    // Feeders branching down
    const feeders = [0.25, 0.5, 0.75];
    ctx.strokeStyle = "#9aa5bc";
    ctx.lineWidth = 1;

    feeders.forEach((pos, idx) => {
      const x = w * pos;
      ctx.beginPath();
      ctx.moveTo(x, 95);
      ctx.lineTo(x, 120);
      // Circuit Breaker symbol
      ctx.rect(x - 5, 120, 10, 15);
      ctx.moveTo(x, 135);
      ctx.lineTo(x, 150);
      ctx.stroke();

      // Motor M symbol at bottom
      ctx.beginPath();
      ctx.arc(x, 160, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#ff9e1b";
      ctx.font = "8px JetBrains Mono";
      ctx.textAlign = "center";
      ctx.fillText(idx === 1 ? "M2 (PLC)" : `M${idx + 1}`, x, 163);
    });
  }

  // System Highlights accordion toggle
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

  // Theme Management
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
  // Dynamic Rendering Engine
  renderAll() {
    this.renderProfile();
    this.renderSkills();
    this.renderEducation();
    this.renderCourses(this.currentCourseFilter || "all");
    this.renderActivities(this.currentActivityFilter || "all");
  }

  // Profile data & dynamic age calculation
  renderProfile() {
    const p = this.data.profile;

    // Calculate dynamic age from birthDateIso
    if (p.birthDateIso) {
      const birth = new Date(p.birthDateIso);
      const diff = Date.now() - birth.getTime();
      const ageDate = new Date(diff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      const ageEl = document.getElementById("profileAgeDisplay");
      if (ageEl) ageEl.textContent = `${age} ปี`;
    }

    // Bind all [data-cms-key] elements
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

    // Avatar preview
    if (p.avatarUrl) {
      const heroImg = document.getElementById("heroPortraitImg");
      const heroPlaceholder = document.getElementById("heroPortraitPlaceholder");
      const cardImg = document.getElementById("profileCardAvatar");
      const cardPlaceholder = document.getElementById("profileCardPlaceholder");

      if (heroImg && heroPlaceholder) {
        heroImg.src = p.avatarUrl;
        heroImg.classList.add("active");
        heroPlaceholder.style.display = "none";
      }
      if (cardImg && cardPlaceholder) {
        cardImg.src = p.avatarUrl;
        cardImg.style.display = "block";
        cardPlaceholder.style.display = "none";
      }
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

  filterCourses(cat) {
    this.currentCourseFilter = cat;
    document.querySelectorAll("#courseFilterBar .filter-btn").forEach((b) => b.classList.remove("active"));
    event.target.classList.add("active");
    this.renderCourses(cat);
    this.playTacticalBeep(700, "sine", 0.04);
  }

  renderCourses(category = "all") {
    const container = document.getElementById("coursesGrid");
    if (!container) return;
    container.innerHTML = "";

    const list = this.data.courses.filter((c) => (category === "all" ? true : c.category === category));

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

        <div class="artifacts-header">
          <i class="fa-solid fa-microchip"></i> ชิ้นงานและผลลัพธ์การเรียนรู้ (ARTIFACTS)
        </div>
        <div class="artifacts-list">
          ${(c.artifacts || [])
            .map(
              (art) => `
            <div class="artifact-item">
              <div>
                <div class="artifact-name"><i class="fa-solid fa-file-lines" style="color: var(--accent-amber); margin-right: 6px;"></i>${art.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${art.summary || ""}</div>
              </div>
              <button class="btn-dock" style="padding: 2px 8px; font-size: 0.7rem;" onclick="window.app.previewArtifact('${art.name}', '${art.fileUrl || ""}')">
                <i class="fa-solid fa-arrow-up-right-from-square"></i> เปิด
              </button>
            </div>
          `
            )
            .join("")}
        </div>
      `;
      container.appendChild(card);
    });
  }

  filterActivities(cat) {
    this.currentActivityFilter = cat;
    document.querySelectorAll("#activityFilterBar .filter-btn").forEach((b) => b.classList.remove("active"));
    event.target.classList.add("active");
    this.renderActivities(cat);
    this.playTacticalBeep(700, "sine", 0.04);
  }

  renderActivities(category = "all") {
    const container = document.getElementById("activitiesGrid");
    if (!container) return;
    container.innerHTML = "";

    const list = this.data.activities.filter((a) => (category === "all" ? true : a.category === category));

    list.forEach((act) => {
      const card = document.createElement("div");
      card.className = "activity-card hud-reticle";
      const defaultImg = "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";

      card.innerHTML = `
        <div class="activity-media-box">
          <img src="${act.imageUrl || defaultImg}" alt="${act.title}" class="activity-img">
          <div class="activity-badge">${act.badge || "ACHIEVEMENT"}</div>
        </div>
        <div class="activity-body">
          <div class="activity-date"><i class="fa-regular fa-calendar"></i> ${act.date} • ${act.place || ""}</div>
          <h3 class="activity-title">${act.title}</h3>
          <p class="activity-summary">${act.summary}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }
  // Event Listeners Setup
  setupEventListeners() {
    // Theme toggle button
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) themeBtn.addEventListener("click", () => this.toggleTheme());

    // Sound toggle button
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

    // Secret Login Modal Trigger (Lock icon fallback)
    const lockBtn = document.getElementById("adminKeyholeBtn");
    if (lockBtn) lockBtn.addEventListener("click", () => this.openLoginModal());

    // Secret Keyboard Shortcut: Ctrl + Alt + P
    window.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.altKey && (e.key === "p" || e.key === "P" || e.code === "KeyP")) {
        e.preventDefault();
        this.openLoginModal();
      }
    });

    // Quick Print / Dossier
    const dossierBtn = document.getElementById("quickDossierBtn");
    if (dossierBtn) dossierBtn.addEventListener("click", () => window.print());

    // Play Field Media Video
    const playMediaBtn = document.getElementById("playFieldMediaBtn");
    if (playMediaBtn) {
      playMediaBtn.addEventListener("click", () => {
        this.openMediaModal(
          `<iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        );
      });
    }

    // Avatar direct upload listener
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

  // =========================================================================
  // Hidden Admin Login System (Ctrl + Alt + P)
  // Username: O’Coner | Password: thanapat4444
  // =========================================================================
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

    // Normalize usernames (support curly quote, straight quote, and case)
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
    document.body.classList.add("admin-mode");
    const dock = document.getElementById("adminDock");
    if (dock) dock.style.display = "flex";
  }

  handleLogout() {
    sessionStorage.removeItem(this.authKey);
    document.body.classList.remove("admin-mode", "editable-active");
    this.isEditing = false;
    const dock = document.getElementById("adminDock");
    if (dock) dock.style.display = "none";
    this.playTacticalBeep(440, "sine", 0.1);
    alert("ออกจากระบบผู้ดูแลเรียบร้อยแล้ว");
  }

  // =========================================================================
  // In-Browser CMS Inline Editing Mode
  // =========================================================================
  toggleInlineEdit() {
    this.isEditing = !this.isEditing;
    const statusText = document.getElementById("inlineEditStatus");

    if (this.isEditing) {
      document.body.classList.add("editable-active");
      if (statusText) statusText.textContent = "แก้ไขเนื้อหา (ON)";

      document.querySelectorAll("[data-cms-key]").forEach((el) => {
        el.setAttribute("contenteditable", "true");

        el.onblur = () => {
          const keyPath = el.getAttribute("data-cms-key").split(".");
          let ref = this.data;
          for (let i = 0; i < keyPath.length - 1; i++) {
            ref = ref[keyPath[i]];
          }
          ref[keyPath[keyPath.length - 1]] = el.innerText.trim();
          this.saveData();
        };
      });
      alert("เปิดโหมดแก้ไขเนื้อหา: คุณสามารถคลิกข้อความใดก็ได้บนหน้าเว็บเพื่อแก้ไขโดยตรง และระบบจะบันทึกอัตโนมัติ!");
    } else {
      document.body.classList.remove("editable-active");
      if (statusText) statusText.textContent = "แก้ไขเนื้อหา (OFF)";
      document.querySelectorAll("[data-cms-key]").forEach((el) => {
        el.removeAttribute("contenteditable");
      });
    }
  }
  // =========================================================================
  // CMS Studio Modals & Management
  // =========================================================================
  openCMSModal(type) {
    const modal = document.getElementById("cmsStudioModal");
    const title = document.getElementById("cmsModalTitle");
    const body = document.getElementById("cmsModalBody");
    if (!modal || !body) return;

    modal.classList.add("open");

    if (type === "theme") {
      title.innerHTML = `<i class="fa-solid fa-palette"></i> ตกแต่งหน้าตาและเอฟเฟกต์เว็บ (THEME STUDIO)`;
      body.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div>
            <label class="form-label">ชุดโทนสีอุ่นหลัก (TACTICAL ACCENT PALETTE)</label>
            <div style="display: flex; gap: 10px; margin-top: 8px;">
              <button class="btn-dock" style="background: #E05A2B; color: #fff;" onclick="window.app.applyAccentColor('#E05A2B'); window.app.saveData();">Terracotta Brick</button>
              <button class="btn-dock" style="background: #C0392B; color: #fff;" onclick="window.app.applyAccentColor('#C0392B'); window.app.saveData();">Deep Brick Red</button>
              <button class="btn-dock" style="background: #FF9E1B; color: #000;" onclick="window.app.applyAccentColor('#FF9E1B'); window.app.saveData();">Tactical Amber</button>
              <button class="btn-dock" style="background: #D35400; color: #fff;" onclick="window.app.applyAccentColor('#D35400'); window.app.saveData();">Burnt Orange</button>
              <button class="btn-dock" style="background: #FF6F00; color: #000;" onclick="window.app.applyAccentColor('#FF6F00'); window.app.saveData();">Tangerine</button>
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

          <div id="newItemFormContainer">
            <!-- Dynamic form based on tab -->
          </div>
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
          <div style="display: flex; gap: 10px;">
            <button class="btn-tactical btn-tactical-primary" onclick="window.app.saveAndTestSupabase()">
              <i class="fa-solid fa-plug"></i> ทดสอบและเชื่อมต่อ
            </button>
            <button class="btn-tactical btn-tactical-ghost" onclick="window.app.syncDataToSupabase()">
              <i class="fa-solid fa-cloud-arrow-up"></i> อัปโหลดข้อมูลขึ้น Supabase
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

  // Universal File Upload Handler
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
            <label class="form-label">ช่วงเวลาและสถานที่</label>
            <input type="text" id="newActDate" class="form-control" placeholder="เช่น กุมภาพันธ์ 2568 • มทร.อีสาน">
          </div>
          <div class="form-group">
            <label class="form-label">คำอธิบายรายละเอียด</label>
            <textarea id="newActSummary" class="form-control" rows="2" placeholder="บทบาทและผลลัพธ์ของกิจกรรม"></textarea>
          </div>
          <button class="btn-tactical btn-tactical-primary" onclick="window.app.submitNewActivity()">
            <i class="fa-solid fa-check"></i> บันทึกกิจกรรมใหม่
          </button>
        </div>
      `;
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
    const date = document.getElementById("newActDate").value.trim();
    const summary = document.getElementById("newActSummary").value.trim();

    if (!title) {
      alert("โปรดระบุชื่อกิจกรรม/ผลงาน");
      return;
    }

    const item = {
      id: `act_${Date.now()}`,
      title: title,
      category: cat,
      date: date || "ปีการศึกษา 2568",
      badge: "ACTIVITY",
      summary: summary || "รายละเอียดกิจกรรม",
      imageUrl: ""
    };

    this.data.activities.unshift(item);
    this.saveData();
    this.renderActivities(this.currentActivityFilter || "all");
    this.closeCMSModal();
    alert("เพิ่มกิจกรรม/ผลงานสำเร็จแล้ว!");
  }

  // Backup & Restore
  exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `thanaphat-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Media Modal Lightbox
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

  // Supabase Cloud Integration
  initSupabase() {
    const s = this.data.siteSettings.supabase;
    if (s && s.url && s.anonKey && window.supabase) {
      try {
        this.supabaseClient = window.supabase.createClient(s.url, s.anonKey);
        this.updateStatusTelemetry("SUPABASE: CONNECTED");
      } catch (e) {
        console.warn("Supabase init error:", e);
      }
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

      alertBox.innerHTML = `<span style="color: var(--signal-online);"><i class="fa-solid fa-check"></i> เชื่อมต่อ Supabase สำเร็จแล้ว! พร้อมซิงค์</span>`;
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
}

// Bootstrap Application on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new PortfolioApp();
});