/* =====================================================
Daily Discipline Tracker — MASTER VERSION
✅ ONLY TODAY EDITABLE
✅ 10,000 Days Achievements (Realistic & Tricky)
✅ Leaderboard with Fake Competitors
✅ All Features Complete
✅ No Syntax Errors
===================================================== */

// ── DEFAULT DATA ──────────────────────────────────────
const DEFAULT_HABITS = [
  { id: 1, name: "10PM–05AM Sleep + Drink 4L Water", pts: 5 },
  { id: 2, name: "Diet — No Junk Food",              pts: 3 },
  { id: 3, name: "Exercise & Meditation",            pts: 5 },
  { id: 4, name: "Only 1hr Phone (except education)", pts: 4 },
  { id: 5, name: "5 Achieve Tasks",                  pts: 5 },
  { id: 6, name: "Follow Time Table",                pts: 3 },
  { id: 7, name: "Spend 5 Hours with AI",            pts: 3 }
];

const QUOTES = [
  "Discipline is the bridge between goals and accomplishment.",
  "Small daily improvements are the key to staggering long-term results.",
  "You don't rise to your goals, you fall to your systems.",
  "Every action you take is a vote for the person you wish to become.",
  "The secret of getting ahead is getting started.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Motivation gets you started. Habit keeps you going.",
  "Do not wait for the perfect moment — make the moment perfect.",
  "Hard work beats talent when talent doesn't work hard.",
  "Be consistent. Results will follow.",
  "One day or day one — you decide.",
  "Push yourself because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "The pain of discipline is far less than the pain of regret.",
  "Winners are not people who never fail, but people who never quit.",
  "Wake up with determination. Go to bed with satisfaction.",
  "What you do today can improve all your tomorrows.",
  "First master the fundamentals, then worry about everything else.",
  "Believe in yourself and all that you are.",
  "Your future is created by what you do today, not tomorrow."
];

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const DAY_FULL  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const STATUS_CYCLE =  ['none','green','amber','red'];
const STATUS_ICONS = { none:'·', green:'✓', amber:'~', red:'✗' };

// ── LEVELS (Up to Level 100) ─────────────────────────
const LEVELS = [];
for (let i = 1; i <= 100; i++) {
  LEVELS.push({
    lvl: i,
    name: getLevelName(i),
    xp: Math.floor(100 * Math.pow(1.5, i - 1))
  });
}

function getLevelName(lvl) {
  if (lvl === 1) return 'Novice';
  if (lvl <= 5) return 'Beginner';
  if (lvl <= 10) return 'Disciplined';
  if (lvl <= 15) return 'Committed';
  if (lvl <= 20) return 'Expert';
  if (lvl <= 30) return 'Master';
  if (lvl <= 40) return 'Grand Master';
  if (lvl <= 50) return 'Legend';
  if (lvl <= 60) return 'Immortal';
  if (lvl <= 75) return 'Divine';
  if (lvl <= 90) return 'Eternal';
  return 'Supreme Being';
}

// ── ACHIEVEMENTS (Up to 10,000 Days - Realistic & Tricky) ──
const BADGES = [
  // TIER 1: BEGINNER (1-30 days)
  { id: 'first_day',    icon: '🌱', name: 'First Step',        desc: 'Track your first habit',                    days: 1,    difficulty: 'Easy', tier: 'beginner' },
  { id: 'first_week',   icon: '🏆', name: 'First Week',        desc: 'Track 7 different days',                    days: 7,    difficulty: 'Easy', tier: 'beginner' },
  { id: 'perfect_day',  icon: '💯', name: 'Perfectionist',     desc: 'Get 100% score on any day',                 days: 1,    difficulty: 'Medium', tier: 'beginner', special: 'perfect' },
  { id: 'streak_7',     icon: '', name: 'Week Warrior',      desc: '7-day consecutive streak',                  days: 7,    difficulty: 'Medium', tier: 'beginner' },
  { id: 'streak_14',    icon: '⚡', name: 'Fortnight Force',   desc: '14-day consecutive streak',                 days: 14,   difficulty: 'Medium', tier: 'beginner' },
  { id: 'streak_30',    icon: '🌟', name: 'Monthly Master',    desc: '30-day consecutive streak',                 days: 30,   difficulty: 'Hard', tier: 'beginner' },

  // TIER 2: INTERMEDIATE (60-200 days)
  { id: 'streak_60',    icon: '💎', name: 'Iron Will',         desc: '60-day consecutive streak',                 days: 60,   difficulty: 'Hard', tier: 'intermediate' },
  { id: 'streak_100',   icon: '👑', name: 'Centurion',         desc: '100-day consecutive streak',                days: 100,  difficulty: 'Hard', tier: 'intermediate' },
  { id: 'century',      icon: '', name: 'Century Club',      desc: 'Earn 100 green cells total',                days: 0,    difficulty: 'Medium', tier: 'intermediate', special: 'greens', count: 100 },
  { id: 'streak_200',   icon: '', name: 'Double Century',    desc: '200-day consecutive streak',                days: 200,  difficulty: 'Very Hard', tier: 'intermediate' },

  // TIER 3: ADVANCED (365-1000 days)
  { id: 'streak_365',   icon: '🌍', name: 'Year Champion',     desc: '365-day streak (1 full year!)',             days: 365,  difficulty: 'Very Hard', tier: 'advanced' },
  { id: 'streak_500',   icon: '️', name: 'Elite Streak',      desc: '500-day consecutive streak',                days: 500,  difficulty: 'Extreme', tier: 'advanced' },
  { id: 'perfect_week', icon: '💫', name: 'Flawless Week',     desc: '7 perfect days in a row (100% each)',       days: 7,    difficulty: 'Extreme', tier: 'advanced', special: 'perfect_week' },
  { id: 'streak_1000',  icon: '👁️', name: 'Millennium Master', desc: '1000-day streak (3+ years!)',               days: 1000, difficulty: 'Extreme', tier: 'advanced' },

  // TIER 4: EXPERT (2000-5000 days)
  { id: 'streak_2000',  icon: '⚔️', name: 'Legend Builder',    desc: '2000-day streak (5.5 years)',               days: 2000, difficulty: 'Legendary', tier: 'expert' },
  { id: 'all_habits',   icon: '🎪', name: 'Habit Collector',   desc: 'Complete ALL 7 habits in one day',          days: 1,    difficulty: 'Medium', tier: 'expert', special: 'all_habits' },
  { id: 'streak_3000',  icon: '🌌', name: 'Decade Warrior',    desc: '3000-day streak (8+ years)',                days: 3000, difficulty: 'Legendary', tier: 'expert' },
  { id: 'streak_5000',  icon: '️', name: 'Immortal Dedication', desc: '5000-day streak (13+ years)',            days: 5000, difficulty: 'Mythical', tier: 'expert' },

  // TIER 5: MASTER (10000 days) - GODLIKE
  { id: 'streak_10000', icon: '️‍🗨️', name: 'ETERNAL DISCIPLINE', desc: '10,000-day streak (27+ years) — The Ultimate Goal', days: 10000, difficulty: 'GODLIKE', tier: 'godlike', secret: true },

  // SPECIAL / TRICKY ACHIEVEMENTS
  { id: 'comeback',     icon: '🦅', name: 'Comeback Kid',      desc: 'Rebuild streak after breaking it (3+ days)', days: 0,    difficulty: 'Medium', tier: 'special', special: 'comeback' },
  { id: 'marathon',     icon: '🏃', name: 'Marathon Runner',   desc: '30 days without a single red cell',         days: 30,   difficulty: 'Extreme', tier: 'special', special: 'no_red' },
  { id: 'weekend_warrior', icon: '', name: 'Weekend Warrior', desc: 'Perfect weekend (Sat+Sun both 100%)',       days: 2,    difficulty: 'Medium', tier: 'special', special: 'weekend' },
  { id: 'green_500',    icon: '🌿', name: 'Green Thumb',       desc: 'Earn 500 green cells total',                days: 0,    difficulty: 'Hard', tier: 'special', special: 'greens', count: 500 },
  { id: 'green_1000',   icon: '🌳', name: 'Forest Keeper',     desc: 'Earn 1000 green cells total',               days: 0,    difficulty: 'Very Hard', tier: 'special', special: 'greens', count: 1000 },
  { id: 'level_10',     icon: '⭐', name: 'Rising Star',       desc: 'Reach Level 10',                            days: 0,    difficulty: 'Hard', tier: 'special', special: 'level', count: 10 }
];

// ── LEADERBOARD DATA ──────────────────────────────────
const FAKE_NAMES = [
  "Discipline King", "Habit Master", "Consistency Pro", "Morning Warrior",
  "Focus Champion", "Goal Crusher", "Streak Legend", "Productivity Guru",
  "Early Riser", "Task Terminator", "Mindful Achiever", "Fitness Freak",
  "Study Beast", "Work Hustler", "Life Optimizer", "Success Seeker",
  "Dream Chaser", "Action Taker", "Progress Maker", "Winner Mindset",
  "Elite Performer", "Peak Achiever", "Daily Grinder", "Habit Hero",
  "Focus Master", "Time Warrior", "Goal Getter", "Rise & Grind",
  "No Excuses", "Beast Mode", "Grind Never Stops", "Champion Mindset"
];

const AVATAR_EMOJIS = ["🦁", "🐅", "🐺", "", "🐉", "🦄", "🔥", "⚡", "", "👑", "🚀", "⭐", "🌟", "💫", "🎯"];

// ── STATE ─────────────────────────────────────────────
let habits          = load('ddt_habits', DEFAULT_HABITS);
let cellData        = load('ddt_data',   {});
let cellNotes       = load('ddt_notes_cells', {});
let taskData        = load('ddt_tasks',  {});
let noteData        = load('ddt_notes',  {});
let unlockedBadges  = load('ddt_badges', []);
let lastLevel       = load('ddt_lastlevel', 1);
let hadBrokenStreak = load('ddt_hadbroken', false);
let lastReportWeek  = load('ddt_lastreport', '');
let soundEnabled    = load('ddt_sound', true);
let notifEnabled    = load('ddt_notif', false);
let focusMode       = false;
let weekOffset      = 0;
let calendarMonthOffset = 0;
let activeTab       = 'tracker';
let chartInstances  = {};
let currentNoteKey  = null;
let currentReportText = '';
let fakeCompetitors = [];
let currentLeaderboardPeriod = 'weekly';

// ── PERSISTENCE ──────────────────────────────────────
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── DATE HELPERS ──────────────────────────────────────
function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const sun = new Date(now);
  sun.setDate(now.getDate() - day + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sun);
    d.setDate(sun.getDate() + i);
    return d;
  });
}

function isoDate(d)  { return d.toISOString().split('T')[0]; }
function isToday(d)  { return isoDate(d) === isoDate(new Date()); }
function fmtShort(d) { return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }); }
function fmtLong(d)  { return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

// ── STATUS HELPERS ────────────────────────────────────
function getStatus(habitId, date) {
  return cellData[`${isoDate(date)}_${habitId}`] || 'none';
}

function cycleStatus(habitId, dateStr) {
  // ✅ ONLY ALLOW EDITING TODAY
  if (!isToday(new Date(dateStr))) {
    showToast('⚠️ Only TODAY can be edited!');
    return;
  }

  const key = `${dateStr}_${habitId}`;
  const cur  = cellData[key] || 'none';
  const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(cur) + 1) % STATUS_CYCLE.length];
  cellData[key] = next;
  save('ddt_data', cellData);

  if (soundEnabled) playToggleSound(next);

  if (next === 'green') {
    const date = new Date(dateStr);
    const stats = dayStats(date);
    if (stats.pct === 100) {
      triggerConfetti();
      showToast('🎉 Perfect day! 100% complete!');
    }
  }

  renderAll();
  checkProgression();
}

// ── SOUND EFFECTS ─────────────────────────────────────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playToggleSound(status) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const freqs = { none: 220, green: 660, amber: 440, red: 180 };
    osc.frequency.value = freqs[status] || 440;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {}
}

// ── CONFETTI ──────────────────────────────────────────
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  }
}

// ── TOAST ─────────────────────────────────────────────
let toastTimer = null;

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── STATS CALCULATIONS ────────────────────────────────
function dayStats(date) {
  let g = 0, a = 0, r = 0, earned = 0, total = 0;
  habits.forEach(h => {
    const s = getStatus(h.id, date);
    total += h.pts;
    if (s === 'green')      { g++; earned += h.pts; }
    else if (s === 'amber') { a++; earned += Math.floor(h.pts * 0.5); }
    else if (s === 'red')   { r++; }
  });
  const pct = total > 0 ? Math.round(earned / total * 100) : 0;
  return { g, a, r, pct, earned, total };
}

function weekStats(dates) {
  let tg=0, ta=0, tr=0, earned=0, total=0;
  dates.forEach(d => {
    const s = dayStats(d);
    tg += s.g; ta += s.a; tr += s.r;
    earned += s.earned; total += s.total;
  });
  const pct = total > 0 ? Math.round(earned / total * 100) : 0;
  return { tg, ta, tr, pct };
}

function calcStreak() {
  let streak = 0, max = 0, cur = 0;
  const today = new Date();
  for (let i = 0; i < 10000; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const s = dayStats(d);
    if (s.pct >= 50) { cur++; }
    else {
      if (i === 0) streak = 0;
      max = Math.max(max, cur);
      cur = 0;
    }
  }
  if (cur > 0) { streak = cur; max = Math.max(max, cur); }
  return { streak, max };
}

// ─ XP & LEVEL ────────────────────────────────────────
function calculateXP() {
  let xp = 0;
  Object.values(cellData).forEach(v => {
    if (v === 'green') xp += 10;
    else if (v === 'amber') xp += 5;
  });
  return xp;
}

function getLevelInfo(xp) {
  let current = LEVELS[0], next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }
  const progress = next ? ((xp - current.xp) / (next.xp - current.xp)) * 100 : 100;
  return { current, next, progress };
}

function renderXPWidget() {
  const xp = calculateXP();
  const { current, next, progress } = getLevelInfo(xp);
  document.getElementById('xp-level-badge').textContent = `Lv.${current.lvl}`;
  document.getElementById('xp-level-name').textContent = current.name;
  document.getElementById('xp-current').textContent = xp;
  document.getElementById('xp-next').textContent = next ? next.xp : '∞';
  document.getElementById('xp-total').textContent = xp;
  document.getElementById('xp-bar-fill').style.width = Math.min(100, progress) + '%';
}

// ── ACHIEVEMENTS (10,000 Days System) ─────────────────
function checkAchievements() {
  const { streak, max } = calcStreak();
  const allKeys = Object.keys(cellData);
  const uniqueDays = new Set(allKeys.map(k => k.split('_')[0])).size;
  const greenCount = Object.values(cellData).filter(v => v === 'green').length;
  const xp = calculateXP();
  const { current } = getLevelInfo(xp);

  let hasPerfectDay = false;
  let hasPerfectWeek = false;
  let hasAllHabits = false;
  let hasNoRed30Days = false;
  let hasPerfectWeekend = false;

  // Check perfect day (last 90 days)
  for (let i = 0; i < 90; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (dayStats(d).pct === 100) { hasPerfectDay = true; break; }
  }

  // Check perfect week (7 consecutive perfect days)
  let consecutivePerfect = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (dayStats(d).pct === 100) {
      consecutivePerfect++;
      if (consecutivePerfect >= 7) { hasPerfectWeek = true; break; }
    } else {
      consecutivePerfect = 0;
    }
  }

  // Check all habits in one day (last 30 days)
  for (let i = 0; i < 30; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = dayStats(d);
    if (ds.g === habits.length && habits.length > 0) { hasAllHabits = true; break; }
  }

  // Check 30 days without red
  let noRedCount = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = dayStats(d);
    if (ds.r === 0 && ds.pct > 0) {
      noRedCount++;
      if (noRedCount >= 30) { hasNoRed30Days = true; break; }
    } else {
      noRedCount = 0;
    }
  }

  // Check perfect weekend (last 4 weekends)
  for (let w = 0; w < 4; w++) {
    const now = new Date();
    const thisSat = new Date(now);
    thisSat.setDate(now.getDate() - now.getDay() + 6 - w * 7);
    const thisSun = new Date(thisSat);
    thisSun.setDate(thisSat.getDate() + 1);
    if (dayStats(thisSat).pct === 100 && dayStats(thisSun).pct === 100) {
      hasPerfectWeekend = true;
      break;
    }
  }

  const checks = {
    'first_day':      allKeys.length >= 1,
    'first_week':     uniqueDays >= 7,
    'perfect_day':    hasPerfectDay,
    'streak_7':       streak >= 7 || max >= 7,
    'streak_14':      streak >= 14 || max >= 14,
    'streak_30':      streak >= 30 || max >= 30,
    'streak_60':      streak >= 60 || max >= 60,
    'streak_100':     streak >= 100 || max >= 100,
    'century':        greenCount >= 100,
    'streak_200':     streak >= 200 || max >= 200,
    'streak_365':     streak >= 365 || max >= 365,
    'streak_500':     streak >= 500 || max >= 500,
    'perfect_week':   hasPerfectWeek,
    'streak_1000':    streak >= 1000 || max >= 1000,
    'streak_2000':    streak >= 2000 || max >= 2000,
    'all_habits':     hasAllHabits,
    'streak_3000':    streak >= 3000 || max >= 3000,
    'streak_5000':    streak >= 5000 || max >= 5000,
    'streak_10000':   streak >= 10000 || max >= 10000,
    'comeback':       hadBrokenStreak && streak >= 3,
    'marathon':       hasNoRed30Days,
    'weekend_warrior': hasPerfectWeekend,
    'green_500':      greenCount >= 500,
    'green_1000':     greenCount >= 1000,
    'level_10':       current.lvl >= 10
  };

  // Handle broken streak detection
  if (streak === 0 && uniqueDays >= 2) {
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (dayStats(yesterday).pct < 50) {
      for (let i = 2; i < 60; i++) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        if (dayStats(d).pct >= 50) {
          hadBrokenStreak = true;
          save('ddt_hadbroken', true);
          break;
        }
      }
    }
  }

  let newlyUnlocked = [];
  BADGES.forEach(b => {
    if (!unlockedBadges.includes(b.id) && checks[b.id]) {
      unlockedBadges.push(b.id);
      newlyUnlocked.push(b);
    }
  });

  if (newlyUnlocked.length > 0) {
    save('ddt_badges', unlockedBadges);
    showAchPopup(newlyUnlocked[0]);
    triggerConfetti();
  }
}

function checkLevelUp() {
  const xp = calculateXP();
  const { current } = getLevelInfo(xp);
  if (current.lvl > lastLevel) {
    lastLevel = current.lvl;
    save('ddt_lastlevel', lastLevel);
    showLevelUpPopup(current);
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 200, spread: 120, origin: { y: 0.5 },
        colors: ['#6e56ff', '#a08cff', '#05f58e', '#ffbe3d']
      });
    }
  }
}

function checkProgression() {
  checkAchievements();
  checkLevelUp();
  renderXPWidget();
  if (activeTab === 'achievements') renderAchievements();
}

function showAchPopup(badge) {
  document.getElementById('ach-popup-icon').textContent = badge.icon;
  document.getElementById('ach-popup-name').textContent = badge.name;
  document.getElementById('ach-popup-desc').textContent = `${badge.desc} [${badge.difficulty}]`;
  document.getElementById('ach-popup').classList.add('show');
}

function closeAchPopup() { document.getElementById('ach-popup').classList.remove('show'); }

function showLevelUpPopup(level) {
  document.getElementById('levelup-num').textContent = `Lv.${level.lvl}`;
  document.getElementById('levelup-name').textContent = level.name;
  document.getElementById('levelup-popup').classList.add('show');
}

function closeLevelUpPopup() { document.getElementById('levelup-popup').classList.remove('show'); }

function renderAchievements() {
  const grid = document.getElementById('ach-grid');
  grid.innerHTML = BADGES.map(b => {
    const unlocked = unlockedBadges.includes(b.id);
    const tierClass = b.tier === 'godlike' ? 'tier-godlike' : '';
    const daysText = b.days > 0 ? `${b.days} days` : (b.special === 'greens' ? `${b.count} greens` : b.special === 'level' ? `Level ${b.count}` : 'Special');

    return `<div class="ach-card ${unlocked ? 'unlocked' : 'locked'} ${tierClass}">
      <span class="ach-icon">${b.icon}</span>
      <div class="ach-name">${b.name}</div>
      <div class="ach-desc">${b.desc}</div>
      <div class="ach-days">${daysText}</div>
      <div class="ach-status">${unlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}</div>
      <div class="ach-difficulty">${b.difficulty}</div>
    </div>`;
  }).join('');

  document.getElementById('ach-progress-label').textContent =
    `${unlockedBadges.length} / ${BADGES.length} unlocked`;
}

// ── LEADERBOARD ───────────────────────────────────────
function generateFakeCompetitors() {
  const competitors = [];
  const userXP = calculateXP();
  const userStreak = calcStreak().streak;
  const numCompetitors = 30 + Math.floor(Math.random() * 20);

  for (let i = 0; i < numCompetitors; i++) {
    const name = FAKE_NAMES[i % FAKE_NAMES.length] + (i >= FAKE_NAMES.length ? ` ${Math.floor(i/FAKE_NAMES.length)+1}` : '');
    const baseXP = Math.floor(Math.random() * 8000) + 500;
    const streak = Math.floor(Math.random() * 100) + 1;
    const trend = Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down';

    competitors.push({
      id: i + 1, name, xp: baseXP,
      level: getLevelInfo(baseXP).current.lvl,
      streak, trend, isFake: true,
      avatar: AVATAR_EMOJIS[i % AVATAR_EMOJIS.length]
    });
  }

  competitors.push({
    id: 999, name: "You", xp: userXP,
    level: getLevelInfo(userXP).current.lvl,
    streak: userStreak, trend: 'up', isFake: false, avatar: ""
  });

  competitors.sort((a, b) => b.xp - a.xp);
  competitors.forEach((c, index) => { c.rank = index + 1; });

  return competitors;
}

function getLeaderboardData() {
  const allCompetitors = generateFakeCompetitors();

  if (currentLeaderboardPeriod === 'weekly') {
    allCompetitors.forEach(c => {
      c.displayXP = c.isFake ? Math.floor(c.xp * 0.3) : c.xp;
    });
  } else if (currentLeaderboardPeriod === 'monthly') {
    allCompetitors.forEach(c => {
      c.displayXP = c.isFake ? Math.floor(c.xp * 0.6) : c.xp;
    });
  } else {
    allCompetitors.forEach(c => c.displayXP = c.xp);
  }

  allCompetitors.sort((a, b) => b.displayXP - a.displayXP);
  allCompetitors.forEach((c, index) => { c.rank = index + 1; });

  return allCompetitors;
}

function renderLeaderboard() {
  const leaderboard = getLeaderboardData();
  const listEl = document.getElementById('leaderboard-list');
  const userRankEl = document.getElementById('user-rank');
  const xpNeededEl = document.getElementById('xp-needed');
  const totalCompetitorsEl = document.getElementById('total-competitors');

  if (!listEl) return;

  const user = leaderboard.find(c => !c.isFake);

  if (user) {
    userRankEl.textContent = `#${user.rank}`;
    totalCompetitorsEl.textContent = leaderboard.length;

    if (user.rank > 10) {
      const top10XP = leaderboard[9].displayXP;
      const needed = top10XP - user.displayXP;
      xpNeededEl.textContent = `${needed.toLocaleString()} XP`;
    } else {
      xpNeededEl.textContent = "✓ Top 10!";
    }
  }

  const displayList = user.rank <= 20 ? leaderboard.slice(0, 20) : [...leaderboard.slice(0, 19), user];

  listEl.innerHTML = displayList.map(c => {
    const isCurrentUser = !c.isFake;
    const rankClass = c.rank === 1 ? 'top-1' : c.rank <= 3 ? 'top-3' : '';
    const trendIcon = c.trend === 'up' ? '↑' : c.trend === 'down' ? '↓' : '−';
    const trendClass = c.trend === 'up' ? 'up' : c.trend === 'down' ? 'down' : '';

    return `
      <div class="lb-item ${isCurrentUser ? 'current-user' : ''}">
        <div class="lb-rank ${rankClass}">${c.rank}</div>
        <div class="lb-avatar">${c.avatar}</div>
        <div class="lb-info">
          <div class="lb-name">${c.name} ${isCurrentUser ? '(You)' : ''}</div>
          <div class="lb-level">Level ${c.level} • ${c.streak} day streak</div>
        </div>
        <div class="lb-stats">
          <div class="lb-streak">🔥 ${c.streak}</div>
          <div class="lb-trend ${trendClass}">${trendIcon}</div>
          <div class="lb-xp">${c.displayXP.toLocaleString()} XP</div>
        </div>
      </div>
    `;
  }).join('');
}

function setLeaderboardPeriod(period, btn) {
  currentLeaderboardPeriod = period;
  document.querySelectorAll('.lb-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderLeaderboard();
}

function refreshLeaderboard() {
  fakeCompetitors = [];
  renderLeaderboard();
  showToast('🏆 Leaderboard refreshed!');
}

// ── RENDER ROUTER ─────────────────────────────────────
function renderAll() {
  const dates = getWeekDates(weekOffset);
  updateWeekLabel(dates);
  updateStreakWidget();
  renderXPWidget();

  if (activeTab === 'tracker')      renderTracker(dates);
  if (activeTab === 'tasks')        renderTasks(dates);
  if (activeTab === 'calendar')     renderCalendar();
  if (activeTab === 'stats')        renderStats(dates);
  if (activeTab === 'achievements') renderAchievements();
  if (activeTab === 'leaderboard')  renderLeaderboard();
  if (activeTab === 'settings')     renderSettings();
}

function updateWeekLabel(dates) {
  const label = weekOffset === 0 ? 'This Week'
    : weekOffset === -1 ? 'Last Week'
    : weekOffset === 1  ? 'Next Week'
    : `${weekOffset > 0 ? '+' : ''}${weekOffset}w`;

  document.getElementById('week-range').textContent =
    `${fmtShort(dates[0])} – ${fmtShort(dates[6])} · ${label}`;
}

function updateStreakWidget() {
  const { streak } = calcStreak();
  document.getElementById('streak-num').textContent = streak;
}

function setQuote() {
  const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById('quote-ticker').textContent = `"${q}"`;
}

// ── TRACKER TAB ───────────────────────────────────────
function renderTracker(dates) {
  renderScoreStrip(dates);
  renderHabitTable(dates);
}

function renderScoreStrip(dates) {
  const ws = weekStats(dates);
  const pctColor = ws.pct >= 70 ? 'var(--green)' : ws.pct >= 40 ? 'var(--amber)' : 'var(--red)';
  document.getElementById('score-strip').innerHTML = `
    <div class="score-card green-card"><div class="val">${ws.tg}</div><div class="lbl">✓ COMPLETED</div><div class="sub">Green cells this week</div></div>
    <div class="score-card amber-card"><div class="val">${ws.ta}</div><div class="lbl">~ PARTIAL</div><div class="sub">Half-point cells</div></div>
    <div class="score-card red-card"><div class="val">${ws.tr}</div><div class="lbl">✗ SKIPPED</div><div class="sub">Missed this week</div></div>
    <div class="score-card pct-card"><div class="val" style="color:${pctColor}">${ws.pct}%</div><div class="lbl">WEEK SCORE</div><div class="sub">Earned / possible pts</div></div>
  `;
}

function renderHabitTable(dates) {
  const ds = dates.map(d => dayStats(d));

  let head = `<thead><tr>
    <th class="habit-name-th">HABIT / POINTS</th>
    ${dates.map((d, i) => {
      const pct = ds[i].pct;
      const col = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : pct > 0 ? 'var(--red)' : 'var(--text3)';
      const today = isToday(d);
      return `<th class="day-th ${today ? 'today-col' : ''}">
        <div class="day-th-inner">
          ${today ? '<span class="today-dot"></span>' : ''}
          <span class="day-name-lbl">${DAY_NAMES[d.getDay()]}</span>
          <span class="day-date-lbl">${fmtShort(d)}</span>
          <span class="day-pct-lbl" style="color:${col}">${pct}%</span>
          <div class="pct-bar-wrap"><div class="pct-bar-fill" style="width:${pct}%;background:${col}"></div></div>
        </div>
      </th>`;
    }).join('')}
  </tr></thead>`;

  let body = '<tbody>';
  habits.forEach(h => {
    body += `<tr>
      <td class="name-cell">
        <div class="habit-name-text">${h.name}</div>
        <div class="habit-pts-badge">◈ ${h.pts} pts</div>
      </td>
      ${dates.map(d => {
        const s = getStatus(h.id, d);
        const cls = `cell-${s}`;
        const icon = STATUS_ICONS[s];
        const today = isToday(d);
        const key = `${isoDate(d)}_${h.id}`;
        const hasNote = cellNotes[key] ? 'has-note' : '';
        const readonlyClass = today ? '' : 'readonly';
        const onclickHandler = today
          ? `cycleStatus(${h.id},'${isoDate(d)}'); addRipple(event, this)`
          : `showToast('⚠️ Only TODAY editable!')`;
        const oncontextHandler = today
          ? `event.preventDefault(); openCellNote(${h.id},'${isoDate(d)}')`
          : `event.preventDefault(); showToast('⚠️ Only TODAY editable!')`;

        return `<td class="${today ? 'today-cell' : ''}">
          <button class="cell-btn ${cls} ${hasNote} ${readonlyClass}"
            onclick="${onclickHandler}"
            oncontextmenu="${oncontextHandler}"
            title="${h.name} · ${fmtShort(d)} · ${s}${cellNotes[key] ? '\n📝 ' + cellNotes[key] : ''}${!today ? '\n🔒 Read-only (past day)' : ''}"
            aria-label="${h.name} ${fmtShort(d)}: ${s}">${icon}</button>
        </td>`;
      }).join('')}
    </tr>`;
  });
  body += '</tbody>';

  document.getElementById('habit-table').innerHTML = head + body;
}

function addRipple(e, btn) {
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
  ripple.style.top  = (e.clientY - rect.top - size/2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// ── TASKS TAB (Only TODAY editable) ──────────────────
function renderTasks(dates) {
  renderTasksGrid(dates);
  renderNotesGrid(dates);
}

function getTasksForDay(dk) {
  return taskData[dk] || Array.from({ length: 5 }, () => ({ text: '', done: false }));
}

function renderTasksGrid(dates) {
  document.getElementById('tasks-week-grid').innerHTML = dates.map(d => {
    const dk = isoDate(d);
    const dayTasks = getTasksForDay(dk);
    const doneCount = dayTasks.filter(t => t.done).length;
    const today = isToday(d);

    return `<div class="task-day-card ${today ? 'today-card' : 'past-card'}">
      <div class="task-day-header ${today ? 'today-hdr' : ''}">
        <span>${DAY_NAMES[d.getDay()]} ${fmtShort(d)}</span>
        <span class="task-done-count">${doneCount}/5 ${!today ? '🔒' : ''}</span>
      </div>
      ${dayTasks.map((t, j) => `<div class="task-item">
        <input type="checkbox" class="task-cb" ${t.done ? 'checked' : ''}
          onchange="${today ? `toggleTask('${dk}',${j},this.checked)` : 'this.checked=!this.checked; showToast(\'⚠️ Only TODAY editable!\')'}"
          ${!today ? 'disabled' : ''}>
        <input class="task-text ${t.done ? 'done-text' : ''}"
          value="${(t.text || '').replace(/"/g, '&quot;')}"
          placeholder="Task ${j+1}..."
          oninput="${today ? `updateTaskText('${dk}',${j},this.value)` : 'showToast(\'⚠️ Only TODAY editable!\')'}"
          ${!today ? 'readonly' : ''}>
      </div>`).join('')}
    </div>`;
  }).join('');
}

function renderNotesGrid(dates) {
  document.getElementById('notes-grid').innerHTML = dates.map(d => {
    const dk = isoDate(d);
    const today = isToday(d);

    return `<div class="note-wrap">
      <div class="note-day-lbl">${DAY_NAMES[d.getDay()]} ${!today ? '🔒' : ''}</div>
      <textarea class="note-textarea" rows="4" placeholder="${today ? 'Daily notes...' : 'Read-only (past day)'}"
        oninput="${today ? `updateNote('${dk}',this.value)` : 'showToast(\'⚠️ Only TODAY editable!\')'}"
        ${!today ? 'readonly' : ''}>${noteData[dk] || ''}</textarea>
    </div>`;
  }).join('');
}

function toggleTask(dk, j, checked) {
  if (!isToday(new Date(dk))) { showToast('⚠️ Only TODAY editable!'); return; }
  if (!taskData[dk]) taskData[dk] = Array.from({ length: 5 }, () => ({ text: '', done: false }));
  taskData[dk][j].done = checked;
  save('ddt_tasks', taskData);
  renderTasks(getWeekDates(weekOffset));
}

function updateTaskText(dk, j, val) {
  if (!isToday(new Date(dk))) { showToast('️ Only TODAY editable!'); return; }
  if (!taskData[dk]) taskData[dk] = Array.from({ length: 5 }, () => ({ text: '', done: false }));
  taskData[dk][j].text = val;
  save('ddt_tasks', taskData);
}

function updateNote(dk, val) {
  if (!isToday(new Date(dk))) { showToast('️ Only TODAY editable!'); return; }
  noteData[dk] = val;
  save('ddt_notes', noteData);
}

// ─ STATS TAB ─────────────────────────────────────────
function renderStats(dates) {
  renderStatsTopCards(dates);
  renderAIInsights();
  renderPatterns();
  renderLineChart();
  renderDoughnutChart(dates);
  renderBarChart();
  renderHeatmap();
}

function renderStatsTopCards(dates) {
  const ws = weekStats(dates);
  const { streak, max } = calcStreak();
  const xp = calculateXP();

  document.getElementById('stats-top-cards').innerHTML = `
    <div class="stat-card"><div class="stat-val" style="color:var(--amber)">${streak}</div><div class="stat-lbl">Current Streak</div><div class="stat-sub">days ≥50% score</div></div>
    <div class="stat-card"><div class="stat-val" style="color:var(--accent2)">${max}</div><div class="stat-lbl">Best Streak</div><div class="stat-sub">all time</div></div>
    <div class="stat-card"><div class="stat-val" style="color:var(--green)">${ws.pct}%</div><div class="stat-lbl">This Week Score</div><div class="stat-sub">earned / possible</div></div>
    <div class="stat-card"><div class="stat-val" style="color:var(--text)">${xp}</div><div class="stat-lbl">Total XP</div><div class="stat-sub">${unlockedBadges.length}/${BADGES.length} badges</div></div>
  `;
}

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

function renderLineChart() {
  destroyChart('line');
  const labels = [], pcts = [];
  for (let w = 7; w >= 0; w--) {
    const dates = getWeekDates(-w);
    labels.push(fmtShort(dates[0]));
    pcts.push(weekStats(dates).pct);
  }

  const ctx = document.getElementById('line-chart');
  if (!ctx) return;

  chartInstances['line'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data: pcts,
        borderColor: '#6e56ff',
        backgroundColor: 'rgba(110,86,255,0.12)',
        borderWidth: 2.5,
        pointBackgroundColor: '#6e56ff',
        pointRadius: 4,
        tension: 0.38,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.raw}%` } }
      },
      scales: {
        y: { min: 0, max: 100, ticks: { color: '#5a5a7a', callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { ticks: { color: '#5a5a7a', font: { size: 10 } }, grid: { display: false } }
      }
    }
  });
}

function renderDoughnutChart(dates) {
  destroyChart('doughnut');
  const ws = weekStats(dates);
  const ctx = document.getElementById('doughnut-chart');
  if (!ctx) return;

  const total = ws.tg + ws.ta + ws.tr;
  if (total === 0) return;

  chartInstances['doughnut'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Green', 'Amber', 'Red'],
      datasets: [{
        data: [ws.tg, ws.ta, ws.tr],
        backgroundColor: ['rgba(5,245,142,0.75)', 'rgba(255,190,61,0.75)', 'rgba(255,77,106,0.75)'],
        borderColor: ['#05f58e', '#ffbe3d', '#ff4d6a'],
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: '#9090b0', font: { size: 11 }, padding: 12, boxWidth: 10 }
        }
      }
    }
  });
}

function renderBarChart() {
  destroyChart('bar');
  const today = new Date();
  const pcts = habits.map(h => {
    let g = 0, tot = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const s = getStatus(h.id, d);
      tot++;
      if (s === 'green') g++;
      else if (s === 'amber') g += 0.5;
    }
    return Math.round(g / tot * 100);
  });

  const ctx = document.getElementById('bar-chart');
  if (!ctx) return;

  chartInstances['bar'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: habits.map(h => h.name.length > 20 ? h.name.slice(0, 20) + '…' : h.name),
      datasets: [{
        data: pcts,
        backgroundColor: pcts.map(p => p >= 70 ? 'rgba(5,245,142,0.65)' : p >= 40 ? 'rgba(255,190,61,0.65)' : 'rgba(255,77,106,0.65)'),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.raw}%` } }
      },
      scales: {
        y: { min: 0, max: 100, ticks: { color: '#5a5a7a', callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { ticks: { color: '#5a5a7a', font: { size: 10 }, maxRotation: 28 }, grid: { display: false } }
      }
    }
  });
}

function renderHeatmap() {
  const today = new Date();
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    days.push({ date: d, pct: dayStats(d).pct });
  }

  const rows = [];
  for (let r = 0; r < Math.ceil(days.length / 7); r++) {
    rows.push(days.slice(r * 7, r * 7 + 7));
  }

  const getColor = pct =>
    pct >= 80 ? 'var(--green)' :
    pct >= 55 ? 'rgba(5,245,142,0.45)' :
    pct >= 30 ? 'var(--amber)' :
    pct > 0  ? 'rgba(255,77,106,0.55)' :
    'rgba(255,255,255,0.05)';

  const html = `<div class="heatmap-grid">
    ${rows.map(row => `<div class="heatmap-row-wrap">
      <span class="heatmap-week-lbl">${fmtShort(row[0].date)}</span>
      ${row.map(cell => `<div class="heatmap-cell" style="background:${getColor(cell.pct)}" title="${fmtShort(cell.date)} — ${cell.pct}%"></div>`).join('')}
    </div>`).join('')}
  </div>
  <div class="heatmap-legend">
    <span><span class="hl-dot" style="background:var(--green)"></span>80%+</span>
    <span><span class="hl-dot" style="background:rgba(5,245,142,0.45)"></span>55–79%</span>
    <span><span class="hl-dot" style="background:var(--amber)"></span>30–54%</span>
    <span><span class="hl-dot" style="background:rgba(255,77,106,0.55)"></span>1–29%</span>
    <span><span class="hl-dot" style="background:rgba(255,255,255,0.05)"></span>No data</span>
  </div>`;

  document.getElementById('heatmap-container').innerHTML = html;
}

// ── AI COACH ─────────────────────────────────────────
function generateAIInsights() {
  const insights = [];
  const today = new Date();

  habits.forEach(h => {
    const weeks = [0, 0, 0];
    for (let w = 0; w < 3; w++) {
      let g = 0, tot = 0;
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (w * 7 + d));
        const s = getStatus(h.id, date);
        tot++;
        if (s === 'green') g++;
        else if (s === 'amber') g += 0.5;
      }
      weeks[w] = tot > 0 ? Math.round(g / tot * 100) : -1;
    }

    if (weeks[0] >= 0 && weeks[2] >= 0) {
      const drop = weeks[2] - weeks[0];
      if (drop >= 30 && weeks[0] < 50) {
        insights.push({
          priority: 'high', icon: '📉',
          title: `${h.name} is declining`,
          desc: `Dropped from ${weeks[2]}% → ${weeks[0]}% in 3 weeks.`,
          tip: `💡 Try the "2-minute rule" — commit to just 2 minutes daily.`
        });
      } else if (drop <= -30 && weeks[0] >= 70) {
        insights.push({
          priority: 'low', icon: '📈',
          title: `${h.name} is improving!`,
          desc: `Rose from ${weeks[2]}% → ${weeks[0]}% — great momentum!`,
          tip: `💡 Consistency beats intensity. Keep the streak going.`
        });
      }
    }

    if (weeks[0] === 0 && weeks[1] === 0 && weeks[2] === 0) {
      insights.push({
        priority: 'high', icon: '⚠️',
        title: `${h.name} untouched for 3 weeks`,
        desc: `You haven't tracked this habit in 21 days.`,
        tip: `💡 Consider removing it OR break it into a smaller version.`
      });
    }
  });

  const { streak, max } = calcStreak();
  if (streak >= 3 && streak < 7) {
    insights.push({
      priority: 'med', icon: '🚀',
      title: `Building momentum: ${streak} days`,
      desc: `You're on a roll! 4 more days unlocks "Week Warrior".`,
      tip: `💡 Even partial (amber) counts toward your streak.`
    });
  } else if (streak >= 7 && streak < 14) {
    insights.push({
      priority: 'low', icon: '⚡',
      title: `${streak}-day streak — you're disciplined!`,
      desc: `Keep going — 14 days unlocks "Fortnight Force".`,
      tip: `💡 21 days forms a habit. You're 1/3 there!`
    });
  }

  const thisWeek = weekStats(getWeekDates(0));
  const lastWeek = weekStats(getWeekDates(-1));
  if (lastWeek.pct > 0 && thisWeek.pct > 0) {
    const diff = thisWeek.pct - lastWeek.pct;
    if (diff >= 15) {
      insights.push({
        priority: 'low', icon: '',
        title: `This week is ${diff}% better than last!`,
        desc: `${lastWeek.pct}% → ${thisWeek.pct}%. You're leveling up.`,
        tip: `💡 Identify what changed — better sleep? Earlier start?`
      });
    } else if (diff <= -15) {
      insights.push({
        priority: 'med', icon: '⚠️',
        title: `This week is ${Math.abs(diff)}% worse than last`,
        desc: `${lastWeek.pct}% → ${thisWeek.pct}%. Something shifted.`,
        tip: `💡 Check your journal notes — was there a trigger?`
      });
    }
  }

  const allKeys = Object.keys(cellData);
  const totalMarked = allKeys.filter(k => cellData[k] !== 'none').length;
  if (totalMarked >= 100) {
    const greenCount = allKeys.filter(k => cellData[k] === 'green').length;
    const overallPct = Math.round(greenCount / totalMarked * 100);
    if (overallPct >= 75) {
      insights.push({
        priority: 'low', icon: '',
        title: `You're a discipline master!`,
        desc: `${overallPct}% all-time green rate across ${totalMarked} cells.`,
        tip: `💡 Focus on quality — refine habits, raise the bar.`
      });
    } else if (overallPct < 40) {
      insights.push({
        priority: 'high', icon: '🎯',
        title: `Overall consistency needs work`,
        desc: `${overallPct}% all-time green rate. Let's rebuild.`,
        tip: `💡 Pick just ONE habit to focus on this week.`
      });
    }
  }

  const order = { high: 0, med: 1, low: 2, info: 3 };
  insights.sort((a, b) => order[a.priority] - order[b.priority]);
  return insights.slice(0, 8);
}

function renderAIInsights() {
  const insights = generateAIInsights();
  const grid = document.getElementById('ai-grid');

  if (insights.length === 0) {
    grid.innerHTML = `<div class="ai-card priority-info"><div class="ai-icon">🤖</div><div class="ai-body"><div class="ai-title">AI Coach needs more data</div><div class="ai-desc">Track at least 2 weeks to unlock personalized coaching.</div></div></div>`;
    return;
  }

  grid.innerHTML = insights.map(ins => `<div class="ai-card priority-${ins.priority}">
    <div class="ai-icon">${ins.icon}</div>
    <div class="ai-body">
      <div class="ai-title">
        ${ins.title}
        ${ins.priority === 'high' ? '<span class="ai-priority-tag high">URGENT</span>' : ''}
        ${ins.priority === 'med' ? '<span class="ai-priority-tag med">NOTICE</span>' : ''}
      </div>
      <div class="ai-desc">${ins.desc}</div>
      ${ins.tip ? `<div class="ai-tip">${ins.tip}</div>` : ''}
    </div>
  </div>`).join('');
}

// ── PATTERN DETECTION ─────────────────────────────────
function detectPatterns() {
  const insights = [];
  const today = new Date();
  const dowStats = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }));

  for (let i = 0; i < 30; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const pct = dayStats(d).pct;
    const dow = d.getDay();
    dowStats[dow].total += pct;
    dowStats[dow].count++;
  }

  const dowAvg = dowStats.map((s, i) => ({
    dow: i, avg: s.count > 0 ? Math.round(s.total / s.count) : 0
  })).filter(d => d.avg > 0);

  if (dowAvg.length >= 3) {
    const best = dowAvg.reduce((a, b) => a.avg > b.avg ? a : b);
    const worst = dowAvg.reduce((a, b) => a.avg < b.avg ? a : b);
    if (best.avg - worst.avg >= 20) {
      insights.push({ type: 'info', icon: '📊', title: `Your best day is ${DAY_FULL[best.dow]}`, desc: `You average ${best.avg}% on ${DAY_FULL[best.dow]}s.` });
      insights.push({ type: worst.avg < 40 ? 'bad' : 'warn', icon: worst.avg < 40 ? '⚠️' : '💡', title: `You tend to skip ${DAY_FULL[worst.dow]}s`, desc: `Your ${DAY_FULL[worst.dow]} average is only ${worst.avg}%.` });
    }
  }

  const habitStats = habits.map(h => {
    let g = 0, tot = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const s = getStatus(h.id, d);
      tot++;
      if (s === 'green') g++;
      else if (s === 'amber') g += 0.5;
    }
    return { habit: h, pct: tot > 0 ? Math.round(g / tot * 100) : 0 };
  }).filter(h => h.pct > 0);

  if (habitStats.length >= 2) {
    const bestH = habitStats.reduce((a, b) => a.pct > b.pct ? a : b);
    const worstH = habitStats.reduce((a, b) => a.pct < b.pct ? a : b);
    if (bestH.pct >= 60) insights.push({ type: 'good', icon: '⭐', title: `Strong habit: ${bestH.habit.name}`, desc: `${bestH.pct}% completion — keep it up!` });
    if (worstH.pct < 50 && worstH.pct < bestH.pct - 20) insights.push({ type: 'warn', icon: '', title: `Struggling with: ${worstH.habit.name}`, desc: `Only ${worstH.pct}% completion.` });
  }

  const { streak, max } = calcStreak();
  if (streak >= 7) insights.push({ type: 'good', icon: '🔥', title: `${streak}-day streak going strong!`, desc: `Best ever: ${max} days.` });
  else if (streak === 0 && max >= 3) insights.push({ type: 'warn', icon: '💪', title: 'Time to rebuild your streak', desc: `Your best was ${max} days.` });

  return insights.slice(0, 5);
}

function renderPatterns() {
  const insights = detectPatterns();
  const grid = document.getElementById('pattern-grid');

  if (insights.length === 0) {
    grid.innerHTML = `<div class="pattern-card"><div class="pattern-icon info">📊</div><div class="pattern-body"><div class="pattern-title">Not enough data yet</div><div class="pattern-desc">Track at least 7 days to see patterns.</div></div></div>`;
    return;
  }

  grid.innerHTML = insights.map(ins => `<div class="pattern-card">
    <div class="pattern-icon ${ins.type}">${ins.icon}</div>
    <div class="pattern-body">
      <div class="pattern-title">${ins.title}</div>
      <div class="pattern-desc">${ins.desc}</div>
    </div>
  </div>`).join('');
}

// ── WEEKLY REPORT ─────────────────────────────────────
function generateWeeklyReport(dates = null) {
  if (!dates) dates = getWeekDates(-1);
  const ws = weekStats(dates);
  const { streak, max } = calcStreak();
  const xp = calculateXP();
  const { current } = getLevelInfo(xp);
  const period = `${fmtLong(dates[0])} → ${fmtLong(dates[6])}`;

  const habitPerf = habits.map(h => {
    let g = 0, a = 0, r = 0;
    dates.forEach(d => {
      const s = getStatus(h.id, d);
      if (s === 'green') g++;
      else if (s === 'amber') a++;
      else if (s === 'red') r++;
    });
    const pct = Math.round((g + a * 0.5) / 7 * 100);
    return { name: h.name, g, a, r, pct };
  });

  const dayPcts = dates.map(d => ({ date: d, pct: dayStats(d).pct }));
  const bestDay = dayPcts.reduce((a, b) => a.pct > b.pct ? a : b);
  const worstDay = dayPcts.reduce((a, b) => a.pct < b.pct ? a : b);
  const sortedHabits = [...habitPerf].sort((a, b) => b.pct - a.pct);
  const bestHabit = sortedHabits[0];
  const worstHabit = sortedHabits[sortedHabits.length - 1];

  let md = `# 📊 Weekly Discipline Report\n**${period}**\n\n`;
  md += `## 🎯 Overview\n| Metric | Value |\n|---|---|\n`;
  md += `| Week Score | **${ws.pct}%** |\n| Green Cells | ${ws.tg} |\n| Amber Cells | ${ws.ta} |\n| Red Cells | ${ws.tr} |\n| Current Streak | 🔥 ${streak} days |\n| Best Streak | ${max} days |\n| Level | Lv.${current.lvl} ${current.name} |\n| Total XP | ${xp} |\n\n`;
  md += `##  Daily Breakdown\n`;
  dates.forEach(d => {
    const ds = dayStats(d);
    md += `- **${DAY_FULL[d.getDay()]}** ${fmtShort(d)}: ${ds.pct}% (${ds.g}✓ ${ds.a}~ ${ds.r}✗)\n`;
  });
  md += `\n## 🏆 Habit Performance\n`;
  habitPerf.forEach(h => {
    const bar = '█'.repeat(Math.round(h.pct / 10)) + '░'.repeat(10 - Math.round(h.pct / 10));
    md += `- **${h.name}** — ${h.pct}% [${bar}] (${h.g}✓ ${h.a}~ ${h.r}✗)\n`;
  });
  md += `\n## 💡 Highlights\n`;
  md += `- 🌟 **Best day:** ${DAY_FULL[bestDay.date.getDay()]} (${bestDay.pct}%)\n`;
  if (worstDay.pct > 0) md += `- 📉 **Toughest day:** ${DAY_FULL[worstDay.date.getDay()]} (${worstDay.pct}%)\n`;
  md += `-  **Top habit:** ${bestHabit.name} (${bestHabit.pct}%)\n`;
  if (worstHabit.pct < 100) md += `- 🎯 **Needs work:** ${worstHabit.name} (${worstHabit.pct}%)\n`;
  md += `\n## 🤖 AI Recommendation\n`;
  if (ws.pct >= 80) md += `Outstanding week! Elite level. Maintain momentum.\n`;
  else if (ws.pct >= 60) md += `Solid performance. Focus on your weakest habit.\n`;
  else if (ws.pct >= 40) md += `Progress being made. Try the "never miss twice" rule.\n`;
  else md += `Tough week — that's okay. Pick ONE habit to master.\n`;
  md += `\n---\n*Generated by Daily Discipline Tracker · ${fmtLong(new Date())}*\n`;

  return { md, period, ws, habitPerf, bestDay, worstDay, bestHabit, worstHabit, streak, max, xp, current };
}

function showWeeklyReport() {
  const report = generateWeeklyReport();
  currentReportText = report.md;
  document.getElementById('report-period').textContent = report.period;

  let html = `<h3> Overview</h3>`;
  html += `<div class="report-stat-row"><span class="report-stat-label">Week Score</span><span class="report-stat-value">${report.ws.pct}%</span></div>`;
  html += `<div class="report-stat-row"><span class="report-stat-label">Green / Amber / Red</span><span class="report-stat-value">${report.ws.tg} / ${report.ws.ta} / ${report.ws.tr}</span></div>`;
  html += `<div class="report-stat-row"><span class="report-stat-label">Current Streak</span><span class="report-stat-value">🔥 ${report.streak} days</span></div>`;
  html += `<div class="report-stat-row"><span class="report-stat-label">Level</span><span class="report-stat-value">Lv.${report.current.lvl} ${report.current.name}</span></div>`;
  html += `<div class="report-stat-row"><span class="report-stat-label">Total XP</span><span class="report-stat-value">${report.xp}</span></div>`;

  html += `<h3>🏆 Habit Performance</h3>`;
  report.habitPerf.forEach(h => {
    const color = h.pct >= 70 ? 'var(--green)' : h.pct >= 40 ? 'var(--amber)' : 'var(--red)';
    html += `<div class="report-habit-row">
      <div style="flex:1;font-size:12px;color:var(--text);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${h.name}">${h.name}</div>
      <div class="report-habit-bar"><div class="report-habit-fill" style="width:${h.pct}%;background:${color}"></div></div>
      <div class="report-habit-pct">${h.pct}%</div>
    </div>`;
  });

  html += `<h3>💡 Highlights</h3>`;
  html += `<div class="report-stat-row"><span class="report-stat-label">🌟 Best day</span><span class="report-stat-value">${DAY_FULL[report.bestDay.date.getDay()]} (${report.bestDay.pct}%)</span></div>`;
  if (report.worstDay.pct > 0) html += `<div class="report-stat-row"><span class="report-stat-label">📉 Toughest day</span><span class="report-stat-value">${DAY_FULL[report.worstDay.date.getDay()]} (${report.worstDay.pct}%)</span></div>`;
  html += `<div class="report-stat-row"><span class="report-stat-label">⭐ Top habit</span><span class="report-stat-value" style="font-size:10px">${report.bestHabit.name}</span></div>`;

  let rec = '';
  if (report.ws.pct >= 80) rec = `Outstanding week! Elite level. Maintain momentum.`;
  else if (report.ws.pct >= 60) rec = `Solid performance. Focus on your weakest habit.`;
  else if (report.ws.pct >= 40) rec = `Progress being made. Consistency over perfection.`;
  else rec = `Tough week — that's okay. Pick ONE habit to master.`;

  html += `<div class="report-insight-box"><strong>🤖 AI Coach:</strong> ${rec}</div>`;

  document.getElementById('report-content').innerHTML = html;
  document.getElementById('report-modal').classList.add('show');

  const weekKey = isoDate(getWeekDates(0)[0]);
  lastReportWeek = weekKey;
  save('ddt_lastreport', lastReportWeek);
}

function copyReport() {
  if (!currentReportText) return;
  navigator.clipboard.writeText(currentReportText).then(() => {
    showToast(' Report copied!');
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = currentReportText;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('📋 Report copied!');
  });
}

function downloadReport() {
  if (!currentReportText) return;
  const a = document.createElement('a');
  a.href = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(currentReportText);
  a.download = `weekly_report_${isoDate(new Date())}.md`;
  a.click();
  showToast('📥 Report downloaded');
}

// ── SOCIAL SHARE ──────────────────────────────────────
function openShareModal() {
  const { streak, max } = calcStreak();
  const xp = calculateXP();
  const { current } = getLevelInfo(xp);
  const ws = weekStats(getWeekDates(0));
  const allKeys = Object.keys(cellData);
  const greenCount = allKeys.filter(k => cellData[k] === 'green').length;

  document.getElementById('share-card-date').textContent = fmtLong(new Date());
  document.getElementById('share-card-stats').innerHTML = `
    <div class="share-stat">
      <div class="share-stat-val" style="color:#05f58e">${streak}</div>
      <div class="share-stat-lbl">Day Streak 🔥</div>
    </div>
    <div class="share-stat">
      <div class="share-stat-val" style="color:#ffbe3d">${ws.pct}%</div>
      <div class="share-stat-lbl">This Week</div>
    </div>
    <div class="share-stat">
      <div class="share-stat-val" style="color:#a08cff">Lv.${current.lvl}</div>
      <div class="share-stat-lbl">${current.name}</div>
    </div>
    <div class="share-stat">
      <div class="share-stat-val" style="color:#6e56ff">${greenCount}</div>
      <div class="share-stat-lbl">Green Cells ✓</div>
    </div>
  `;

  const nativeBtn = document.getElementById('native-share-btn');
  if (navigator.share) nativeBtn.style.display = 'flex';
  else nativeBtn.style.display = 'none';

  document.getElementById('share-modal').classList.add('show');
}

async function downloadShareImage() {
  const card = document.getElementById('share-card');
  showToast('🎨 Generating image...');
  try {
    const canvas = await html2canvas(card, {
      backgroundColor: '#0d0e1a',
      scale: 2,
      useCORS: true,
      logging: false
    });
    const link = document.createElement('a');
    link.download = `discipline_progress_${isoDate(new Date())}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('✅ Image downloaded!');
  } catch (err) {
    console.error(err);
    showToast('❌ Failed to generate image');
  }
}

async function nativeShare() {
  const card = document.getElementById('share-card');
  try {
    const canvas = await html2canvas(card, {
      backgroundColor: '#0d0e1a',
      scale: 2,
      useCORS: true,
      logging: false
    });
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'discipline_progress.png', { type: 'image/png' });
      try {
        await navigator.share({
          title: 'My Discipline Progress',
          text: `Check out my discipline streak! 🔥`,
          files: [file]
        });
        showToast('✅ Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') downloadShareImage();
      }
    }, 'image/png');
  } catch (err) {
    downloadShareImage();
  }
}

// ── CALENDAR VIEW ─────────────────────────────────────
function getCalendarMonth(offset = 0) {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = first.getFullYear();
  const month = first.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = first.getDay();
  const days = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return { year, month, days, first };
}

function renderCalendar() {
  const { year, month, days, first } = getCalendarMonth(calendarMonthOffset);
  const monthLabel = first.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  document.getElementById('calendar-month-label').textContent = monthLabel;

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = days.map(d => {
    if (!d) return `<div class="cal-day empty"></div>`;
    const stats = dayStats(d);
    const today = isToday(d);
    const pctColor = stats.pct >= 80 ? 'var(--green)'
      : stats.pct >= 55 ? 'rgba(5,245,142,0.7)'
      : stats.pct >= 40 ? 'var(--amber)'
      : stats.pct > 0   ? 'var(--red)'
      : 'var(--text3)';

    const dots = habits.map(h => {
      const s = getStatus(h.id, d);
      return `<span class="cal-habit-dot ${s}"></span>`;
    }).join('');

    return `<div class="cal-day ${today ? 'today' : ''}" onclick="showCalendarDay('${isoDate(d)}')">
      <div class="cal-day-num">${d.getDate()}</div>
      <div class="cal-day-dots">${dots}</div>
      <div class="cal-day-pct" style="color:${pctColor}">${stats.pct > 0 ? stats.pct + '%' : '—'}</div>
    </div>`;
  }).join('');

  document.getElementById('calendar-day-detail').innerHTML =
    `<div style="color:var(--text3);font-style:italic">Click any day to see detailed breakdown</div>`;
}

function showCalendarDay(dateStr) {
  const d = new Date(dateStr);
  const stats = dayStats(d);
  const detail = document.getElementById('calendar-day-detail');

  let html = `<div class="cal-detail-title">${DAY_FULL[d.getDay()]}, ${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} · ${stats.pct}%</div>`;

  habits.forEach(h => {
    const s = getStatus(h.id, d);
    html += `<div class="cal-detail-row">
      <div class="cal-detail-status ${s}">${STATUS_ICONS[s]}</div>
      <div style="flex:1;font-size:12px;color:var(--text)">${h.name}</div>
      <div style="font-family:var(--font-mono);font-size:11px;color:var(--accent2)">◈ ${h.pts} pts</div>
    </div>`;
  });

  detail.innerHTML = html;
}

function changeMonth(dir) { calendarMonthOffset += dir; renderCalendar(); }
function goCalendarToday() { calendarMonthOffset = 0; renderCalendar(); }

// ── SETTINGS TAB ──────────────────────────────────────
function renderSettings() {
  const list = document.getElementById('habits-edit-list');
  list.innerHTML = habits.map((h, i) => `<div class="habit-edit-row">
    <input class="s-input" style="flex:1;min-width:100px" value="${h.name}" oninput="updateHabitField(${i},'name',this.value)">
    <input class="s-input pts-input" type="number" value="${h.pts}" min="1" max="10" oninput="updateHabitField(${i},'pts',+this.value)">
    <button class="s-btn danger icon-btn" onclick="deleteHabit(${i})" title="Delete">
      <i class="fa-solid fa-trash"></i>
    </button>
  </div>`).join('');

  const xp = calculateXP();
  document.getElementById('data-info').innerHTML =
    `Total XP: ${xp} · Level: Lv.${getLevelInfo(xp).current.lvl}<br>
     Badges unlocked: ${unlockedBadges.length}/${BADGES.length}<br>
     Total cells tracked: ${Object.keys(cellData).length}<br>
     Cell notes: ${Object.keys(cellNotes).length}<br>
     Task entries: ${Object.keys(taskData).length} days`;
}

function updateHabitField(i, field, val) {
  habits[i][field] = val;
  save('ddt_habits', habits);
}

function deleteHabit(i) {
  if (habits.length <= 1) return alert('Keep at least 1 habit.');
  if (!confirm(`Delete "${habits[i].name}"?`)) return;
  habits.splice(i, 1);
  save('ddt_habits', habits);
  renderAll();
}

function addHabit() {
  const name = document.getElementById('new-habit-name').value.trim();
  const pts  = parseInt(document.getElementById('new-habit-pts').value) || 3;
  if (!name) return;
  habits.push({ id: Date.now(), name, pts });
  save('ddt_habits', habits);
  document.getElementById('new-habit-name').value = '';
  renderAll();
}

// ── CSV EXPORT/IMPORT ─────────────────────────────────
function buildCSV(dates) {
  const cols = dates.map(d => `${DAY_NAMES[d.getDay()]} ${fmtShort(d)}`);
  let csv = 'Habit,Points,' + cols.join(',') + '\n';

  habits.forEach(h => {
    const row = dates.map(d => getStatus(h.id, d));
    csv += `"${h.name}",${h.pts},${row.join(',')}\n`;
  });

  csv += '\n';
  csv += 'Day Score %,,' + dates.map(d => dayStats(d).pct + '%').join(',') + '\n';
  csv += 'Green,,' + dates.map(d => dayStats(d).g).join(',') + '\n';
  csv += 'Amber,,' + dates.map(d => dayStats(d).a).join(',') + '\n';
  csv += 'Red,,' + dates.map(d => dayStats(d).r).join(',') + '\n';

  return csv;
}

function exportCSV() {
  const dates = getWeekDates(weekOffset);
  downloadCSV(buildCSV(dates), `discipline_week_${isoDate(dates[0])}.csv`);
  showToast('📥 Week exported');
}

function exportAllCSV() {
  const keys = Object.keys(cellData);
  if (!keys.length) return alert('No data to export.');

  let allCSV = 'DAILY DISCIPLINE TRACKER — ALL DATA\n\n';
  for (let w = 11; w >= 0; w--) {
    const dates = getWeekDates(-w);
    allCSV += `Week of ${fmtShort(dates[0])}\n`;
    allCSV += buildCSV(dates);
    allCSV += '\n';
  }

  downloadCSV(allCSV, `discipline_all_${isoDate(new Date())}.csv`);
  showToast('📥 All data exported');
}

function downloadCSV(content, filename) {
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  a.download = filename;
  a.click();
}

function importCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const text = e.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) throw new Error('Empty CSV');

      const header = lines[0].split(',');
      const dateCols = [];
      for (let i = 2; i < header.length; i++) {
        const match = header[i].match(/(\d{2})\s+(\w{3})/);
        if (match) {
          const d = new Date(`${match[2]} ${match[1]} ${new Date().getFullYear()}`);
          if (!isNaN(d)) dateCols.push({ idx: i, date: isoDate(d) });
        }
      }

      if (!dateCols.length) throw new Error('No valid date columns found');

      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',');
        if (row.length < 3) continue;
        const name = row[0].replace(/^"|"$/g, '');
        const habit = habits.find(h => h.name.toLowerCase() === name.toLowerCase());
        if (!habit) continue;

        dateCols.forEach(col => {
          const cellStatus = row[col.idx];
          if (['green','amber','red','none'].includes(cellStatus)) {
            cellData[`${col.date}_${habit.id}`] = cellStatus;
            imported++;
          }
        });
      }

      save('ddt_data', cellData);
      renderAll();
      checkProgression();
      showToast(`✅ Imported ${imported} cells from CSV`);
    } catch (err) {
      alert(' Import failed: ' + err.message);
    }
    event.target.value = '';
  };

  reader.readAsText(file);
}

// ── DATA ACTIONS ──────────────────────────────────────
function resetWeek() {
  if (!confirm('Reset ALL habit data for this week?')) return;
  const dates = getWeekDates(weekOffset);
  dates.forEach(d => {
    habits.forEach(h => { delete cellData[`${isoDate(d)}_${h.id}`]; });
  });
  save('ddt_data', cellData);
  renderAll();
}

function clearAllData() {
  if (!confirm('Delete ALL tracker data permanently?')) return;
  cellData = {}; taskData = {}; noteData = {}; cellNotes = {};
  unlockedBadges = []; lastLevel = 1; hadBrokenStreak = false;
  save('ddt_data', cellData);
  save('ddt_tasks', taskData);
  save('ddt_notes', noteData);
  save('ddt_notes_cells', cellNotes);
  save('ddt_badges', unlockedBadges);
  save('ddt_lastlevel', lastLevel);
  save('ddt_hadbroken', hadBrokenStreak);
  renderAll();
}

// ── CELL NOTES ────────────────────────────────────────
function openCellNote(habitId, dateStr) {
  if (!isToday(new Date(dateStr))) { showToast('⚠️ Only TODAY notes editable!'); return; }
  currentNoteKey = `${dateStr}_${habitId}`;
  const habit = habits.find(h => h.id == habitId);
  const date = new Date(dateStr);
  document.getElementById('note-popup-title').textContent = `${habit.name} · ${fmtShort(date)}`;
  document.getElementById('note-popup-text').value = cellNotes[currentNoteKey] || '';
  document.getElementById('note-popup').classList.add('show');
  setTimeout(() => document.getElementById('note-popup-text').focus(), 100);
}

function closeNotePopup() {
  document.getElementById('note-popup').classList.remove('show');
  currentNoteKey = null;
}

function saveCellNote() {
  if (!currentNoteKey) return;
  const val = document.getElementById('note-popup-text').value.trim();
  if (val) cellNotes[currentNoteKey] = val;
  else delete cellNotes[currentNoteKey];
  save('ddt_notes_cells', cellNotes);
  closeNotePopup();
  renderAll();
  showToast('📝 Note saved');
}

function deleteCellNote() {
  if (!currentNoteKey) return;
  delete cellNotes[currentNoteKey];
  save('ddt_notes_cells', cellNotes);
  closeNotePopup();
  renderAll();
  showToast('🗑️ Note deleted');
}

// ── NAVIGATION ────────────────────────────────────────
function changeWeek(dir) { weekOffset += dir; renderAll(); }
function goToday()       { weekOffset = 0; renderAll(); }

function switchTab(tab, el) {
  activeTab = tab;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  el.classList.add('active');

  const titles = {
    tracker: 'Weekly Tracker', tasks: 'Daily Tasks', calendar: 'Calendar View',
    stats: 'Analytics', achievements: 'Achievements', leaderboard: 'Leaderboard', settings: 'Settings'
  };
  document.getElementById('page-title').textContent = titles[tab];

  const weekCtrl = document.getElementById('week-controls');
  weekCtrl.style.display = (tab === 'tracker' || tab === 'tasks') ? 'flex' : 'none';

  if (tab === 'stats') { ['line','doughnut','bar'].forEach(destroyChart); }

  renderAll();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function closeModal(id) { document.getElementById(id).classList.remove('show'); }

// ── KEYBOARD SHORTCUTS ────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'Escape') {
    closeModal('report-modal');
    closeModal('share-modal');
    closeAchPopup();
    closeLevelUpPopup();
    closeNotePopup();
  }

  if (activeTab === 'tracker' || activeTab === 'tasks') {
    if (e.key === 'ArrowLeft')  changeWeek(-1);
    if (e.key === 'ArrowRight') changeWeek(1);
    if (e.key === 't' || e.key === 'T') goToday();
  }

  if (activeTab === 'calendar') {
    if (e.key === 'ArrowLeft')  changeMonth(-1);
    if (e.key === 'ArrowRight') changeMonth(1);
  }
});

// ── INIT ──────────────────────────────────────────────
setQuote();
renderAll();
checkProgression();
fakeCompetitors = generateFakeCompetitors();
