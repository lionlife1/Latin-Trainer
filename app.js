/* ============================================================
   LatinIQ — app.js
   Core logic: screen management, drill sessions, SRS tracking,
   localStorage persistence, type-in + MC question handling.
   ============================================================ */

'use strict';

/* ============================================================
   CONSTANTS & STATE
   ============================================================ */

const LS_KEY_PROGRESS = 'latiniq_progress';   // { moduleId: { completed: bool, xp: n, wrong_ids: [] } }
const LS_KEY_STREAK = 'latiniq_streak';      // { lastDate: 'YYYY-MM-DD', count: n }
const LS_KEY_TOTAL_XP = 'latiniq_xp';

let allModules = [];   // from modules.json
let moduleData = null; // currently loaded module JSON
let session = null; // current drill session state

/* ============================================================
   UTILITY
   ============================================================ */

function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const s = $(id);
  s.classList.add('active');
  // Scroll to top
  window.scrollTo(0, 0);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Strip macrons for comparison */
function normalize(str) {
  return str.trim().toLowerCase()
    .replace(/ā/g, 'a').replace(/ē/g, 'e').replace(/ī/g, 'i')
    .replace(/ō/g, 'o').replace(/ū/g, 'u')
    .replace(/Ā/g, 'a').replace(/Ē/g, 'e').replace(/Ī/g, 'i')
    .replace(/Ō/g, 'o').replace(/Ū/g, 'u');
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ============================================================
   PERSISTENCE
   ============================================================ */

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(LS_KEY_PROGRESS)) || {}; }
  catch { return {}; }
}

function saveProgress(p) {
  localStorage.setItem(LS_KEY_PROGRESS, JSON.stringify(p));
}

function loadStreak() {
  try { return JSON.parse(localStorage.getItem(LS_KEY_STREAK)) || { lastDate: '', count: 0 }; }
  catch { return { lastDate: '', count: 0 }; }
}

function saveStreak(s) {
  localStorage.setItem(LS_KEY_STREAK, JSON.stringify(s));
}

function loadTotalXP() {
  return parseInt(localStorage.getItem(LS_KEY_TOTAL_XP) || '0', 10);
}

function saveTotalXP(n) {
  localStorage.setItem(LS_KEY_TOTAL_XP, String(n));
}

function updateStreakForToday() {
  const streak = loadStreak();
  const t = today();
  if (streak.lastDate === t) return streak; // already updated today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);

  if (streak.lastDate === yStr) {
    streak.count += 1;
  } else {
    streak.count = 1;
  }
  streak.lastDate = t;
  saveStreak(streak);
  return streak;
}

/* ============================================================
   MODULE MAP
   ============================================================ */

function loadModuleMap() {
  allModules = APP_MODULES; // Pulls from data.js instantly
  renderModuleMap();
  renderHeaderStats();
}

function isModuleUnlocked(mod, progress) {
  if (!mod.prerequisites || mod.prerequisites.length === 0) return true;
  return mod.prerequisites.every(prereq => progress[prereq]?.completed === true);
}

function renderModuleMap() {
  const progress = loadProgress();
  const grid = $('module-grid');
  grid.innerHTML = '';

  allModules.forEach(mod => {
    const unlocked = isModuleUnlocked(mod, progress);
    const completed = progress[mod.id]?.completed === true;
    const earnedXP = progress[mod.id]?.xp || 0;

    const card = document.createElement('div');
    card.className = `module-card ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''}`;

    card.innerHTML = `
      <div class="module-num">${mod.badge}</div>
      <div class="module-info">
        <div class="module-name">${mod.title}</div>
        <div class="module-tagline">${mod.tagline}</div>
      </div>
      <div class="module-right">
        ${unlocked
        ? `<div class="module-progress-pill ${completed ? 'done' : ''}">${completed ? '✓ Done' : 'Start'}</div>
             <div class="module-xp-label">+${mod.xp_reward} XP</div>`
        : `<div class="module-lock-icon">🔒</div>`
      }
      </div>
    `;

    if (unlocked) {
      card.addEventListener('click', () => openModuleIntro(mod));
    } else {
      card.title = `Requires: ${mod.prerequisites.join(', ')}`;
    }

    grid.appendChild(card);
  });
}

function renderHeaderStats() {
  const streak = loadStreak();
  const xp = loadTotalXP();
  $('streak-count').textContent = streak.count;
  $('xp-count').textContent = xp;
}

/* ============================================================
   MODULE INTRO
   ============================================================ */

function openModuleIntro(mod) {
  // Pull directly from the global variable defined in data.js
  moduleData = MODULE_DB[mod.id];

  if (!moduleData) {
    alert("This module's questions haven't been built yet!");
    return;
  }

  const progress = loadProgress();
  const p = progress[mod.id] || {};
  const done = p.completed || false;
  const totalQ = moduleData.questions.length;
  const wrongCount = (p.wrong_ids || []).length;

  $('intro-badge').textContent = mod.badge;
  $('intro-title').textContent = mod.title;
  $('intro-desc').textContent = moduleData.description;

  $('intro-stats').innerHTML = `
    <div class="intro-stat"><div class="intro-stat-val">${totalQ}</div><div class="intro-stat-label">Questions</div></div>
    <div class="intro-stat"><div class="intro-stat-val">+${mod.xp_reward}</div><div class="intro-stat-label">XP Reward</div></div>
    ${done ? `<div class="intro-stat"><div class="intro-stat-val" style="color:var(--green)">✓</div><div class="intro-stat-label">Completed</div></div>` : ''}
    ${wrongCount > 0 ? `<div class="intro-stat"><div class="intro-stat-val" style="color:var(--red)">${wrongCount}</div><div class="intro-stat-label">To Review</div></div>` : ''}
  `;

  const conceptsEl = $('intro-concepts');
  conceptsEl.innerHTML = `<div class="intro-concepts-title">Concepts Covered</div>`;
  (moduleData.concepts || []).forEach(c => {
    const tag = document.createElement('span');
    tag.className = 'concept-tag';
    tag.textContent = c;
    conceptsEl.appendChild(tag);
  });

  const select = $('cfg-q-count');
  select.innerHTML = '';
  const options = [5, 10, 20, 40];
  let recommendedSet = false;

  options.forEach(num => {
    if (num < totalQ) {
      const opt = document.createElement('option');
      opt.value = num;
      // Recommend 20 if available, otherwise 10
      if ((num === 20) || (num === 10 && totalQ < 20)) {
        opt.textContent = `${num} Questions (Recommended)`;
        opt.selected = true;
        recommendedSet = true;
      } else {
        opt.textContent = `${num} Questions`;
      }
      select.appendChild(opt);
    }
  });

  const optAll = document.createElement('option');
  optAll.value = 'all';
  optAll.textContent = `All ${totalQ} Questions`;
  if (!recommendedSet) optAll.selected = true;
  select.appendChild(optAll);

  showScreen('screen-intro');
}

// This makes the "Back" button work
$('intro-back').addEventListener('click', () => showScreen('screen-map'));

// This makes the "Begin Session" button work
$('btn-start-module').addEventListener('click', () => {
  if (!moduleData) return;

  const val = $('cfg-q-count').value;
  let qs = [...moduleData.questions];

  if (val !== 'all') {
    const limit = parseInt(val, 10);
    qs = shuffle(qs).slice(0, limit);
  }

  startSession(qs);
});

/* ============================================================
   DRILL SESSION
   ============================================================ */

function startSession(questions, isEndless = false) {
  const shuffled = isEndless ? questions : shuffle(questions);
  session = {
    isEndless: isEndless,
    questions: shuffled,
    index: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    wrongItems: [],
    answeredIds: []
  };
  showScreen('screen-drill');
  renderQuestion();
}

function renderQuestion() {
  const q = session.questions[session.index];
  const total = session.questions.length;

  // Update progress bar
  const pct = (session.index / total) * 100;
  $('drill-progress-fill').style.width = pct + '%';
  $('drill-progress-label').textContent = `${session.index} / ${total}`;
  $('drill-score').textContent = session.score + ' pts';

  // Question card
  $('q-type-badge').textContent = q.badge || (q.type === 'typein' ? 'CONJUGATE' : 'IDENTIFY');
  $('q-prompt').innerHTML = q.prompt;
  if (q.hint) {
    $('q-hint').innerHTML = '<span style="opacity: 0.6;">💡 Click card to reveal hint</span>';
  } else {
    $('q-hint').textContent = '';
  }
  // Reset input state
  $('answer-input').value = '';
  $('answer-input').classList.remove('correct', 'wrong');
  $('feedback-overlay').classList.add('hidden');

  if (q.type === 'typein') {
    $('answer-area-typein').classList.remove('hidden');
    $('answer-area-mc').classList.add('hidden');
    setTimeout(() => $('answer-input').focus(), 50);
  } else {
    // MC or identify
    $('answer-area-typein').classList.add('hidden');
    $('answer-area-mc').classList.remove('hidden');
    renderMCChoices(q);
  }
}

/* ---- Reveal Hint ---- */
$('question-card').addEventListener('click', () => {
  if (!session) return;
  const q = session.questions[session.index];
  if (q && q.hint) {
    // Replaces the placeholder with the actual hint text
    $('q-hint').innerHTML = `<strong>Hint:</strong> ${q.hint}`;
  }
});

/* ---- Type-in submission ---- */

function submitTypeIn() {
  const q = session.questions[session.index];
  const raw = $('answer-input').value;
  if (!raw.trim()) return;

  const userNorm = normalize(raw);
  const correctAnswers = (q.answers || []).map(a => normalize(a));
  const isCorrect = correctAnswers.includes(userNorm);

  $('answer-input').classList.add(isCorrect ? 'correct' : 'wrong');

  // remove cursor focus from the input box so the NEXT Enter press works correctly
  $('answer-input').blur();


  showFeedback(q, isCorrect, q.answers[0]);
}

$('btn-submit').addEventListener('click', submitTypeIn);

$('answer-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.stopPropagation(); // stop from instantly triggering next question logic
    submitTypeIn();

  }
});



/* ---- MC submission ---- */

function renderMCChoices(q) {
  const grid = $('mc-grid');
  grid.innerHTML = '';
  const shuffledChoices = shuffle(q.choices || []);
  shuffledChoices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'mc-btn';
    btn.innerHTML = choice;
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      // Disable all
      grid.querySelectorAll('.mc-btn').forEach(b => b.disabled = true);
      const isCorrect = normalize(choice) === normalize(q.correct);
      btn.classList.add(isCorrect ? 'correct-choice' : 'wrong-choice');
      if (!isCorrect) {
        // Highlight the correct answer
        grid.querySelectorAll('.mc-btn').forEach(b => {
          if (normalize(b.textContent) === normalize(q.correct)) {
            b.classList.add('correct-choice');
          }
        });
      }
      showFeedback(q, isCorrect, q.correct);
    });
    grid.appendChild(btn);
  });
}

/* ---- Feedback overlay ---- */

function showFeedback(q, isCorrect, correctAnswer) {
  const overlay = $('feedback-overlay');
  const card = $('feedback-card');

  card.className = `feedback-card ${isCorrect ? 'is-correct' : 'is-wrong'}`;
  $('feedback-icon').textContent = isCorrect ? '✓' : '✗';
  $('feedback-verdict').textContent = isCorrect ? 'Correct!' : 'Not quite.';
  $('feedback-correct').innerHTML = isCorrect
    ? `Answer: <strong>${correctAnswer}</strong>`
    : `Correct answer: <strong>${correctAnswer}</strong>`;
  $('feedback-explanation').textContent = q.explanation || '';

  // Update scoring
  if (isCorrect) {
    session.correct++;
    session.score += 10;
  } else {
    session.wrong++;
    // Track wrong for retry
    if (!session.wrongItems.find(w => w.id === q.id)) {
      session.wrongItems.push(q);
    }
  }

  $('drill-score').textContent = session.score + ' pts';
  overlay.classList.remove('hidden');
}

$('btn-next').addEventListener('click', advanceQuestion);

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !$('feedback-overlay').classList.contains('hidden')) {
    advanceQuestion();
  }
});

function advanceQuestion() {
  session.index++;
  if (session.isEndless) {
    session.questions.push(generateRandomQuestion(session.config));
    renderQuestion();
  } else if (session.index >= session.questions.length) {
    endSession();
  } else {
    renderQuestion();
  }
}

/* ---- End session ---- */

function endSession() {
  const progress = loadProgress();
  const modId = moduleData.id;
  const total = session.questions.length;
  const pct = Math.round((session.correct / total) * 100);

  // Proportional XP based on session length
  const earnedXP = Math.round(moduleData.xp_reward * (session.questions.length / moduleData.questions.length));

  // Mark complete if ≥ 70% on a substantial session (10+ questions, or all of them)
  const isQualifyingSession = session.questions.length >= Math.min(10, moduleData.questions.length);

  if (isQualifyingSession && pct >= 70) {
    progress[modId] = progress[modId] || {};
    progress[modId].completed = true;
    progress[modId].xp = (progress[modId].xp || 0) + earnedXP;
    progress[modId].wrong_ids = session.wrongItems.map(q => q.id);
  } else if (progress[modId]) {
    progress[modId].wrong_ids = session.wrongItems.map(q => q.id);
  }
  saveProgress(progress);

  // Award XP
  if (isQualifyingSession && pct >= 70) {
    const currentXP = loadTotalXP();
    saveTotalXP(currentXP + earnedXP);
  }

  // Update streak
  const streak = updateStreakForToday();

  // Render complete screen
  const accuracy = pct;
  $('complete-stats').innerHTML = `
    <div class="c-stat"><div class="c-stat-val" style="color:var(--green)">${session.correct}</div><div class="c-stat-label">Correct</div></div>
    <div class="c-stat"><div class="c-stat-val" style="color:var(--red)">${session.wrong}</div><div class="c-stat-label">Wrong</div></div>
    <div class="c-stat"><div class="c-stat-val">${accuracy}%</div><div class="c-stat-label">Accuracy</div></div>
    <div class="c-stat"><div class="c-stat-val" style="color:var(--gold)">${session.score}</div><div class="c-stat-label">Points</div></div>
  `;

  const wrongCount = session.wrongItems.length;
  $('complete-breakdown').innerHTML = `
    <strong>${total}</strong> questions answered &nbsp;·&nbsp;
    <strong>${session.correct}</strong> correct &nbsp;·&nbsp;
    <strong>${wrongCount}</strong> to review
    ${isQualifyingSession && pct >= 70 ? `<br>✓ Module marked complete (+${earnedXP} XP)` : pct < 70 ? '<br>⚠ Score below 70% — module not marked complete' : '<br>⚠ Session too short to mark complete (need 10+)'}    
    <br>🔥 Streak: <strong>${streak.count}</strong> day${streak.count !== 1 ? 's' : ''}
  `;

  const retryBtn = $('btn-retry-wrong');
  if (wrongCount === 0) {
    retryBtn.disabled = true;
    retryBtn.style.opacity = '0.4';
    retryBtn.textContent = 'No wrong answers!';
  } else {
    retryBtn.disabled = false;
    retryBtn.style.opacity = '1';
    retryBtn.textContent = `Drill ${wrongCount} Wrong Answer${wrongCount !== 1 ? 's' : ''}`;
  }

  showScreen('screen-complete');
  renderHeaderStats();
  renderModuleMap();
}

/* ---- Retry wrong answers ---- */
$('btn-retry-wrong').addEventListener('click', () => {
  if (!session || session.wrongItems.length === 0) return;
  const wrongQs = [...session.wrongItems];
  startSession(wrongQs);
});

$('btn-back-map').addEventListener('click', () => {
  moduleData = null;
  session = null;
  showScreen('screen-map');
});

/* ---- Drill back button ---- */
$('drill-back').addEventListener('click', () => {
  if (confirm('Exit this session? Progress will be lost.')) {
    session = null;
    showScreen('screen-map');
  }
});

/* ============================================================
   RESET
   ============================================================ */

$('btn-reset-progress').addEventListener('click', () => {
  if (confirm('Reset ALL progress, XP, and streak? This cannot be undone.')) {
    localStorage.removeItem(LS_KEY_PROGRESS);
    localStorage.removeItem(LS_KEY_STREAK);
    localStorage.removeItem(LS_KEY_TOTAL_XP);
    renderModuleMap();
    renderHeaderStats();
  }
});


/* ---- Endless Mode Trigger & Config ---- */
$('btn-endless').addEventListener('click', () => {
  $('modal-endless').classList.remove('hidden');
});

$('btn-cancel-endless').addEventListener('click', () => {
  $('modal-endless').classList.add('hidden');
});

$('btn-start-endless-drill').addEventListener('click', () => {
  const config = {
    stdAct: $('cfg-std-act').checked,
    stdPass: $('cfg-std-pass').checked,
    dep: $('cfg-dep').checked,
    irr: $('cfg-irr').checked
  };

  if (!config.stdAct && !config.stdPass && !config.dep && !config.irr) {
    alert("You must select at least one verb category!");
    return;
  }

  $('modal-endless').classList.add('hidden');

  session = {
    isEndless: true,
    config: config,
    questions: [],
    index: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    wrongItems: [],
    answeredIds: []
  };

  const firstQ = generateRandomQuestion(session.config);
  if (!firstQ) {
    alert("Could not generate a question. Make sure your voice and verb type filters don't clash.");
    showScreen('screen-map');
    return;
  }

  session.questions.push(firstQ);
  showScreen('screen-drill');

  $('drill-progress-label').textContent = 'ENDLESS MODE';
  $('drill-progress-fill').style.width = '100%';
  $('drill-progress-fill').style.background = 'var(--gold)';

  renderQuestion();
});

/* ============================================================
   THEME TOGGLE
   ============================================================ */
const LS_KEY_THEME = 'latiniq_theme';
const themeBtn = $('btn-theme');

// Load saved theme on boot
if (localStorage.getItem(LS_KEY_THEME) === 'light') {
  document.body.classList.add('light-mode');
  themeBtn.textContent = '🌙';
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');

  if (document.body.classList.contains('light-mode')) {
    localStorage.setItem(LS_KEY_THEME, 'light');
    themeBtn.textContent = '🌙';
  } else {
    localStorage.setItem(LS_KEY_THEME, 'dark');
    themeBtn.textContent = '☀️';
  }
});

/* ============================================================
   BOOT
   ============================================================ */

loadModuleMap();
